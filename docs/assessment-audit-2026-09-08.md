# Assessment audit — September 8, 2026

## Fixes implemented locally

The three findings below are now addressed for new assessments. Nothing has been
deployed and existing assessment records have not been rewritten.

- Failed child/placement queries return HTTP 503, so the journey displays its
  retry state instead of silently discarding the custom plan.
- The speech adapter preserves Azure word offsets and durations. The runner
  scores the one-minute window after final recognition drains, using when words
  were spoken. It excludes words ending after the cutoff, removes recognition
  latency from early finishes, and offers a retry if timing evidence is missing.
- New submissions use evidence version 3. Each passage has its own comprehension
  check. Failed accuracy or comprehension leads to the next easier passage until
  both meet the existing thresholds (90% accuracy and at least 2/3 questions).
  Difficulty at grade 1 leads to foundations and the K listening task. The server
  validates the entire sequence and rejects incomplete or invented follow-ups.
  Placement and the journey use the demonstrated comfortable level; fluency is
  reported from that passage. The fifth-grade ceiling remains capped to grade 4
  in the available curriculum.
- Older completed submissions can still retry their save with their original
  evidence contract. Historical placements cannot gain missing passage evidence
  retrospectively; a retake is needed to reassess them with the new flow.

Validation: **415 tests passed across all 41 test files**, and TypeScript
(`tsc --noEmit --incremental false`) passed. The audit characterizations have been
converted into regressions. Added coverage includes timestamp conversion at the
speech adapter, late recognition, words spanning/after the cutoff, early finishes,
missing timing, all K–4 enrollment/reading combinations, accuracy-only and
comprehension-only passage difficulties, the ceiling-to-K descent, invalid
follow-ups, and retryable plan reads.

An isolated browser run with a synthetic fourth-grade child completed the real
`/assessment` redirect and runner, passed fourth-grade word lists, struggled with
grade-4/3 stories, succeeded at grade 2, and saved grade 2 through the actual
completion endpoint. A simulated database failure on the first save exposed the
retry button; the successful retry sent identical evidence. The database in this
test is a local mock, so this does not exercise PostgreSQL transactions or a real
microphone/provider session. No real family records or email services were used.

The saved plan's journey was also verified in the browser: its first unit was
second-grade Fact Finders, its first lesson was **RI.2.1, Asking Smart Fact
Questions**, and a simulated placement-read failure displayed the retry state.
The test browser allowed the local mock origin through CSP and used a forced
hover for the animated Start label; those were harness adjustments, not app
security or UI changes. Browser evidence is in
`/private/tmp/assessment-fixes-journey-result.json` and
`/private/tmp/assessment-fixes-journey.png`.

The original audit below records the before-fix findings and test limitations.

Before committing, the isolated `fix/assessment-reliability` branch was tested
again: **426 tests passed across 43 files**, and TypeScript passed. Its test count
differs from the shared workspace because the branch already contains additional
committed regression tests. The live-device procedure is documented in
[assessment-live-microphone-checklist.md](assessment-live-microphone-checklist.md).

The normal enrollment-to-placement-to-journey mapping works in local tests, but
the assessment is not ready for an unconditional reliability sign-off. Two
technical bugs and one diagnostic limitation were reproduced. This audit added
tests and this report; it did not change application behavior or deployed data.

## Confirmed behavior

- `/assessment` redirects to `/placement` with query parameters preserved unless
  `NEXT_PUBLIC_PLACEMENT_V2=0`. The legacy quiz is a separate, opt-out flow.
- Enrollment comes from the stored child record. The completion route validates
  the submitted enrollment against that record and computes placement server-side.
- All 25 combinations of enrolled K–4 and demonstrated word-reading K–4 passed
  using bank-valid submissions and the actual validator, decision, plan, and
  journey functions. For enrolled grade 4 / reading grade 2, placement is grade 2,
  the relative label is two grade levels below, the journey starts at the plan's
  second-grade unit, and the plan targets the fourth-grade bar.
