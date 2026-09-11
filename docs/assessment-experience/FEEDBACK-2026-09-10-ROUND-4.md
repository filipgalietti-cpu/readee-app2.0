# Live assessment feedback, round 4

| Item | Change | Verification |
| --- | --- | --- |
| Post-signup skeleton | One full-screen Readee transition across protected loading, terms lookup, dashboard lookup and reader-setup redirect; removes the unrelated dashboard-card flash. | Full-screen browser preview verified. |
| Name screen missing Luna | Name recording owns a large voice-reactive Luna; playback uses its actual audio analyser. | Browser capture/preview check. |
| Name recognition does not translate pronunciation | Listen to the sounds without supplying the written name as an anchoring hint; automatically preview the pronunciation; rerecord inline. Remove technical spelling and Settings instructions from the child view. | Fixed pronunciation audio yields fi-LOOSH; real child names still need live checks. |
| Rabbit too small | Larger left companion on desktop and phones, with room reserved for skip controls. | 126 viewport states; small-screen screenshots. |
| Spoken uncertainty should skip | Both final and partial recognition handle I don’t know and I’m not sure, along with explicit pass/skip variants. | Positive/negative phrase tests plus real Azure audio. Pronunciation alignment returned empty text; a separate unscored command recognizer now captures the skip. |
| Kindergarten sees Nia immediately | New sessions begin connected reading at enrollment or the lower word band. A demonstrated story/information pair is needed before trying the higher word band. Retain a confirmed floor if the stretch fails; six-passage maximum. Legacy evidence replays with its original entry rule. | K-to-G4, failed stretch, legacy replay, and schema/server roundtrip tests. |
| Report invents office speech | Recovered local repair clip contains 34 seconds for a ten-word script. The earlier local transcription missed its extra speech; it should not have been published. Generated audio now requires duration and independent full-transcript checks before upload/playback. Existing report clips must be verified too. | Exact bad clip rejected; changed numbers and extra clauses rejected; Pro/Autonoe replacement is 4.7s and transcript-matched. |

The deleted assessment and cloud audio are gone; no deleted record was recreated. The local copy established the audio defect. No family email was sent. Automated verification does not replace live microphone/device tests or specialist review of reading difficulty.

Validation: 602 tests, TypeScript and targeted lint pass; 126 viewport states pass. Name capture, automatic preview, no technical spelling, larger non-overlapping rabbit and full-screen loading pass in browser checks. Report/name previews explicitly use Pro TTS with Autonoe, without an unchecked Flash fallback.
