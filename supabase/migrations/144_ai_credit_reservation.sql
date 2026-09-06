-- Atomic credit reservation for the AI generators.
--
-- checkRateLimit read ai_usage_log, summed the last hour and month in
-- application code, decided, and only then called the provider - which logged
-- afterwards. Two problems, and the second is the expensive one.
--
--   1. Check-then-act. Ten concurrent requests all read the same total, all
--      pass, and all spend. The cap bounds nothing under concurrency, which is
--      exactly the condition an abuser creates.
--   2. Only `success = true` rows counted. A provider call that runs, bills us,
--      and then fails validation left no trace against the budget at all, so
--      retry loops were free to the caller and not to us.
--
-- The fix is to reserve BEFORE spending. A reservation is an ai_usage_log row
-- written with success = false and a `reserved` marker; it counts against the
-- budget from the moment it exists. The generator settles it afterwards. A
-- crashed request leaves its reservation standing, which is the safe direction:
-- it expires out of the window rather than being silently forgiven.
--
-- Serialised per teacher with a transaction-scoped advisory lock, so one
-- family's traffic never blocks another's.

alter table public.ai_usage_log
  add column if not exists reserved boolean not null default false,
  add column if not exists settled_at timestamptz;

-- ‼️ DO NOT re-add an index here. 035 already created
-- ai_usage_log_teacher_time_idx on exactly (teacher_id, created_at DESC).
-- This migration originally added a duplicate under a different name; 147 drops
-- it. Check pg_indexes before adding an index to a table this old.

create or replace function public.reserve_ai_credits(
  p_teacher uuid, p_kind text, p_cost integer,
  p_hourly_limit integer, p_monthly_limit integer, p_topup integer default 0
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_hourly integer; v_monthly integer; v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_teacher::text, 0));

  select coalesce(sum(credits_used), 0) into v_hourly from ai_usage_log
   where teacher_id = p_teacher and created_at >= now() - interval '1 hour'
     and (success or reserved);
  select coalesce(sum(credits_used), 0) into v_monthly from ai_usage_log
   where teacher_id = p_teacher and created_at >= now() - interval '30 days'
     and (success or reserved);

  if v_hourly + p_cost > p_hourly_limit then
    return jsonb_build_object('allowed', false, 'reason', 'hourly',
      'hourly_used', v_hourly, 'monthly_used', v_monthly);
  end if;
  if v_monthly + p_cost > p_monthly_limit + coalesce(p_topup, 0) then
    return jsonb_build_object('allowed', false, 'reason', 'monthly',
      'hourly_used', v_hourly, 'monthly_used', v_monthly);
  end if;

  insert into ai_usage_log (teacher_id, kind, credits_used, success, reserved, request_summary)
    values (p_teacher, p_kind, p_cost, false, true, 'reserved') returning id into v_id;
  return jsonb_build_object('allowed', true, 'reservation_id', v_id,
    'hourly_used', v_hourly, 'monthly_used', v_monthly);
end; $$;

create or replace function public.settle_ai_reservation(
  p_id uuid, p_success boolean, p_model text default null,
  p_input_tokens integer default null, p_output_tokens integer default null,
  p_error text default null, p_summary text default null
) returns void language sql security definer set search_path = public as $$
  update ai_usage_log
     set success = p_success,
         -- A failed call still consumed the provider, so the row stays counted.
         reserved = not p_success,
         settled_at = now(),
         model = coalesce(p_model, model),
         input_tokens = coalesce(p_input_tokens, input_tokens),
         output_tokens = coalesce(p_output_tokens, output_tokens),
         error = coalesce(p_error, error),
         request_summary = coalesce(p_summary, request_summary)
   where id = p_id;
$$;

revoke all on function public.reserve_ai_credits(uuid, text, integer, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.settle_ai_reservation(uuid, boolean, text, integer, integer, text, text) from public, anon, authenticated;
