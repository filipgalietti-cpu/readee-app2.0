# Assessment experience

## Product flow

Parent supplies an optional nickname and actual K–4 enrollment grade → saved reader → explicit parent-to-child handoff → Luna microphone check → independent adaptive assessment → parent report comparing demonstrated reading skills with enrollment → custom journey → first free lesson.

Enrollment is context, not a minimum placement. For example, a fourth-grade enrollee demonstrating second-grade reading begins at second-grade skills. The existing atomic completion RPC writes `children.reading_level`, preserves `children.grade`, and saves the evidence, relative placement and plan together. The new plan identifies practice needs and the first available unit; short assessment probes do not mark whole units mastered. `/placement/start` resolves that owned plan into `/learn`; neither results CTA calls checkout.

The full-screen parent setup at `/placement/setup`, without app sidebar or header, places a large animated Readee below the introduction (below the form on phones). It allows an optional nickname, explicit enrollment selection and Explore first. Saving creates the reader before the handoff. The new handoff explains the distinction between assessment and lessons and allows exploring instead. Pricing, trial duration and child limits are unchanged.

## Lesson reference parity

References are the approved Pip’s Tree (RL.K.1), Three Little Houses (RL.K.2), and Little Pond (L.1.1) in `/private/tmp/readee-grammar-studio`, including `CoachedChoose`, `CoachedSpeak`, `AdaptivePractice`, and `delivery.css`. The assessment uses their activity-first frame, actual shared LunaOrb and Rabbit, large reading text, answer-card structure, integrated spoken-choice buttons and narration highlights. The draft welcome hero and four-section navigation were removed.

A selected answer can be changed until Next. The action lives in the footer so long text cannot hide it. Replay never selects or submits. Selected and narrated states are violet, not correctness feedback. Correct-answer attributes are gated to QA robots in the rendered DOM. The client adaptive engine necessarily includes answer keys in its JavaScript bundle. Server replay checks consistency, not whether a child actually supplied a response. Word reading and cold passages retain their fixed assessment content; the supported-language phase reuses curated curriculum questions and pure adaptive selection. Taught lesson answers, hints and rewards are not introduced into scoring.

The microphone check and reading turns place the real Luna orb inside the activity at 156px/104px, with the microphone analyser driving listening movement. Opening, speaking, listening, retry and saving states remain distinct. Cold passages are not narrated to the child. During questions, the text remains open alongside vertically stacked answers on wide screens and above them on phones. Selection shows a check and an explicit Next action. The seven narrated result cards remain and advance only when the parent chooses Next; the printable report now leads with enrolled grade, recommended lesson level, their relationship, and a direct first-free-lesson action.

The golden lesson packages are still authored in their separate worktree. This change uses their interaction design; it does not publish those unfinished packages. The current curriculum catalogue continues to supply the journey and first lesson.

## Reliability

Silence and technical capture failures stay unmeasured. Required narration that fails or stalls blocks the task with retry, and cancelled replays do not count as failure. Word and story recovery stays inline. Words allow 15 seconds of quiet, extended by input activity; a passage with no words and no sound retries after 30 seconds. Stories page without restarting recording and offer explicit Done reading and Skip this story controls. A story pass is unmeasured. After two cold reads the child can finish that part or choose another text. Pages fit the measured viewport, balance short endings, and keep Next page separate from Finish story on the final page. Recognition drain is bounded. Microphone permission timeout and late grants release acquired devices. Completed evidence is retained for a save retry.

## Review and verification

Local, no-login presentation review: `/demo/placement-studio`. The toolbar explicitly labels this as a preview with no recording or saved answers. Parent setup and handoff are included in its screen selector. `/demo/placement-reveal` provides the synthetic parent report. Production demo gates are unchanged.

- 568 repository tests pass, including silence, delayed final recognition, recovery, enrollment-relative decisions, custom plans, completion and first-lesson access.
- TypeScript passes. Browser review covers twenty-one states at six viewport sizes (320×568 through 1440×900), with no clipped child-task controls. The parent handoff can scroll on small phones. It offers an optional narrated welcome and a pronunciation setting. Explore has no sidebar.
- `ASSESSMENT_BASE_URL=http://127.0.0.1:3431 node scripts/assessment-experience-browser.cjs` checks selection, changing answers, confirmation, replay highlighting without submission, footer visibility and absence of writes.
- Synthetic full runners: enrollment 4 → reading 2 with supported language 4; enrollment K → fourth-grade ceiling; enrollment 4 → a provisional foundational starting point with supported language 4; explicit story skip → unmeasured independent reading with a provisional word-based journey. No runtime errors or production writes. The plan tests verify second-grade first-unit selection and targeted higher-grade needs.
- The parent report fixture displays enrollment 4, recommended level 2 and a first-free-lesson action. Desktop and phone screenshots were inspected.
- All 314 new/repaired static clips have matching local transcript checks and binary hashes. The reused-language audit found a broken narration link, a missing spoken question, and inconsistent inclusion of choices; playback and assets now account for each.
- [K–4 spectrum design, standards mapping, decision rules and limits](K4-SPECTRUM.md).

Physical microphone testing with a child remains unverified. Automated checks establish behavior, not founder design approval or educational calibration. This branch is separate from the prior reliability/onboarding production release (`43b18b69`); it does not rewrite historical placements or send family messages.

## September 10 live-session follow-up

Policy revision 2 keeps an unconfirmed lesson entry at or below enrollment, while retaining stronger isolated-word results separately. A recorded passage still supplies descriptive rate even if comprehension does not confirm a reading band. All three skill areas render explicitly, including unmeasured/follow-up states. Older v4 reports and owned first-lesson plans can be reprojected from their original evidence; this does not fabricate additional answers. Provisional results use a plain enrollment/guided-start comparison instead of a measured-grade ladder. Printing sets a child-specific document title.

The assessment orb uses the actual playback analyser during narration and a faster, stronger response to microphone amplitude. A local browser check verified nonzero playback-waveform data during the parent welcome. This is amplitude response, not a claim of phoneme alignment or ASR validation. Static Nia prompts share the NEE-ah pronunciation instruction. All regenerated clips retain scripts, hashes and transcript checks.
