-- 120_security_hardening_revoke_public.sql
-- Follow-up to 119. Postgres grants function EXECUTE to the PUBLIC role by default,
-- and anon/authenticated inherit it THROUGH public — so 119's "revoke from anon,
-- authenticated" was a no-op. This revokes from PUBLIC on the two functions that are
-- unambiguously internal (trigger bodies, never called via app .rpc()). Triggers fire
-- regardless of caller EXECUTE, so this is safe. Verified: anon/authenticated can no
-- longer execute them.
--
-- Deliberately NOT revoked (needs care, not a blanket revoke):
--   • auth_* RLS-helper functions — RLS policies require the querying role to keep
--     EXECUTE; the correct fix is moving them to a private (non-API) schema.
--   • public-page / invite-flow functions (bump_community_view, find_school_by_join_code,
--     get_invite_by_token, claim_roster_invite, …) — may legitimately need anon.
--   • match_content_embeddings, quarantine/unquarantine_question,
--     parent_approved_submission_count — revoke anon only AFTER confirming each call's
--     auth context (revoke from public + re-grant to authenticated/service_role).

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
      execute format('revoke execute on function public.%I(%s) from public, anon, authenticated', r.proname, r.args);
    exception when others then
      raise notice 'skip revoke %(%): %', r.proname, r.args, sqlerrm;
    end;
  end loop;
end $$;
