# Live microphone acceptance check

Use the deployed preview of `fix/assessment-reliability` with real speech-service
configuration and a dedicated test parent/child. The local synthetic browser
server used during development does not exercise a microphone or Azure.

Set the test child's enrollment to fourth grade. Open
`/assessment?child=<test-child-id>&retake=1` on the preview. Do not add `robot=1`.
Retakes change that test child's placement and can send its parent a report, so
use your own test inbox. The completion API limits new sessions to eight per
parent in 24 hours; retries of an already saved session are exempt.

## First: scripted adult runs

Have one adult read and another observe. Capture the screen and microphone audio
with a visible stopwatch if available. Record the deployed commit, device,
browser, passage titles, and the final report. Do not coach children into making
intentional mistakes; use adults for these controlled failure cases.

| Run | What to do | Expected result |
| --- | --- | --- |
| Clean reading | Read words and passages clearly; answer the questions correctly. | No capture errors or unexpected zero-rate result. Placement follows the demonstrated level, capped at the available fourth-grade curriculum. |
| Fourth-grade enrollment, second-grade reading | Pass the third- and fourth-grade word lists; say “I don't know” for the ceiling list. On the grade-4/3 stories, deliberately misread enough words to fall below 90% accuracy and answer 0/3 questions. Read the second-grade story accurately and answer at least 2/3 correctly. | Stories descend 4 → 3 → 2. Report says second-grade placement/two grade levels below. The first journey unit matches the report's plan. |
| Comprehension difficulty | Read the harder passages accurately, but answer 0/3 until the second-grade story. | Easier passages still appear; good word pronunciation alone does not keep placement too high. |
| Slow reading and pauses | Read naturally, with decoding pauses, and continue beyond one minute. | Whole-read accuracy includes the completed read; the one-minute rate includes only words finished by the cutoff. |
| Finish before one minute | Read a passage accurately to its end in under a minute. | Rate uses the speech endpoint rather than extra time waiting for recognition to finish. |

For the timing checks, review the recording and independently mark which words
were correctly finished in the first 60 seconds of capture. For an early finish,
calculate `correct words / elapsed speech seconds × 60`. Compare against the
report and, when investigating a discrepancy, the request body of
`POST /api/placement/complete` in browser developer tools. Relevant fields:
`evidenceVersion`, `passages[].band`, `wordsCorrect`, `wordsTotal`,
`minuteWordsCorrect`, `minuteSeconds`, and `comprehensionChecks`.

The acceptance goal is no unexplained timing/word-count discrepancy. Document
each disagreement and inspect the recognition evidence; do not pick a convenient
tolerance and call the placement calibrated. The existing automatic tests cover
precise delayed-result and cutoff cases that are difficult to reproduce by hand.

## Then: recovery checks

1. Deny microphone access initially. Confirm the blocked-microphone screen.
   Allow access and retry; the run should start normally.
2. Disconnect an external microphone or interrupt the network during a word or
   passage. Restore it and use “Try this part again.” The interrupted capture
   must not become an incorrect answer or a zero-rate passage.
3. Interrupt the final save. Restore the connection and use “Save my results
   again.” The same answers must save without repeating the assessment. A
   same-tab refresh after a completed failed save should offer recovery too.
4. Open the saved report, dashboard, and journey. Confirm the enrolled grade,
   reading placement, and first recommended unit agree. Reload them to confirm
   the result was persisted.

Repeat a clean run and the microphone-permission check on the devices families
will actually use: a Chromebook/Chrome laptop, iPad/Safari, and phone. Run the
controlled adult checks first, then have the reading specialist compare a small
set of supervised children's readings with her own scoring. Device functionality
and educational placement accuracy are separate checks.

## Record each run

| Commit/device/browser | Scenario | Passage bands | Manual vs app rate | Placement | First journey unit | Retry outcome | Issue/evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | |

Share the test run ID, device/browser, screenshot, expected versus actual result,
and any relevant console/network error for a failure. Keep recordings and request
exports in a private review location; do not commit child audio or session tokens.
