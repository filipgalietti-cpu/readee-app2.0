# Assessment experience, September 9, 2026

This pass brings the actual placement runner into the presentation language of the approved Pip, Three Little Houses, and Little Pond lesson references. It preserves the assessment bank, enrollment-relative placement, adaptive passage search, evidence contract, atomic save, seven-card narrated reveal and assigned free first unit.

Reference evidence: `/Users/filipgalietti/readee-product-memory/2026-09-09-k-first-golden-references.md` and `/private/tmp/readee-grammar-studio/docs/lesson-production/REFERENCE_PARITY_PASS.md`. The references supply experience patterns, not new assessment answers. Pip/Houses are Kindergarten; Pond is Grade 1. Their taught examples are not inserted into the cold assessment, and correct-answer rewards/coaching are not transferred into examiner mode.

## Experience

- Explicit child-ready welcome before narration or microphone startup. QA robot runs remain automatic.
- Violet `#faf8ff` stage, Baloo/Nunito/reading typography, raised violet controls, existing animated Rabbit, and existing Luna in a compact bottom dock.
- Four named sections identify the current activity without displaying a countdown, score, reading-grade label, or invented percentage of an adaptive test.
- Large isolated reading words; neutral selected answers; story look-back beside questions on desktop and above them on phones; scrollable long passages; prompt replay outside active microphone capture.
- Missing speech, unavailable sound, and saving failures have distinct messages and next actions. Answer keys remain visible only in gated QA robot mode.
- No-login local screen review at `/demo/placement-studio`; this renders the same `PlacementView` as the real runner. Its toolbar explicitly labels the non-recording, non-saving design preview. `/demo` remains gated off in production by the existing demo layout.

## Reliability

Required assessment narration fails closed when an instruction or listening clip cannot play. Optional non-assessment playback retains its old nonblocking behavior. Switching an optional replay to another choice is cancellation, not a playback failure. Stopped audio clears its timers. Narrated instruction captions use the actual narration source text.

A passage with no detected audio and no recognized words retries after 12 seconds rather than waiting through the reading window. Audible speech with delayed final recognition still receives the original scoring window. Recognizer drain is bounded at four seconds. These are technical retries, not incorrect evidence.

Microphone permission requests have a 15-second bound. Late grants are stopped if the reader leaves or the request times out; setup failures release acquired tracks and contexts. This uses the lifecycle pattern already exercised by the golden lesson work.

## Verification

- 512 tests across 55 files pass, including below-enrollment placement, delayed recognition, silence, stalled recognizer drain, required audio failures, clip cancellation, and late microphone permission cleanup.
- TypeScript passes.
- 48 screen/viewport combinations checked at 1440×900, 1280×720, 768×1024, 390×844, 390×667, and 320×568. A cropped orb and smallest-phone answer overflow were fixed; the repeated checks report no frame/answer overflow and no browser runtime errors. Actual desktop/mobile screenshots were inspected.
- Full synthetic browser assessment: fourth-grade enrollment, second-grade reading evidence, second-grade final placement; no assessment save or checkout request.
- All 127 referenced public narration, title, question, choice and phoneme clips return HTTP 200. This verifies availability, not human listening quality.

This is a local implementation and review branch. The prior reliability/onboarding release is already live at production commit `43b18b69`. This visual pass is separate. Physical child microphone testing and age-appropriate instructional review remain unverified; no educational calibration or efficacy claim is made. No pricing, trial, subscription, child-cap, historical placement or lesson-content changes are included.
