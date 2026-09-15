# Assessment audio and Luna response release

The user requested production deployment of the complete PCM assessment voice set, including the exact selected retakes: C for "What color is the spot on Max?" and A for "Where did Sam hide the ball first?" They also requested a modestly stronger audio response from Luna.

## Scope

- 440 versioned, script-verified PCM recordings for assessment narration, titles, questions and answer choices.
- Two exact listening-selected retakes in a separate immutable directory, resolved by `listening-selections.json`. Their bytes have not been regenerated or processed again.
- Fixed greeting, narration and question playback all resolve through the same release. Legacy question metadata cannot override the active spectrum recording.
- A suspended Web Audio context warms for the next clip rather than rerouting a playing clip mid-sentence.
- Responsive Luna instances use slightly higher amplitude sensitivity, smoother attack/release, stronger internal waves and a small bounded shell pulse. Surrounding dimensions remain fixed. Reduced-motion users retain state colors without audio-driven scaling.

This release is based on production commit `e6e22503`, preserving the latest approved lesson releases. It does not include the separate pending Journey/report work from the local polish branch. Assessment scoring, curriculum, subscription logic and lesson assets are unchanged.

## Verification

- 796 tests across 97 files passed. Full inventory/script/format/level/hash checks cover all 440 base recordings; selected-retake tests pin both actual user-chosen hashes.
- Scoped lint: no errors; three pre-existing PlacementRunner warnings remain.
- Browser: measured responsive scale from 1.030 to 1.054 with a controlled audio signal; wrapper bounds stayed identical. Reduced-motion scale remained 1.000. No browser exceptions.
- File/level/transcript checks are technical checks, not proof every recording was listened to. The two retake selections and preferred greeting are explicit user listening feedback; they do not imply full-set perceptual certification.

## Assets and rollback

The complete PCM set and the selected retakes are tracked under `public/audio/assessment-voice/`. The original assets are retained. Disabling the complete release state restores the previous asset resolver; reverting this release also restores the prior rendering and playback behavior.
