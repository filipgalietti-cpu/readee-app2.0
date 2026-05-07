-- Lock down two QC tables that were created without RLS on the
-- remote (in migrations 091-094 that aren't checked in locally).
--
-- The advisor flagged both as ERROR-level: any authed user could
-- read every regen log entry and every quarantined question id.
-- Service role (used by supabaseAdmin() and the cron) bypasses RLS
-- automatically, so the QC bot continues to operate without code
-- changes.

alter table public.content_qc_log enable row level security;
create policy content_qc_log_admin_read
  on public.content_qc_log for select to authenticated
  using (
    exists (select 1 from public.admin_memberships am
            where am.profile_id = (select auth.uid()))
  );

alter table public.question_qc_status enable row level security;
create policy question_qc_status_admin_read
  on public.question_qc_status for select to authenticated
  using (
    exists (select 1 from public.admin_memberships am
            where am.profile_id = (select auth.uid()))
  );
