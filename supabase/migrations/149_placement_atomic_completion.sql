-- Apply before deploying the corresponding completion route. No backfill.
alter table public.placements add column if not exists session_id text;
create unique index if not exists placements_child_session_idx
  on public.placements(child_id, session_id) where session_id is not null;

-- Service-role only: ownership is checked again inside the transaction.
create or replace function public.complete_placement(
  p_parent uuid, p_child uuid, p_session text, p_placement jsonb,
  p_assessment jsonb, p_seeds jsonb
) returns table(placement_id uuid, replayed boolean)
language plpgsql security invoker set search_path = public, pg_temp as $$
declare v_id uuid; s jsonb;
begin
  if length(p_session) not between 1 and 64 then raise exception 'invalid session'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_parent::text, 0));
  if not exists(select 1 from public.children where id = p_child and parent_id = p_parent) then
    raise exception 'child not found' using errcode = '42501';
  end if;
  select id into v_id from public.placements where child_id = p_child and session_id = p_session;
  if found then return query select v_id, true; return; end if;
  if (select count(*) from public.placements p join public.children c on c.id = p.child_id
      where c.parent_id = p_parent and p.created_at > now() - interval '24 hours') >= 8 then
    raise exception 'placement daily limit' using errcode = 'P0001';
  end if;
  insert into public.placements(child_id, session_id, enrolled, decision, evidence, moments, plan,
    narration, passage_recording_path, duration_seconds)
  values(p_child, p_session, p_placement->>'enrolled', p_placement->'decision', p_placement->'evidence',
    p_placement->'moments', p_placement->'plan', p_placement->'narration',
    p_placement->>'passage_recording_path', (p_placement->>'duration_seconds')::integer)
  returning id into v_id;
  insert into public.assessments(child_id, grade_tested, score_percent, reading_level_placed, answers, dimension_profile)
  values(p_child, p_assessment->>'grade_tested', (p_assessment->>'score_percent')::integer,
    p_assessment->>'reading_level_placed', '[]'::jsonb,
    (p_assessment->'dimension_profile') || jsonb_build_object('placementId', v_id));
  update public.children set reading_level = p_assessment->>'reading_level_placed' where id = p_child;
  -- Retakes must not erase the practice history maintained by learning triggers.
  for s in select value from jsonb_array_elements(p_seeds) loop
    insert into public.child_skill_memory(child_id, standard_id, ease_factor, interval_days,
      consecutive_correct, next_due, total_correct, total_attempted, last_practiced_at, updated_at)
    values(p_child, s->>'standard_id', (s->>'ease_factor')::real, (s->>'interval_days')::real,
      (s->>'consecutive_correct')::integer, (s->>'next_due')::timestamptz,
      (s->>'total_correct')::integer, 1, now(), now())
    on conflict(child_id, standard_id) do nothing;
  end loop;
  return query select v_id, false;
end;
$$;
revoke all on function public.complete_placement(uuid, uuid, text, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.complete_placement(uuid, uuid, text, jsonb, jsonb, jsonb) to service_role;
