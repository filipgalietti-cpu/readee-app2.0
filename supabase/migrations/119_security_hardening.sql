-- 119_security_hardening.sql
-- Security hardening from `get_advisors(security)` (Aug 2026).
--
-- Current posture: 0 critical, 0 errors. Children/PII tables already RLS-protected
-- (migrations 115/116). This is defense-in-depth to clear the warnings before scale.
-- CONSERVATIVE — cannot break production:
--   A: pin search_path on OUR flagged functions (behavior-preserving, fault-tolerant).
--   B: lock down functions the app NEVER calls via .rpc() (verified by grep).
--   C: drop only the `anon` grant on signed-in-only functions (keeps `authenticated`).
--   D/E: recommended but COMMENTED — enable after the noted checks.
--
-- The auth_* RLS-helper functions are intentionally NOT revoked: RLS policies that
-- call them need the querying role to keep EXECUTE. Section A still pins their path.
--
-- Non-SQL follow-ups are listed at the bottom.

-- ─────────────────────────────────────────────────────────────────────────
-- Section A — Pin search_path on OUR flagged functions only.
-- Scoped to SECURITY DEFINER funcs + the specific trigger/util funcs the advisor
-- flagged, so we never touch extension-owned functions (e.g. pgvector). Each ALTER
-- is wrapped so one failure can't abort the batch.
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare r record;
begin
  for r in
    select p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and (
        p.prosecdef
        or p.proname = any (array[
          'update_updated_at_column','handle_new_user','match_content_embeddings',
          'tg_child_skill_memory_updated_at','tg_classrooms_touch','touch_custom_lessons_updated_at',
          'touch_custom_books_updated_at','touch_differentiated_passages_updated_at',
          'tg_intervention_plans_updated_at','tg_child_ai_content_updated_at',
          'tg_community_passages_updated_at','touch_learning_paths_updated_at',
          'touch_personalized_stories_updated_at','tg_student_iep_goals_updated_at',
          'discovery_articles_touch_updated_at'
        ])
      )
  loop
    begin
      execute format('alter function public.%I(%s) set search_path = pg_catalog, public', r.proname, r.args);
    exception when others then
      raise notice 'skip search_path %(%): %', r.proname, r.args, sqlerrm;
    end;
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- Section B — Revoke EXECUTE from anon AND authenticated on internal-only
-- functions (trigger bodies / server-invoked). NOT called via supabase.rpc()
-- anywhere in the app (verified). Triggers still fire — that doesn't need a grant.
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare r record;
begin
  for r in
    select p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('handle_new_user', 'apply_skill_memory_update')
  loop
    begin
      execute format('revoke execute on function public.%I(%s) from anon, authenticated', r.proname, r.args);
    exception when others then
      raise notice 'skip revoke %(%): %', r.proname, r.args, sqlerrm;
    end;
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- Section C — Revoke EXECUTE from `anon` ONLY on functions the app calls from a
-- signed-in / server context. Keeps `authenticated` so the app keeps working.
--   VERIFY (follow-up): each should confirm the caller internally
--   (auth.uid()/owner check) — tracked separately, not done here.
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare r record;
begin
  for r in
    select p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('quarantine_question','unquarantine_question',
                        'parent_approved_submission_count','match_content_embeddings')
  loop
    begin
      execute format('revoke execute on function public.%I(%s) from anon', r.proname, r.args);
    exception when others then
      raise notice 'skip revoke-anon %(%): %', r.proname, r.args, sqlerrm;
    end;
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- Section D (COMMENTED — enable after confirming B2B is dead) — deprecated
-- classroom join-by-code functions. Still referenced by (dead?) B2B routes.
-- ─────────────────────────────────────────────────────────────────────────
-- do $$
-- declare r record;
-- begin
--   for r in
--     select p.proname, pg_get_function_identity_arguments(p.oid) as args
--     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--     where n.nspname = 'public'
--       and p.proname in ('get_invite_by_token','find_teacher_referral',
--                         'find_school_by_join_code','find_live_session_by_code',
--                         'claim_roster_invite')
--   loop
--     execute format('revoke execute on function public.%I(%s) from anon', r.proname, r.args);
--   end loop;
-- end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- Section E (COMMENTED — recommended hygiene) — stop non-privileged roles from
-- creating objects in `public`. Verify nothing relies on runtime object creation.
-- ─────────────────────────────────────────────────────────────────────────
-- revoke create on schema public from anon, authenticated;
-- revoke create on schema public from public;

-- ═════════════════════════════════════════════════════════════════════════
-- NON-SQL follow-ups (Supabase dashboard / separate):
--   1. Auth → enable "Leaked password protection" (HaveIBeenPwned). Free toggle.
--   2. Move `vector` extension out of `public` (RISKY — own tested migration).
--   3. Enable Point-in-Time Recovery / daily backups.
--   4. Re-run get_advisors(security) after applying.
-- ═════════════════════════════════════════════════════════════════════════