- The completion route passes placement, assessment, reading level, and initial
  skill memory to one database function. Existing tests cover failure, replay,
  ownership rejection, evidence rejection, and rate-limit responses using mocks.
- Read-only checks of the configured Supabase database returned HTTP 200 for the
  `placements.session_id` column and confirmed `/rpc/complete_placement` in its
  API schema. The September 7 note that migration 149 was unapplied is outdated
  for this database. Function existence does not establish transaction correctness.

## Findings

1. **High — failed plan reads silently remove personalization.**
   `app/api/placement/result/route.ts:21` discards the query error. A simulated
   database failure returns HTTP 200 with `{ ok: true, result: null }`.
   `lib/journey/load-placement.ts` accepts that as a legitimate missing plan.
   The dashboard and journey then use their reading-level fallback, losing
   assessment-specific foundation work, skips, and first-unit ordering. The
   result endpoint should return a retryable error for failed reads, and reserve
   an empty result for a successful query with no placement.

2. **High — recognition arrival time corrupts the one-minute rate.**
   `app/(protected)/placement/_components/PlacementRunner.tsx:260` freezes the
   rate from finalized phrases received by the timer callback. Later final
   recognition results are included in the whole-read accuracy but never repair
   the frozen rate. A controlled test of the actual runner callback delivers 70
   correct reference words at 61 seconds: the final read records 70 correct, but
   the rate window records zero. The fixture models a delayed final result; it
   is not a measurement of how often this happens with Azure or real children.
   The adapter currently discards word timing information, so there is no way
   to distinguish pre-cutoff speech from speech actually spoken after the cutoff.
   Preserve recognition word offsets/durations and finalize rate by spoken time,
   including late results for words inside the window. Do not count every result
   received after 60 seconds: that would include post-cutoff speech. This affects
   rate, percentile, fluency seeds, and growth milestones, not the decoding-derived
   placement band directly.

3. **High for placement accuracy — passage struggles never trigger an easier
   passage to establish a comfortable level.**
   `lib/placement/decide.ts:148` lowers the word-list placement by at most one
   grade for weak passage accuracy or comprehension, even when both are weak.
   A valid grade-4 submission with fourth-grade word lists passed, 20/100 passage
   words correct, and 0/3 comprehension answers still places at grade 3. No
   third- or second-grade passage was administered. This does not prove the child
   should be placed at grade 2; it proves the evidence does not establish that
   grade 3 is comfortable. To meet the broader intended behavior, add lower-band
   passage/comprehension follow-ups when word recognition and connected-text
   reading disagree. Have the reading specialist approve stop/pass criteria.

## Validation and limits

`npm test -- tests/placement-*.test.ts tests/assessment-audit*.test.ts`
completed with **166 tests passing across 13 files**. This comprises the 138
existing tests and 28 new audit cases. Three audit cases characterize the
reproduced problems; their passing status does not mean those problems are fixed.

New files: `tests/assessment-audit.test.ts` and
`tests/assessment-audit-result-route.test.ts`. Convert the bug characterizations
to desired-behavior regressions when fixing the corresponding code.

Browser automation against the existing local server on port 3211 rendered a
blank demo page and timed out waiting for the runner, including after a retry
that allowed development reloads. This is an unresolved local browser check,
not evidence of the same failure in production. Real microphone/speech-provider behavior and authenticated
save-to-reveal-to-journey navigation are not verified by this audit. No real
child records were read or written, no assessment completion was submitted to
the connected database, and no parent emails were triggered. Database rollback
and concurrent replay still need an isolated integration test.

The old quiz reachable with `NEXT_PUBLIC_PLACEMENT_V2=0` remains problematic:
its grade-4 exam samples only grade-3/4 questions, stops after three consecutive
wrong answers, and applies a fixed raw-points grade table. It cannot establish
a second-grade floor from lower-grade evidence. Its two save operations also
ignore errors. These findings are conditional on enabling that legacy path.
