# Name handoff and pronunciation playback

| Feedback | Change | Evidence |
| --- | --- | --- |
| Does “Hello Luna” teach Azure the child's voice? | It remains a microphone audibility check. No voice profile is created and the greeting does not change Azure pronunciation scoring. | Traced `waitForHello` and recognizer creation. |
| “Tap Hear it again” never plays | The preview API returns a data URL, which production's `media-src` policy blocks. Decode to a blob URL and release it when replaced/unmounted. Keep the existing security policy. | Browser reproduces the old rejection under production media policy, then plays the real data-response format successfully twice through the shared Settings control. |
| Welcome while pronunciation processes | After the name recording, play the verified fixed “It’s so nice to meet you!” clip and advance after it ends. The name request continues independently of the name screen. A failed greeting offers replay and a continue button. | Browser holds the name request open, hears the entire welcome, moves to the word screen and then completes the request without cancellation. |
| Carry pronunciation into the parent's report | The owned respell route saves only `name_said_as`. The assessment waits for any pending name save before submitting the report. Report narration uses the pronunciation; displayed text keeps the written name. | Ownership, save failure, unclear audio, deferred submission and report-speech tests. Filus remains written as Filus; fee-LOOSH becomes Feeloosh in TTS input. |

The welcome is an authored 2.184-second Pro/Autonoe clip with a matching independent transcription and content hash. It is not synthesized during the child's session. Unclear name audio preserves the previous pronunciation. A failed optional name request does not erase reading evidence or prevent report saving. The app does not persist the raw name recording to browser storage or its database.

Validation: 613 tests pass, TypeScript passes, targeted lint has no errors (four pre-existing runner warnings). Browser checks use synthetic microphone input and mocked inference responses; they establish playback and request lifecycle behavior, not pronunciation accuracy across real children's voices. Existing report visuals, grading and pricing are unchanged. No family emails or production child rows were written for testing.
