-- Content owners could approve their own submissions.
--
-- RLS cannot restrict WHICH columns an update touches, so an owner-scoped
-- UPDATE policy grants the whole row:
--
--   parent_testimonials  self_insert / self_update check only
--                        user_id = auth.uid(), so a parent could submit or edit
--                        their own testimonial with approved = true, and
--                        /api/public-testimonials serves exactly
--                        `approved = true`. Straight to the marketing site.
--
--   community_passages   "Parents withdraw their own community submissions"
--                        checks only source_parent_id = auth.uid(), so an owner
--                        could set status = 'approved', and the public read
--                        policy is `status = 'approved'`. Straight in front of
--                        children, unreviewed.
--
-- Neither is exploitable through the UI; both are one PostgREST call away.
--
-- ‼️ THIS MIGRATION IS A NO-OP ON ITS OWN - see 146. A column-level REVOKE
-- cannot cut into a TABLE-level grant. Kept so the history replays honestly.
revoke update (approved, approved_at, approved_by) on public.parent_testimonials from authenticated;
revoke insert (approved, approved_at, approved_by) on public.parent_testimonials from authenticated;
revoke update (approved, approved_at, approved_by) on public.parent_testimonials from anon;
revoke insert (approved, approved_at, approved_by) on public.parent_testimonials from anon;

revoke update (status, qc_status, auto_approved) on public.community_passages from authenticated;
revoke insert (status, qc_status, auto_approved) on public.community_passages from authenticated;
revoke update (status, qc_status, auto_approved) on public.community_passages from anon;
revoke insert (status, qc_status, auto_approved) on public.community_passages from anon;
