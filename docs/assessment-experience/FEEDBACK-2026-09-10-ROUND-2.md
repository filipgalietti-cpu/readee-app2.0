# Assessment feedback, September 10, 2026: second live review

Every reported item is tracked below. No private child IDs, recordings, or raw assessment answers belong in this file. Status starts open and changes only with evidence.

| ID | Feedback | Action / acceptance | Status |
|---|---|---|---|
| F01 | Report width | Widen the static report while preserving Claude’s existing visual components. | Implemented; wider report checked in browser. |
| F02 | Optional reader name | Decide whether a blank name remains allowed; explain that the child row exists independently of the display name. | Resolved: blank display name stays allowed; setup still creates a child row with a stable ID. Copy simplified. |
| F03 | Spoken name setup | Offer recording → phonetic respelling → TTS preview → parent confirmation using existing name-pronunciation infrastructure. | Implemented: eight-second recording with Stop, editable respelling, cached preview and explicit playback errors. Real family pronunciation still needs parent confirmation. |
| F04 | Parent welcome playback | Reproduce and fix the welcome button that appears not to play. | Verified: welcome produced a nonzero browser playback waveform; Stop does not show a false error. |
| F05 | Child welcome copy | Replace “Let’s read a little together. Your grown-up can stay nearby.” with a natural invitation. | Implemented: “Ready to read with Luna?” |
| F06 | Practice success | Show the unscored practice word in green with a positive chime after a successful response. | Verified: green practice card in the browser; runner calls the existing correct chime only for unscored practice. |
| F07 | Recognition delay | Reduce the 3–5 second single-word recognition delay without scoring partial guesses or silence. | Verified with fixed synthetic speech: “predict” finalized in 2.4 seconds, previously 4.3. Real microphone latency remains device-dependent. |
| F08 | Rabbit presence | Restore Readee rabbit on child word/microphone screens using the existing mascot. | Verified: existing animated bunny at the word footer; phone space reserved so it does not cover Pass. |
| F09 | Word-card spacing | Move the word card slightly upward and give it breathing room without separating it from the microphone. | Verified at six viewport sizes; word and microphone remain together. |
| F10 | Repeated correct word missed | Investigate the reported repeated “predict” recognition failure and retain a usable recovery path. | Mitigated and regression-tested: buffer early speech during recognizer startup; ignore omitted reference candidates when grading spoken words. Cannot reconstruct the original microphone failure from saved summary evidence. |
| F11 | Slow retry narration | Replace the awkward, excessively slow retry audio; inspect speech rate and pipeline consistency. | Verified replacement script and transcript; short clips use text-only synthesis to prevent spoken delivery instructions. |
| F12 | Orb smoothness | Smooth speech/input reactivity and reduce abrupt expanding/shrinking for both Luna and the reader. | Implemented: reduced size modulation, slower attack/release, actual input/output analysers. Live child speech feel still needs device testing. |
| F13 | Reading page progression | Fix delayed/stuck automatic page advancement while preserving manual Next page. | Implemented and tested: interim text moves pages without scoring; final alignment can recover after a gap. Manual page controls remain available. |
| F14 | Above-enrollment passage difficulty | Explain and verify why strong word reading opens harder passages even for a Grade 1 enrollee; enrollment is not a ceiling. | Verified: enrollment starts the staircase; strong readers can reach Grade 4 from K or Grade 1. |
| F15 | Answer submission behavior | Confirm with the parent whether selection requires Next or immediately submits. Question sent. | Default retained after asking: select, change if needed, then Next. Browser-tested; parent can still request immediate submission. |
| F16 | Nia pronunciation | Audit and regenerate every relevant title/question/option clip with consistent NEE-ah pronunciation. | Verified regenerated Nia title/questions; NEE-ah is supplied consistently to synthesis. |
| F17 | Comprehension column sizing | Make story and answer columns align in height and preserve readable story access. | Verified: story and question/answer columns measured at the same height; story scrolls internally. |
| F18 | Selected-answer layout shift | Reserve space for the check mark so selection does not move answer text. | Verified: selected answer text keeps the same x position and width. |
| F19 | Unnecessary reading-break screen | Remove the “Ready to finish this part?” decision screen. | Removed from runner, screen union, rendering and demo. |
| F20 | Reading-to-questions transition | Use clear narration: now answer questions about what you read. | Implemented and transcript-checked: “Now let’s answer a few questions about what you read.” |
| F21 | Choice narration support | Make automatic choice narration consistent and based on demonstrated reading support needs, not arbitrary item audio. | Implemented: text/question clips exclude choices; automatic choice reading uses demonstrated word-reading support needs (K–1). Individual speaker buttons remain available. |
| F22 | Remove instruction inside text | Remove “Read the text.” from authored listening text/prompt audio. | Removed from text and regenerated audio; also removed the redundant paragraph instruction. |
| F23 | Listening question/choice TTS quality | Inspect the librarian/main-idea and danced items; normalize voice, rate, and which material is narrated. | Regenerated local listening text/question clips with separate choices; awkward incomplete question stems rewritten as complete questions. Transcript audit required before release. |
| F24 | Reveal auto-advance | Restore narration-led automatic report progression, retaining manual navigation. | Verified: narration-enabled reveal advances automatically; muting holds the current card. |
| F25 | Strengths evidence | Show more than one generic word-set strength when real passage/answer evidence exists. | Implemented: strengths include successful passage reading and actual comprehension/listening counts when supported. |
| F26 | WPM formatting | Round visible and spoken WPM consistently, including already-saved fractional values. | Verified by regression tests: visible and narrated rate rounded, including fractional historical values. |
| F27 | Parent-facing measurement copy | Replace repetitive technical disclaimers with useful plain-language context; do not invent standardized norms. | Implemented: concise pace/accuracy context replaces repeated technical disclaimers. No invented percentile or standardized grade-equivalent claim. |
| F28 | Above-enrollment placement | Replay the reviewed session and fix under-placement; confirmed higher reading must advance regardless of enrollment. | Verified: a completed comfortable higher passage supports a higher provisional journey; two passages still confirm independent reading. Word reading alone does not establish Grade 4 connected reading. |
| F29 | Skill footer evidence | Show specific recorded counts, accuracy, passage and answer evidence in hover/tap footers instead of repeating card definitions. | Verified: distinct word counts, passage accuracy/coverage and question counts in hover/tap footers. |
| F30 | Time-versus-grade graph | Restore the interactive line graph using measured progress and/or clearly labeled practice targets. Question sent. | Restored original chart component with grade/time mode, enrollment reference and interactive practice target. Future line explicitly shows a goal; this assessment alone does not contain a longitudinal progress history. |
| F31 | Negative projection copy | Remove “There is no promised catch-up date” from product copy without fabricating a guaranteed date. | Removed from on-screen and narrated copy. |
| F32 | Final slide narration | Ensure the final “Reading Journey is Ready” slide has usable narration and correct audio wiring. | Implemented: final slide has a fixed, verified local audio fallback, independent of background personal narration generation. |
| F33 | No-card copy | Remove “No card needed” from the final reveal and report sales surface. | Removed from report/reveal sales copy. |
| F34 | Journey destination | Change the final CTA to “Go to custom reading journey” and route to the actual child-specific journey. | Implemented: “Go to custom reading journey” opens the child-specific journey. |
| F35 | Card-required Readee+ flow | Wire journey → parent-only Readee+ trial checkout with a credit card; exact first-lesson timing question sent. | Implemented per latest instruction: journey preview → parent Readee+ offer → existing card-required checkout. Ownership-checked return to the journey; billing amounts and trial length unchanged. Stripe calls verified with mocks, no charge attempted. |
| F36 | Complete feedback record | Maintain this itemized log with implementation and verification status; explicitly record unresolved items. | All 37 items recorded here with outcomes and remaining verification limits. |
| F37 | Visual preservation | Keep Claude’s graph, report/reveal visual structure, colors, and journey components; change wiring and requested spacing only. | Original ladder, cards, journey, gradients and chart retained; responsive browser checks completed. |

