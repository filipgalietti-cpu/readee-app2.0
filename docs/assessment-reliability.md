# Assessment reliability and journey integration

Local implementation, September 7, 2026. Nothing deployed; migration 149 is
prepared but has not been applied.

## Behavior

- Failed recognition startup, reported Azure errors, and microphone disconnects
  interrupt capture and offer a retry of that part. They do not count as wrong
  word answers. No recognized passage evidence also requires retry.
- Foundation taps made while narration plays are retained.
- Completed submissions have a stable session UUID. Failed saves can be retried
  without repeating the assessment. A same-tab refresh can recover a completed
  submission from sessionStorage for up to 24 hours. The draft is removed after
  a successful save. This does not checkpoint an unfinished exam or retain audio.
- Server validation reconstructs the word ladder using the fixed bank and
  verifies enrolled grade, completed stages, counts, passage bounds, and the
  rate-window fields. Parent-facing moments are rebuilt from validated evidence.
- One service-role-only database transaction saves placement, assessment,
  reading level, and initial skill-memory entries. Retakes preserve existing
  practice history. Retrying a session returns its saved placement; it does not
  schedule another narration/email job. New sessions are capped at eight per
  parent per rolling 24 hours; retries of saved sessions are exempt.
- Explicit foundation weaknesses prevent foundational-unit skips and bring the
  kindergarten foundation unit onto the path. Story comprehension does not skip
  nonfiction. These conservative teaching rules still need Jennifer's review.
- Dashboard and journey consume the plan's starting unit and skips. Content
  outside the assigned path is omitted rather than credited as completed work.
- Older stored plans are recalculated on report/result reads using their original
  evidence and date. Their old narration audio is not reused when the plan changes;
  regenerated captions explain the corrected plan. No historical rows are rewritten.
- Failed report loading has an explicit retry state.

## Verification and release order

1. Review `supabase/migrations/149_placement_atomic_completion.sql` and run it in
   an isolated development/staging database before deploying the route. This
   environment has no PostgreSQL server/CLI, so the transaction has not been
   executed here. There is deliberately no fallback to the old partial writes.
2. Exercise rollback by failing an assessment/child update; verify no placement
   remains. Submit the same session twice concurrently; verify one placement and
   assessment, with the second response marked replayed. Verify ownership, rate
   limits, and preservation of existing skill-memory history.
3. Test normal capture and microphone denial, unplug, network interruption, token
   failure, and save-response loss on Chromebook, iPad, and phone. Verify retries
   preserve answers and that the first journey unit matches the report.
4. Release the application only after the migration and these checks pass.

Local regression tests cover bank-evidence validation, plan/journey agreement
across K–4, API transaction failure/replay behavior, cross-parent rejection, and
the actual runner callbacks for capture failure, early taps, and save retries.
The runner tests use mocked hooks and services; they are not browser/device tests.

## Remaining limits

- Browser-originated speech scores are still client evidence. Consistency checks
  do not prove that a child spoke; stronger integrity requires server-owned
  assessment sessions and verified recognition evidence.
- Speech accuracy thresholds, final-result latency at the one-minute boundary,
  and parent-facing rate/percentile calibration remain unchanged. Validate these
  against Jennifer-scored recordings before claiming calibrated placement accuracy.
- Narration generation is still an `after()` job, not a durable queue. Captions
  remain available if provider generation fails.
- Historical partial saves are not repaired by this migration. They require a
  separate reviewed reconciliation of existing placement and child records.
