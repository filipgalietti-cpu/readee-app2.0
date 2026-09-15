# Kindergarten Unit 1 — live rollout

September 15, 2026. The founder confirmed there is only the live Supabase project and explicitly requested activation ASAP. The staged proposal below is superseded by this controlled same-project rollout.

Completed: clean production-main branch; 779 passing tests; Node24/Turbopack production build and local browser checks; imported lesson hook errors fixed without changing authored content; immutable 3,249-file curriculum upload with public SHA-256 verification; additive migration202609150001 applied and recorded; actual live permissions/reward/stale-save/budget checks passed in a rolled-back synthetic transaction. Five unrelated pre-existing dashboard lint errors remain outside this integration.

Current activation sequence: protected candidate with Unit1 enabled against live Supabase using synthetic test accounts only; verify browser/API persistence, family isolation, assets and real Azure; merge the reviewed source and deploy to the live domain; verify again; delete synthetic accounts/readers. No existing family records are modified by tests. Synthetic profile emails are null and email delivery disabled.

Rollback: previous ready deployment `dpl_F4dr7M5RjxwRpPWtc5JMeXdceeut`, or disable `APPROVED_K_UNIT_ONE_ENABLED` and redeploy. Keep additive schema/history and versioned assets.

---

## Earlier proposed staging plan (retained for context; not an additional approval gate)


Prepared September 15, 2026. Release package `k1-2026-09-14`: eight founder-approved lessons and the ten-question Story Garden exam. Approval of the curriculum is recorded; the production integration still needs isolated staging validation.

## Verified release targets

| Item | Verified state |
| --- | --- |
| Production source | GitHub `filipgalietti-cpu/readee-app2.0`, `main`, `c0f77ed8aed5c3a0ae92e65e4b5171885ec8a591` |
| Clean release branch | `codex/k-unit-one-release`, `/private/tmp/readee-unit-one-release` |
| Vercel project | `readee-app2-0`, Node 24.x, Next.js/Turbopack; main is production branch |
| Current ready production deployment | `dpl_F4dr7M5RjxwRpPWtc5JMeXdceeut` |
| Existing Supabase | `rwlvjtowmfrrqeqvwolo.supabase.co`; no unit tables yet |
| Preview isolation | NOT ready: preview and production share Supabase and Stripe configuration |
| Preview protection | Vercel authentication enabled outside custom domains |
| Release switch | `APPROVED_K_UNIT_ONE_ENABLED`, absent/off remotely |

No credentials are included here. Vercel login works. Supabase SQL management access is not available in this tool session; schema metadata access is not DDL authorization or a migration runner.

## 1. Finish and preserve the clean candidate

Reconcile the approved package closure with the current main branch. Preserve current billing, assigned journey and speech lifecycle fixes. Run all repository tests, TypeScript, production build and local browser→API→SQL checks. Export source with before/after hashes and verify the asset bundle. Back up the candidate outside `/tmp`.

Do not merge the old `factory-backup` branch or the old integration worktree. They diverge from current main and contain unrelated work. No Git push has been made for this candidate; a push can create a Vercel preview automatically.

## 2. Establish isolated staging

Pending founder information: is there an existing separate Supabase test project? If yes, use it. Otherwise establish a test project or database branch before remote save/reward tests. Use schema plus synthetic accounts/children; do not copy family records. Verify required existing schema/function definitions from migrations or a sanitized schema snapshot before applying the additive migration.

Configure branch-specific preview values for Supabase URL, anon key and service-role key. These three must all target the same staging project. Keep Stripe in test mode, disable outbound email/background sends, and disable production analytics for synthetic runs. A protected preview URL is useful, but does not substitute for database isolation.

Keep `APPROVED_K_UNIT_ONE_ENABLED=false` until staging schema/assets are ready. Check that the value is scoped to this preview branch; never update a shared preview/production entry by accident. Live Azure testing can use the existing Speech resource for a small synthetic smoke check after its usage/cost is understood; no family recordings are required.

## 3. Apply and verify the additive migration in staging

File: `supabase/migrations/202609150001_approved_unit_sessions.sql`.

