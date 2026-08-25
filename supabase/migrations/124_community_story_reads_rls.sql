-- 124: close the open-table hole on community_story_reads.
--
-- The table's ONLY writer is the record_community_read() SECURITY DEFINER
-- function (definer bypasses RLS), invoked with the service role from
-- /api/community/read. No client code touches the table directly — verified
-- Aug 2026 (zero references in app/lib). Without RLS, anyone with the public
-- anon key could insert fake reads or dump reader_keys via PostgREST.
-- Deny-all is intentional; same pattern as lifecycle_email_sends.

alter table public.community_story_reads enable row level security;
revoke all on public.community_story_reads from anon, authenticated;

comment on table public.community_story_reads is
  'Dedup log for community passage read counts. Written only via record_community_read() (SECURITY DEFINER, service-role invoked). RLS deny-all by design.';
