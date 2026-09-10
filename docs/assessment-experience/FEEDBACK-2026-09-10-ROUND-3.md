# Assessment live feedback, round 3

Each item is tracked independently. No private child data is stored here.

| ID | Feedback | Acceptance | Status |
|---|---|---|---|
| R01 | Child says hello and their name | Hello followed by spoken name capture before reading; existing written name preserved. | Implemented; browser verified capture, preview and continue. |
| R02 | Rabbit belongs on the left | Left position on word, greeting, parent and passage layouts, with controls clear. | Implemented; desktop/390px/320px placement checked. |
| R03 | Word card jumps when speech ends | Identical word-card geometry during connecting, listening, response and next-word states. | Verified less than 1px movement across connecting/listening/thinking. |
| R04 | Speech after thinking is ignored | Thinking does not stop recognition or require a hidden retry tap; silence remains unscored. | Verified real Azure recognition with fixed speech after 8s and 20s silence. |
| R05 | Question TTS varies in speed/quality | Audit actual session clips, standardize delivery controls, regenerate outliers and verify transcripts. | 16 revised/new clips transcript-matched; fastest question clips paced at no more than 165 approximate words/minute. |
| R06 | Report advances too quickly | Advance only after successful full narration and a reading pause; missing/failed audio holds. | Implemented; full narration plus 6s reading pause, mute and missing audio hold. |
| R07 | Middle report slides have no TTS | Await late clips, retry failures visibly, recover missing narration server-side. | Implemented; current-card audio arrival restarts playback; owned-report retry preserves existing clips. |
| R08 | Completion audio plays on previous screen | One completion message, spoken on the matching celebration screen. | Implemented; completion clip plays on celebration, saving screen stays silent. |
| R09 | Positive sound after stories | Completion chime before questions, independent of correctness. | Implemented; unscored completion chime before the questions transition. |
| R10 | Questions difficult even for an adult | Review exact administered questions and difficulty/wording, preserve K–4 adaptive ceiling. | Reviewed 10 administered language items and both passages; simplified wording and supplied missing context without changing answer keys or placement thresholds. |
| R11 | Review this exact saved exam | Verify saved responses, level, narration availability and question IDs without altering answers. | Verified Grade 4 confirmation; one narration clip missing. |

## Verification

- 583 tests pass; TypeScript passes.
- 126 presentation states pass without overflow or database writes.
- The saved assessment confirms fourth-grade independent reading above third-grade enrollment. Its answers and decision are unchanged.
- All 16 changed/new public clips have matching transcripts and current content hashes.
- Fixed-recording Azure tests establish delayed speech handling, not microphone accuracy with real children, accents, background noise or physical iOS devices. Those still need a live session.
- A reduced-motion hydration mismatch found during browser checks was also repaired.
- Subjective voice quality and reading difficulty still benefit from Jennifer’s review; these checks do not establish standardized grade-equivalent validity.
