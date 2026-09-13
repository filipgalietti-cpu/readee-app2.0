# Journey and assessment feedback, September 11

Work one stage at a time. Stage 1 is a local journey design review. Do not deploy this experiment until requested. Keep Readee's existing purple design and hopping bunny, existing assessment evidence, lesson routing, and subscription rules.

## 1. Custom journey (implemented locally, ready for review)
- [x] Replace vague introduction with the child's actual first lesson and selected skills.
- [x] Show one grade at a time, starting at the recommended/current lesson grade.
- [x] Show which lessons are included within each grade and why the first skills were chosen.
- [x] Put visible lesson titles and status inside readable cards; no hover required, including on touch screens.
- [x] Retain the hopping bunny, grade comparison graph, progress, and reward identity.
- [x] Render Kindergarten instead of "0th grade," including legacy string-valued enrollment.
- [x] Populate the real app sidebar from the owned reader snapshot rather than leave it blank while a second request resolves.
- [x] Verify mobile/desktop, free/paid, provisional/K enrollment, grade switching, return from completion, and unchanged paywall routing. No live records or purchases in QA.

Local preview: http://127.0.0.1:3443/demo/journey. The default Filus is synthetic data, not a replay of the real assessment. The scenario selector also exposes paid, provisional, and lesson-completion states.

Validation: 648 unit/integration tests passed; TypeScript passed. Browser checks passed at 390px and 1280px for visible lesson cards, populated desktop sidebar, grade selection and keyboard navigation, premium modal without checkout, paid/provisional states, and bunny movement on completion. Targeted lint has no errors (three existing sidebar warnings). No production deployment, family-record changes, or payment requests.

## 1b. Cinematic journey (superseded by the inline unit view below)

- [x] Put the one-grade lesson path first, with a quieter violet surface, raised lesson stops, visible titles, and the original hopping Readee rabbit.
- [x] Open a full-screen introduction when coming from the assessment/report's existing `from=placement` link. Draw the first four assigned lessons in sequence and let Readee hop between the preview stops.
- [x] Show real report evidence alongside the reveal. Keep the evidence text steady while the path animates; expose the other skill samples in the plan panel.
- [x] Keep school grade, lesson starting grade, and the existing enrollment comparison distinct. Preserve provisional placement wording.
- [x] Skip, Escape, replay, focus restoration, and reduced motion all work. Remember a dismissed introduction per saved assessment in session storage; storage failure does not block the map.
- [x] Keep parent evidence and membership accessible on phones through Plan & report, without scrolling the full grade. Desktop shows the panel beside the map.
- [x] Match the loading placeholder to the new map layout.
- [x] Preserve lesson access, prices, trial rules, completion hops, and global chest/reward identifiers. The creation animation does not award progress or change assessment data.

Validation: 648 tests, TypeScript, and targeted lint passed. The cinematic browser harness passed at 320, 390, and 1280 px, including reduced motion, real lesson IDs, phone plan-to-membership transition, skip/replay, grade switching, and completion hops. The existing billing/browser harness also passed at 320–1440 px, including annual selection, idempotent checkout retries, lapsed subscriptions, and delayed access confirmation. Requests were mocked; no live family records or payments changed. No production build or deployment was run.

Preview: http://127.0.0.1:3443/demo/journey. Use **Watch the path unfold** to replay. The default Filus and scenario alternatives are synthetic examples.

## 1c. Inline creation and one unit at a time (local revision)

- [x] Removed the separate full-screen creation scene. The actual `/journey` path draws and reveals its real lesson stops in place.
- [x] Expanded the map to the available content width and widened the road. Parent evidence is available through Plan & report at every screen size.
- [x] Show only the selected unit, with previous/next controls and a unit picker. Keep grade tabs for browsing the wider journey.
- [x] Keep the creation controls in a fixed-height row so showing all stops does not shift the page. Hidden stops cannot receive keyboard or pointer input.
- [x] Preserve the rabbit's completion hops, free/paid gates, saved progress, and global chest IDs. The last-unit trophy stays on the actual final unit.
- [x] Remove the duplicate unit banner in the single-unit view; keep the first lesson closer to the top on phones.

Verification: 649 tests passed, TypeScript and targeted lint passed. Browser coverage checks in-place creation, no separate dialog, one-unit filtering, unit/grade navigation, stable reveal height, reduced motion, desktop map width, mobile card bounds, report evidence, membership gates, and completion hopping. The checkout retry/activation harness also passed with mocked requests. Local only, no production deployment.

## 1d. Follow the path, assessment origin, and rabbit placement (local revision)

- [x] Keep Readee on the opposite side of the path from each lesson card, with space reserved at phone edges.
- [x] Reveal actual lesson stops one at a time within the journey page. Follow them down the unit, then glide back to the beginning.
- [x] Provide Finish tour throughout; manual scrolling, touch, keyboard navigation, or opening the parent panel stops the tour. Reduced motion shows the complete map without automatic camera movement.
- [x] Begin the first unit with a Reading assessment stop. A completed assessment opens the parent report panel; an unassessed reader can enter the assessment.
- [x] Replace the enrollment sentence with See [Reader]'s Journey, opening the side panel containing the saved evidence and full-report link.
- [x] Use pale lavender upcoming stops, stronger purple for the active lesson, white title cards, and brief sparkles as each stop appears. Preserve completion hopping and progress/reward identities.

