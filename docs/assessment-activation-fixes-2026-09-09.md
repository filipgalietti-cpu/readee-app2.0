# Assessment and first-lesson fixes — September 9, 2026

## Changes

- A word timeout without a recognized response now stops and drains recognition,
  then requests a retry of the same item. It does not return an incorrect verdict
  or advance the reading ladder. Draining is bounded to four seconds, and late
  final speech can still produce a measured answer. Recognized wrong readings,
  spoken “I don’t know,” and intentional skip taps remain valid unsuccessful
  answers. The recovery message explains that nothing was marked wrong.
- The saved-assessment screen immediately offers the child their first lesson.
  The parent report is a separate link. Neither the child’s button nor the
  report’s primary button opens checkout or promises a subscription trial.
- `/placement/start` resolves the first lesson from the saved custom plan.
  `/learn` checks parent ownership and grants the first assigned unit free access,
  including units outside the catalogue’s default free domain. The dashboard and
  journey use the same allowance. Enrollment grade remains distinct from reading
  placement: a fourth grader placed at second grade starts the assigned
  second-grade unit, or targeted foundations when the evidence calls for them.
- The lesson completion screen links back to the child’s journey. On phones,
  the lesson shell stacks its panels, scrolls long reading passages and answer
  choices, and keeps progress, close, and Next controls within the viewport.
- Analytics distinguish a click toward the free lesson from a checkout attempt.
  Viewing the optional parent report still records `funnel.report_view`.

## Verification

- All **439 tests in 44 files** pass; `npx tsc --noEmit` passes.
- New regressions exercise the actual word-list callbacks for silence,
  omission-only output, delayed final speech, a hung recognizer, startup errors,
  explicit spoken skips, and skip taps.
- Server-route tests cover placement-derived free access, unauthorized child IDs,
  failed database reads, the actual first-lesson redirect, and continued gating
  of other premium units.
- An isolated Chromium run at 390 × 844 used a synthetic free parent and a
  fourth-grade child with a saved second-grade placement. It followed the actual
  reveal → start → `/learn?standard=RI.2.1` route, completed all 18 scenes of
  **Fact Finders Ask**, submitted one completion with 13/13 correct answers to
  the local mock database, and returned to `/journey`.
- All 44 requested lesson assets returned HTTP 200 from the configured public
  asset storage; narration reached the browser’s `playing` event. Reading text
  was visible, and answer choices were clicked without forcing pointer events.
  No checkout requests or app runtime errors occurred. Playwright’s intentional
  service-worker block is excluded from runtime errors.

## Limits and follow-up

Speech responses in the browser run were synthetic. It verifies navigation,
rendering, asset playback, scoring integration, and the save request, not a
physical microphone, Azure recognition quality, or a real database write. Follow
[the live microphone checklist](assessment-live-microphone-checklist.md) with a
free test account on the deployed preview before calling device testing complete.

Historical placements were not rewritten and no families were emailed. Missing
passage recordings alone do not prove silent word-list recognition: the K path
has no recorded passage. Missing evidence cannot establish a corrected reading
level; affected families need a retest. This change does not alter pricing,
parent-digest scheduling, advertising, or rewards policy.
