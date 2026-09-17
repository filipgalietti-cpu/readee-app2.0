# Unit exam gateway and per-question practice results

Local implementation, September 16, 2026. Not pushed, deployed or exercised against production data.

## Behavior

- Shared `AdaptivePractice` now goes from celebration to a persistent question-results screen rather than immediately exiting. Every asked question appears once, including whole matching and sorting activities. First independent outcomes survive retries. Supported reading and personal answers are not graded. A percentage appears only when all scored questions have independent evidence; missing audio, skips and help remain explicitly unresolved.
- The approved production player flushes pending saves and fetches canonical server results before showing the question grades. Failed saves/reads have a retry state. Local previews are labeled as local results.
- The released K Unit 1 is eight mixed-domain lessons plus Story Garden. The map now groups that actual membership ahead of later lessons for a reader assigned the whole unit. Existing three-stop scene pagination remains; it is not three different units. The exam is the next destination after the lessons. It is completed for progression only when saved readiness is `ready`.
- Existing readiness is preserved: 80% (8/10 for the current exam), regular-or-higher difficulty and complete independent coverage. Completing the sitting alone is not passing. A speech failure is not a wrong answer. This is a product readiness rule, not a validated diagnostic mastery score.
- `/learn` checks the gateway on the server; the legacy `/lesson` entry routes an applicable reader back to Unit 1. Look-ahead lesson launches also return to Unit 1. Billing locks and exam locks have different labels. The existing free starter stays the current accessible stop; this does not change the free-offer policy.
- An older reader assigned only selected K skills is not forced through the entire K unit. Later units do not yet acquire invented exam mappings.
- Non-ready completed exams can be retried. The authenticated, same-origin endpoint archives the prior graded result, resets the active sitting, and uses the existing revision-locked `save_approved_unit` RPC. Its completed latch preserves once-per-release carrots. The new celebration explains that retakes do not pay completion carrots again. Passed exams cannot be reset. Lost-response retries are idempotent; stale writers conflict. No migration is required.
- Wormy's package identity `RF.K.1` is reconciled with its authored RF.K.1a–c coverage. Previously the legacy navigation metadata did not contain the package's broad identity. No teaching content or answer keys changed.

## Review

`http://localhost:3336/demo/unit-results`

Synthetic preview: practice celebration → six outcome examples; before/after exam-gateway map. No remote accounts, speech service calls, reward or progress writes. The route inherits the existing production `/demo` exclusion.

## Verification

- 120 tests in 20 suites: approved server validation, independent practice grading, owned retry endpoint, invalid/cross-origin access, stale/lost retry requests, gate before/after readiness, older-reader exclusion, legacy completion exclusion, free starter and reward-ID compatibility, journey transitions and snapshot failures.
- TypeScript passes. Modified production source/new tests pass ESLint with six existing image-element warnings. The existing journey-load mock file retains two pre-existing `any` lint errors; its added test and TypeScript pass.
- Browser: real shared practice celebration transitions to all six question rows; details expand; mobile 390px has no horizontal overflow; desktop 1280px before/after maps stop at the exam and then advance. No page errors. Screenshots inspected.
- Existing SQL reward latch was inspected and the route payload tested. No live SQL, real voice, authenticated family flow or production build was exercised in this slice.

## Remaining launch work

- Integration/production build and a designated test-family run against Supabase before deployment; confirm exam retry, refreshed parent results and next-unit access against the actual saved rows.
- Register reviewed membership and exams for later units and partial custom units before extending this gate. This patch does not claim all 201 lessons have exam gates, nor retrofit legacy quiz runners with the new results page.
- Retakes reuse the existing reviewed question bank and selector; they are not guaranteed unseen items. Fresh equivalent forms and a stronger learner-model policy require separate reviewed content work.
- Earlier result history currently lives in the existing private result JSON (question IDs, outcomes and readiness; no added raw transcripts). History is retained on subsequent saves, but a historical-attempt browsing UI is not yet provided.
- Dashboard next-lesson recommendations still use the legacy catalogue; the server redirects gated launches correctly, but dashboard copy should be reconciled with the released-unit map next.
- Full winding map, white application shell, theatrical reveal, and final free-offer decision remain separate work. Fable's signup/attribution/live-report handoffs remain pending.