Verification: 650 tests passed; TypeScript and targeted lint passed. Browser checks at 320, 390, and 1280 px verified camera follow and return, bunny/card placement within the viewport, assessment origin, one-unit navigation, interruption, parent-panel interaction, and reduced motion. The membership/completion browser harness passed on rerun, including annual checkout retries and delayed activation; an earlier run caught a non-reproduced JSON parse error, so stack logging remains enabled for that check. Synthetic demo data and mocked requests only. Local preview remains http://127.0.0.1:3443/demo/journey; Watch the path unfold replays the creation. No production deployment.

## 1e. Connect the plan to Readee+ (implemented locally)

- [x] Put the saved word-reading and independent-reading findings above the map, alongside the actual first lesson and its practice purpose. Keep provisional starting points explicit. The answers and existing enrollment comparison remain available in the report drawer.
- [x] Add short parent-facing practice descriptions to lesson cards, based on their curriculum skills. These describe instruction; they do not imply that every lesson represents an individually measured deficit.
- [x] Shorten the inline tour to roughly eight seconds, followed by the glide back to the assessment-and-plan section. Keep one-stop-at-a-time creation, the rabbit, replay, interruption, reduced motion, and completion hopping. Browsing a different grade or unit does not replay the tour or return the parent to the offer; replay is explicit.
- [x] Put the Readee+ offer directly on the main page: full journey access, guided practice with Luna, and saved lesson progress. Keep the first included lesson as a secondary preview action.
- [x] Show the existing 14-day trial, monthly renewal price, card requirement, and cancellation terms before the parent opens checkout. Use the shared billing constants and existing paywall. Paid accounts see Continue reading; lapsed accounts do not receive a new-trial promise; pending checkout confirmation does not ask for another card.
- [x] Put grade/unit browsing behind Browse the full journey. Keep the assigned unit visible. Remove the journey sidebar while retaining a Dashboard exit; suppress zero-valued reward counters for new readers.
- [x] Explain the progress that exists today: completed lessons are saved and shown on the map. Do not promise unverified email delivery or a date when a child will reach a grade.
- [x] Match the loading placeholder to the new evidence/offer/map layout. Increase narrow-screen stop spacing so complete lesson descriptions do not overlap. Restore keyboard focus to the report-opening control after closing its native dialog.
- [x] Distinguish main-offer and report-panel trial clicks from locked lesson clicks in the existing funnel events. External analytics delivery was not certified; local CSP blocks some existing optional telemetry scripts.

Validation: 650 tests passed; TypeScript and targeted lint passed. Browser checks cover 320, 390, 768, and 1280 px, visible offer terms, the real report drawer, collapsed grade browsing, lesson-card bounds and spacing, tour return, and opening the existing paywall without a payment request. The billing harness passed paid/free/legacy/lapsed states, annual checkout retries with a stable attempt ID, delayed activation, and completion hopping. All transactional requests were mocked. The default demo is a synthetic Filus, and no conversion improvement is claimed until real parents use the change. Local only; no deployment or real family-record changes.

## 2. Assessment interactions (pending)
- [ ] Automatically read choices for low-grade questions such as "Who sat on the mat?" Use item difficulty rather than school enrollment; K–1 versus K–2 cutoff awaiting user preference.
- [ ] Selecting an answer registers clearly and automatically moves to the next question. Remove redundant Next action. Prevent double submissions and stop old audio before the new question.

## 3. Paired text readability (pending)
- [ ] Separate Text A "Bats use sound to find food in the dark" from Text B "Bats eat insects and help farmers by keeping pests away."
- [ ] Separate Book 1 "Butterflies have colorful wings and drink nectar from flowers" from Book 2 "Butterflies start as caterpillars and go through metamorphosis."
- [ ] Check wrapping, contrast, spacing, and touch layout; preserve comparison meaning and question evidence.

## 4. Assessment audio quality (pending)
- [ ] Compare the strongest existing/golden recordings against the inconsistent clips: voice, pace, clarity, pauses, loudness, and exact spoken script.
- [ ] Regenerate "After winning the game, Kai was DELIGHTED. He smiled and jumped up and down."
- [ ] Regenerate "Firefighters are helpers. They rush into fires to save people. They carry pets out to keep them safe."
- [ ] Listen-check the replacements before publishing; verify transcripts, manifest references, and surrounding prompts/choices for consistency. Do not solve clarity merely by slowing playback.

## 5. Report narration startup (pending)
- [ ] Trace initial delay across generation, network, preload, and playback.
- [ ] Prepare the needed audio before the report begins, while preserving retry/mute/autoplay behavior.

## 6. Name pronunciation (pending)
- [ ] Trace why confirmed "FEE-loosh"/"Feeloosh" becomes "Fil-loosh."
- [ ] Keep the spelling Filus and pass the confirmed spoken pronunciation to every name-bearing report/journey narration.
- [ ] Verify actual generated speech and cache invalidation after pronunciation correction.
