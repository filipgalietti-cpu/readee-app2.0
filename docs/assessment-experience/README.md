# Assessment experience

## Product flow

Parent supplies an optional nickname and actual K–4 enrollment grade → saved reader → explicit parent-to-child handoff → Luna microphone check → independent adaptive assessment → parent report comparing demonstrated reading skills with enrollment → custom journey → first free lesson.

Enrollment is context, not a minimum placement. For example, a fourth-grade enrollee demonstrating second-grade reading begins at second-grade skills. The existing atomic completion RPC writes `children.reading_level`, preserves `children.grade`, and saves the evidence, relative placement and plan together. The plan identifies covered units, needs to target and the first available unit. `/placement/start` resolves that owned plan into `/learn`; neither results CTA calls checkout.

The existing parent setup allows an optional nickname, explicit enrollment selection and Explore first. Saving creates the reader before the handoff. The new handoff explains the distinction between assessment and lessons and allows exploring instead. Pricing, trial duration and child limits are unchanged.

## Lesson reference parity

References are the approved Pip’s Tree (RL.K.1), Three Little Houses (RL.K.2), and Little Pond (L.1.1) in `/private/tmp/readee-grammar-studio`, including `CoachedChoose`, `CoachedSpeak`, `AdaptivePractice`, and `delivery.css`. The assessment uses their activity-first frame, actual shared LunaOrb and Rabbit, large reading text, answer-card structure, integrated spoken-choice buttons and narration highlights. The draft welcome hero and four-section navigation were removed.

A selected answer can be changed until Next. The action lives in the footer so long text cannot hide it. Replay never selects or submits. Selected and narrated states are violet, not correctness feedback. Question keys remain gated to QA robots. The assessment retains its independent bank and adaptive logic; taught lesson answers, hints and rewards are not introduced into scoring.

The microphone check and reading turns place the real Luna orb inside the activity at 156px/104px, with the microphone analyser driving listening movement. Opening, speaking, listening, retry and saving states remain distinct. Cold passages are not narrated to the child. The seven narrated result cards remain; the printable report now leads with enrolled grade, recommended lesson level, their relationship, and a direct first-free-lesson action.

The golden lesson packages are still authored in their separate worktree. This change uses their interaction design; it does not publish those unfinished packages. The current curriculum catalogue continues to supply the journey and first lesson.

## Reliability

Silence and technical capture failures stay unmeasured. Required narration that fails or stalls blocks the task with retry, and cancelled replays do not count as failure. A silent passage retries after 12 seconds; audible speech with delayed recognition retains its scoring window. Recognition drain is bounded. Microphone permission timeout and late grants release acquired devices. Completed evidence is retained for a save retry.

## Review and verification

Local, no-login presentation review: `/demo/placement-studio`. The toolbar explicitly labels this as a preview with no recording or saved answers. Parent handoff is included in its screen selector. `/demo/placement-reveal` provides the synthetic parent report. Production demo gates are unchanged.

- 216 placement/assessment tests pass, including silence, delayed final recognition, recovery, enrollment-relative decisions, custom plans, completion and first-lesson access.
- TypeScript passes. Browser review covers nine states at six viewport sizes (320×568 through 1440×900), with no clipped child-task controls. The parent handoff can scroll on small phones.
- `ASSESSMENT_BASE_URL=http://127.0.0.1:3431 node scripts/assessment-experience-browser.cjs` checks selection, changing answers, confirmation, replay highlighting without submission, footer visibility and absence of writes.
- Synthetic full runner: enrolled grade 4 → second-grade evidence → placement 2, with no runtime errors or production writes. The plan tests verify second-grade first-unit selection and targeted higher-grade needs.
- The parent report fixture displays enrollment 4, recommended level 2 and a first-free-lesson action. Desktop and phone screenshots were inspected.
- Earlier asset checks found all 127 referenced public assessment clips available; this revision changes no audio URLs or assessment items.

Physical microphone testing with a child remains unverified. Automated checks establish behavior, not founder design approval or educational calibration. This branch is separate from the prior reliability/onboarding production release (`43b18b69`); it does not rewrite historical placements or send family messages.
