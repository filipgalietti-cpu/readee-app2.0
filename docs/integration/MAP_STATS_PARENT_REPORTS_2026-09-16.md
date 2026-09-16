# Corrected flow: map stats for children, progress reports for parents

This supersedes the child-facing report-screen behavior in `UNIT_GATEWAY_RESULTS_2026-09-16.md`. The founder clarified that the child should keep moving through the journey, with stats available on completed nodes. Detailed reports belong to the parent.

## Implemented locally

- Lesson practice and unit exam celebration return to the journey after the serialized save completes. The completed standard is passed back for the existing verified bunny transition. No mandatory question-report screen interrupts the child.
- Completed journey nodes show a compact card on mouse hover, keyboard focus or touch. It includes saved independent correct/checked counts, percentage when evidence permits, support/missing-evidence counts and awarded carrots. No synthetic zero is substituted for a historical result without a breakdown. Revisit is a separate explicit button; opening stats never starts a replay. Escape, close and outside tap dismiss the card. It is rendered outside the clipped map canvas and constrained to the viewport.
- Map data comes from the owned server snapshot and canonical approved-session results, projected to compact stats without transcripts or submissions. Currently available for the released approved unit; old runners without detailed stored results show that limitation.
- `/learn/unit-one/report?child=...` is a private parent report with per-question outcomes, explanations and difficulty. It checks authenticated ownership before reading sessions. Unit exam readiness and parent-triggered retry live here. An unfinished retake remains resumable from the unit menu.
- The existing opted-in weekly parent digest includes recently updated approved lesson results and a protected report link. No new send-on-completion job was introduced. The requested email frequency is still open; the founder was offered weekly plus unit results, weekly only, or every lesson. No emails or cron jobs were triggered during this work.
- Auth redirects retain the report's child query parameter. This is a narrow part of Fable HANDOFF-F1, not completion of signup/OAuth destination work.
- The previous `/demo/unit-results` redirects to `/demo/journey-progress`, which presents the map first. Its stats and parent report are explicitly synthetic. Selecting the next node simulates saved completion only in this demo.

## Verification

127 tests / 23 suites passed, covering existing gate/scoring/retry behavior plus compact stats, parent result validation, login/ownership/failure checks, and rendered parent email HTML/text. No provider send was executed. TypeScript passes. Scoped lint on changed components and new helpers/tests: zero errors, image-element warnings; legacy digest/proxy lint debt was not broadened into this task.

Actual local Chromium: desktop hover, pointer movement into the card, Escape, keyboard focus, mobile touch remaining open, bounded card geometry, parent question details, and synthetic next-section progression all passed. No browser page errors. Screenshots were viewed. An unauthenticated HTTP request verified the login redirect preserves the full parent-report destination, including child ID.

Not performed: production build/deploy, real family progress writes, live email delivery, OAuth round trip or real-child microphone testing. Existing free allowance, exam threshold and once-per-release reward rules remain unchanged. Later approved units can populate the same stats/report mechanics when their canonical saved results are wired.