Do not bulk-push the repository migration history: historical factory and production migration numbering differs. Review and apply this one migration through the authorized SQL management path, recording its application. Confirm the existing `award_carrots` signature/body and dependent columns, then verify:

- User A reads only their child's sessions; User B cannot read or mutate them.
- Normal authenticated users cannot update tables or invoke service-only write/budget RPCs.
- Replayed completion writes award carrots and insert practice results once.
- Conflicting revisions return a recoverable conflict and preserve the earlier answer history.
- Deleting a synthetic child removes its sessions.
- The unit API validates selected answers and owned child IDs, rather than browser scores.

Local PGlite tests cover these mechanics; actual Supabase grants/triggers/RPC transport must also pass.

## 4. Publish assets as one immutable version

Manifest: `unit-one-assets.json`. The current complete bundle is about 271 MB. Prefer a versioned public asset directory using the existing storage/CDN infrastructure; these are curriculum assets, not child data. Avoid putting the audio catalogue into Git history just to ship a preview.

Set `APPROVED_UNIT_ASSET_BASE` to the HTTPS directory corresponding to `/lesson-studio/` (its children include `rhyme-time/`, `pips-tree/`, `audio/`, etc.). Next rewrites only `/lesson-studio/*`; shared icons/images/emojis remain in deployment public files. Upload only after selecting the target. Verify every manifest URL, content type and byte/hash match. Run a browser smoke check through the actual app origin to catch CSP/rewrite/cache failures.

Do not overwrite existing release assets in place. Retaining versioned assets makes rollback deterministic. The local public copies are available for testing and are included in the durable asset backup; the final source PR should omit the large generated media and require the CDN configuration before enablement.

## 5. Protected preview acceptance

Use a synthetic paid/trial parent and two synthetic children. Test actual navigation from dashboard/journey, all eight launch links, resume after closing/reopening, completed results, exam prerequisites and the ten-item exam. Check a second parent cannot load the first parent's child by changing the URL/API ID.

Also verify both current free cohorts: new signups get the existing one starter lesson; grandfathered families retain their existing allowance. This integration does not make the entire mixed-strand unit free.

Play one lesson end to end with a real microphone, finish Story Garden's two objective spoken items, verify genuine unavailable/permission-denied behavior, and inspect results/rewards after refresh. Confirm repeat celebration does not pay twice. Sample Chromebook/desktop, iPad and narrow-phone layouts, all images/audio loaded, no content clipped. The reviewed authoring lesson visuals do not need another curriculum rewrite.

Ensure existing placement and non-unit lessons still launch: they share the microphone infrastructure. No real payment, outbound email, production-family traffic or load test is needed.

## 6. Production activation

Only after staging passes: finalize the scoped PR, refresh against main if it moved, and review the exact candidate, asset version and migration together. Apply the additive migration to production through the authorized management path while the feature is off. Verify schema/grants without reading family records. Publish/verify the immutable production asset version, then deploy the candidate with the feature switch off first and smoke-test existing routes.

Enable `APPROVED_K_UNIT_ONE_ENABLED=true` in production and deploy the same approved source/config. Use a designated test account to verify one saved answer, resume and unit entry. Monitor failed saves, API errors, asset failures, speech unavailable/rate-limit responses and duplicate reward reports. Do not log child transcripts or recordings for this purpose.

## Rollback

Disable the feature switch and redeploy, or restore the recorded prior ready deployment. Existing lesson routes resume. Keep additive tables and recorded attempt history; do not undo rewards or drop tables as a UI rollback. Keep previous asset versions available.

## Known limits that remain visible

- Exam readiness is the approved provisional 80% rule, with incomplete/unavailable evidence distinct; it is not a validated diagnostic threshold.
- No automatic grade promotion, new placement algorithm, unit-exam adaptation or remedial reassignment is added by this integration.
- Completed packages reopen results; retakes need an explicit archived-attempt model before allowing reset/rewards again.
- Speech token mint limits reduce abuse but do not cap every audio second or parallel stream authorized by an Azure token.
- Local synthetic speech receipts do not prove live child microphone recognition. Staging microphone acceptance remains required.

Current status: no remote writes, asset uploads, credential changes, commits/pushes or deployments performed. The next external dependency is staging database isolation and an authorized SQL management path.