## Decisions and evidence

- Enrollment chooses the starting questions, not a maximum reading level.
- Preserve original answers when repairing derived decisions/reports.
- Practice can celebrate correctness; scored assessment probes remain neutral.
- Optional questions were sent. Defaults: select then Next; journey preview before the parent’s card-required trial; graph shows an explicit practice goal.
- Audio QA caught delivery instructions leaking into generated short clips. Failed files were regenerated using text-only input. Transcript comparison normalizes sound-equivalent spelling, accents and numbers; it does not excuse omitted or added words.
- No family emails or checkout charges were sent during this work.

## Verification and release

- Unit/integration checks: 577 passed across 62 files; TypeScript passed. All 404 referenced static clips and all 10 prepared private report clips passed transcript checks.
- Browser: 126 assessment states across six viewport sizes; seven reveal cards; word practice feedback; answer selection without text movement; matching story/answer height; parent welcome waveform and Stop; reveal auto-advance and mute.
- Real Azure test: fixed public synthetic speech, including “predict” and the entire Grade 4 narrative. This is not validation of child speech, accents, household noise, Bluetooth changes or iOS microphone behavior.
- Private report repair: prepared from the reviewed saved evidence. Publish status and scoped repair verification recorded after deployment.
- Specialist decisions such as the 5-of-6 confirmation threshold remain outside this presentation/recognition repair. The new single-passage fallback is explicitly provisional.

## Live checks still required

1. A real child on iPhone/iPad: microphone grant, slow decoding, spoken “I don’t know”, page progression and footer safe area.
2. A parent confirms the recorded name pronunciation before saving; synthesis cannot guarantee every name without that preview.
3. Complete the card-required trial with a test account/payment method in a Stripe test environment, then verify entitlement and return routing. Automated checks here mocked Stripe; no live card submission was made.
4. Re-test any remaining real-word misses with the device/browser identified. The original repeated-word incident had no raw recording available for diagnosis.
