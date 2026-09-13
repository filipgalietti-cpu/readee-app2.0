# Journey V2 design review

Local review: **http://127.0.0.1:3443/demo/journey-v2**. The original `/demo/journey` and production `/journey` remain separate. This surface inherits the existing production demo gate: `ENABLE_DEMOS=1` is required in a production build. No deployment was performed.

## Review flow

1. Open the demo. The three assessment insights appear in a quick stagger. **Build my journey** starts a 3.2-second construction sequence, then settles on the current destination. **Skip animation** is available immediately, including during construction. Reduced motion opens the finished map.
2. Choose **Let’s begin → Finish lesson preview**. The existing Readee completion chime plays once, the completed destination changes, its outgoing route draws, and Readee hops along the measured SVG path to the next stop. The speaker control mutes demo completion sounds. Checkpoint completion also plays the chime.
3. Choose **Continue with Readee+**. The personalized trial panel uses `PRICING` from `lib/billing-copy.ts`. **Preview trial** changes local fixture access only.
4. Finish the other lesson previews. Open the checkpoint and finish its preview to open the chapter keepsake. Continue into the next chapter.
5. Open **Why this journey?** for enrollment, starting point, instructional focus, lesson reasoning, and expandable provenance.
6. Use **Design studio** to switch readers or simulate reduced motion. Footer controls change access and completion count, replay the reveal, or return to the current chapter.
7. During a mobile hop, scroll the chapter. The camera yields. **Back to bunny** explicitly restores the view. Browsing a future chapter does not move the learner's bunny or award progress.

Refresh resets this deliberately ephemeral demo. There are no saved child records, lesson attempts, subscription changes, reward writes, or assessment requests.

## What was preserved and replaced

The initial audit covered `JourneyClient`, `JourneyMap`, the SVG road and bunny animation, lesson cards, chest/reward behavior, parent-plan dialogs, report entry, skeletons, and mobile/reduced-motion behavior. The old map mixes layout, path travel, camera scrolling, cards, and rewards in one large component.

Preserved: the existing `Bunny` rig, Nunito/Baloo typography, violet actions, rounded visual language, exact lesson references, current foundation explanation categories, and the idea of the bunny moving along the route. Production completion, rewards, access enforcement, and the original Journey were left in place.

Replaced within this demo: the giant single road and uniform cards, scattered viewport logic, and index-derived decoration. The new presentation has one chapter at a time, landscaped regions, compact future stops, a prominent current lesson, a book-arch checkpoint, and a separate chapter keepsake. Completion checks reflect explicit fixture completion only. There are no invented stars or mastery percentages.

## Components and contracts

| File under `app/demo/journey-v2/`   | Responsibility                                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `page.tsx`                          | Isolated demo entry and noindex metadata                                                                                              |
| `fixtures.ts`                       | Ten synthetic learner presentations using `JourneyDefinition` / `PlannedJourneyLesson`                                              |
| `lesson-metadata.json`              | Small development snapshot of real lesson IDs, titles, standards, units, and objectives; not a curriculum registry or approval record |
| `_components/JourneyExperience.tsx` | Reveal, selected chapter, local completion/access state, review controls, and panel orchestration                                     |
| `_components/JourneyWorld.tsx`      | Destinations, progress strokes, reused bunny, checkpoint, and map viewport                                                            |
| `_components/JourneyLandscape.tsx`  | Garden/woods/valley SVG scenery and book/chest landmarks                                                                              |
| `_components/geometry.ts`           | Shared route endpoints and cubic segments, with distinct mobile geometry                                                              |
| `_components/useJourneyCamera.ts`   | The single map-scroll controller; reveal/follow/settled/manual modes                                                                  |
| `_components/JourneyPanels.tsx`     | Accessible native dialogs for explanation and fixture paywall                                                                         |
| `_components/journey-v2.module.css` | Scoped responsive illustration, node states, typography, and motion styling                                                           |

Two shared files have narrowly scoped additions: `Chrome.tsx` recognizes only the new demo as immersive, and `DemoShell.tsx` skips its legacy DOM-hiding effect there. All other pre-existing dirty worktree changes belong to earlier work.

## Fixture architecture

| Fixture                                | What changes visibly                                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A · Filus, foundations                 | Grade 1; Sound Garden; nine lessons; first lesson accessible                                              |
| B · Nora, farther along                | Starts in Sentence Trail; six lessons; different entry lesson                                             |
| C · Maya, comprehension focus          | Story Valley; eight story/information lessons; meaning-focused explanations                               |
| D · Leo, above enrollment              | Enrolled Grade 1, illustrative Grade 2 entry; four destinations in the first chapter; seven lessons total |
| E · Amelia-Rose Alexandra, provisional | Long-name coverage; one lesson before an early confirmation checkpoint; provisional reasoning                      |
| F · Oliver, partial completion         | Four of nine lessons complete; explicit earlier checkpoint completion; bunny begins in chapter two        |
| G · Subscriber                         | Same educational route as the free profile, with fixture access enabled                                   |
| H · Non-subscriber                     | Same educational route; future destinations visibly marked Readee+                                        |
| I · Zoe, later Garden entry             | Second Sound Garden destination; one explicitly completed lesson                                         |
| J · Theo, Word Woods entry              | Starts directly in Word Woods; three lessons, no fabricated earlier completion                           |

Lesson IDs/standards are real references. Readers, assessment provenance, sequencing, chapter names, checkpoints, and content versions are explicitly development fixtures. The release ID is `unreleased-visual-fixture`; rules are `unapproved-presentation-fixture-v1`. No fixture claims Jennifer approval, and the G1.U1 pilot has not been published. A successful lesson preview records completion, not mastery. Checkpoint completion is a separate explicit event.

The educational `JourneyDefinition` contains no entitlement state. Access controls read a separate fixture flag and completion set. Every lesson retains a contract-compatible reason, parent explanation, source, and rule version. The UI does not calculate diagnoses or choose lessons.

## Animation and camera

Framer Motion is the existing animation dependency; no framework was added. SVG strokes and HTML destinations share `mapGeometry` points. Bunny travel uses the actual segment's `getTotalLength()` and `getPointAtLength()`, with short departure/arrival offsets to park beside a stop. Motion values drive position and stroke reveal without React renders per frame. The next lesson becomes current on arrival. Shared cardinal tangents keep the path smooth through every stop and checkpoint. Landing squash is finite; the demo replaces the large idle loops with an occasional blink and ear flick. The next segment has a subtle directional dotted stroke. Reduced motion disables these effects.

The click-triggered, 3.2-second construction is inline and interruptible. Terrain is present first, then the origin, trail, destinations, checkpoint, bunny, and active card appear in stages. Skipping or reduced motion shows the completed route immediately. Mobile uses a scrollable chapter viewport with portrait zigzag geometry, not a scaled desktop SVG. Desktop/tablet use a wider landscape composition. Only one chapter is mounted; no page containing dozens of lesson nodes is generated.

The camera never changes keyboard focus. Wheel, touch, pointer, and navigation-key input interrupt automatic following. Browsing chapters is separate from the learner's current chapter. Native dialogs trap focus, support Escape, and restore their invoking control without scrolling.

## Accessibility

Reduced-motion preference and a review override remove travel/reveal animation. Buttons expose current/completed/upcoming/access states in their names. Progress is a native progress element plus readable completion counts and a polite announcement region. Decorative landscape SVGs are hidden from assistive technology. Visible focus rings, keyboard-operable nodes, non-hover explanations, large destination targets, wrapping titles, and a truncated mascot name with the full accessible reader name cover the main interaction needs. Long names are also exercised at 320px.

## Verification and artifacts

Run from this worktree with the local dev server available:

```sh
npx --no-install vitest run tests/journey-v2.test.ts tests/curriculum-pilot.test.ts tests/curriculum-release.test.ts
npx --no-install tsc --noEmit
npx --no-install eslint app/demo/journey-v2 tests/journey-v2.test.ts app/_components/Chrome.tsx app/demo/DemoShell.tsx --max-warnings=0
node scripts/journey-v2-browser.cjs
```

Unit/type/lint checks cover exact standards, distinct fixtures, completion preservation, provisional reasons, entitlement separation, geometry, demo gating, and absence of runtime model/data-write dependencies. Browser evidence is recorded in `browser-verification.json`, screenshots in `screenshots/`, and the walkthrough in `journey-v2-demo.webm`.

Recorded results: **52 tests passed**, repository typecheck passed, and changed-file lint passed (including the standalone CommonJS browser harness). Chromium passed the full flow at 1440×1000, 820×1180, and 390×844; all ten profiles; a 320px long-name/card-clearance check; OS and simulated reduced motion; partial/all-complete lesson states; separate checkpoint credit; future-chapter browsing; and dialog focus restoration. No browser runtime errors or production writes were observed. The global analytics integrations still produce existing CSP-blocked-script console messages; those are retained in the verification report. Repository-wide lint was not run.

Inspection fixes included collapsed bunny geometry, the legacy demo-shell footer selector, interrupted path reveal, crowded fourth-lesson landmarks, mobile card/destination overlap, reduced-motion hydration mismatch, and completed-marker contrast. Captures are staged outside the watched worktree to avoid hot reload during verification, then copied into this directory after the browser closes.

## Deliberately deferred / remaining design work

- Real planner loading, approved release resolution, durable progress, real lesson launching, scored checkpoints, checkout, production entitlement enforcement, and adaptive replanning remain outside this demo.
- Regional artwork now includes planted garden beds, a story picnic, and a woodland reading nook. More illustrations can be authored once real units are approved. Completion uses the existing Readee chime; there is no background soundtrack.
- Chapters change in place with a brief directional transition. Continuous cross-region bunny travel is not implemented.
- The local parent insight model demonstrates approved-contract explanations, but its strength/focus/goal summaries are synthetic presentation fields pending an adapter from actual planner output.
- Browser checks use Chromium desktop/mobile emulation; real iPad/iPhone Safari, screen-reader usability, and physical touch-device checks remain necessary before a production rollout.
- No production build was run against the active development server's `.next` directory. This phase does not change production planner behavior.

## September 11 polish pass

The approved cream map, green terrain, bunny, assessment origin, physical trail, chapter navigation, and book landmark are preserved. The palette now separates scenery from interaction more clearly. Current cards have a pointer/stem to their destination, a concise objective where supported, stronger elevation, and a prominent action. Future destinations use three cohesive presentation-only shapes/icons. The checkpoint has a stronger silhouette, steps, flag, and finite availability reaction.

Tablet review caught chapter-navigation overflow and active-card/footer crowding; both were corrected. A 320px phone exposed an early checkpoint overlapping the expanded card; checkpoint clearance is now larger and regression-tested. Mobile remains a vertically scrollable single chapter, with the current bunny/card given priority; the next destination may require a short scroll on the narrowest screens.

Changed in this polish ticket (no production/shared component edits):

- `app/demo/journey-v2/fixtures.ts`
- `app/demo/journey-v2/_components/JourneyExperience.tsx`
- `app/demo/journey-v2/_components/JourneyWorld.tsx`
- `app/demo/journey-v2/_components/JourneyLandscape.tsx`
- `app/demo/journey-v2/_components/geometry.ts`
- `app/demo/journey-v2/_components/journey-v2.module.css`
- `tests/journey-v2.test.ts`
- `scripts/journey-v2-browser.cjs`
- This README and refreshed browser screenshots, verification JSON, and walkthrough video.

The browser checks observe the actual three completion oscillators (523/659/784 Hz) and verify that muting prevents them. They also exercise mid-construction skipping, rather than only the initial skip. The recorded walkthrough is silent; hear completion audio in the live demo.

Remaining visual opportunities: more bespoke artwork per approved curriculum region and a smoother cross-chapter transition. Neither requires replacing the current design. Actual curriculum approval, production access, scoring, lesson content, and planner behavior remain untouched.

## One-page and chapter refinement

The demo now fits one viewport at 1440×1000, 820×1180, and 390×844. The mobile map scrolls internally; very short screens and enlarged text can still use natural page overflow. Supporting copy and review controls are compact so the map receives the space. Chapter changes use a short directional transition and respect reduced motion.

- Trail outlines, fill, and progress are painted in separate layers, preventing segment borders overlapping at the checkpoint.
- The checkpoint sign sits beside and below the landing, off the trail. Responsive geometry reserves room for the bunny's ears.
- Readee's ground shadow is hidden only in this demo.
- Completed nodes remain fully opaque during bunny travel, even while interaction is temporarily disabled.
- The assessment origin uses a regular checkmark as its main icon.
- Garden beds, story-picnic artwork, and a woodland reading nook distinguish regions. Illustration proportions are preserved when the landscape frame changes shape.
- The later-entry Sentence Trail fixture now uses the valley artwork and its correct presentation subtitle instead of inheriting the first chapter's garden theme. No lesson prescriptions changed.

Files touched in this follow-up: `JourneyExperience.tsx`, `JourneyWorld.tsx`, `JourneyLandscape.tsx`, `useJourneyCamera.ts`, `geometry.ts`, `journey-v2.module.css`, `fixtures.ts`, `tests/journey-v2.test.ts`, the browser harness, and these review artifacts.

Verification: 20 Journey unit tests, typecheck, and scoped lint pass. Browser assertions additionally cover viewport containment, hidden bunny shadow, opaque completion during travel, correct trail paint order, and checkpoint bunny clearance. The complete desktop/tablet/mobile and ten-fixture flow passes; baseline analytics CSP messages remain recorded separately.

## Proportional-fit correction

The previous one-page pass incorrectly resized the scene horizontally and vertically by different amounts. That implementation is replaced with one uniform CSS transform: `min(availableWidth / sceneWidth, availableHeight / sceneHeight)`. The complete chapter is centered inside the viewport with its proportions intact; extra room stays as cream margin. No map or page vertical scrolling is required at the tested sizes.

Mobile uses a shorter authored route and docks the current lesson title/action below the scene so the complete chapter remains visible. All route layers, destinations, landmarks, and bunny movement share the same scene coordinates and scale. Browser assertions verify equal X/Y scale, full scene containment, and no vertical map overflow across desktop, tablet, mobile, and the existing fixture flows. Twenty Journey tests, typecheck, and scoped lint pass. The checkpoint sign also clears the fourth lesson card.

## Restored original map layout

At Filip's request, both the forced one-page frame and the proportional zoom-to-fit experiment have been removed. Journey again uses the original full-width map, original desktop/portrait geometry, full-size bunny, and lesson card attached to its destination. The original scrolling/camera behavior and surrounding layout are restored. Completion audio and the small checkmark/path fixes remain. The most recent restoration screenshots supersede the fit-layout captures.

### Viewport framing, September 11

The surrounding page is now a compact reader header and a centered adventure. The large introductory heading, duplicated assessment summary, membership block, and persistent review footer have been removed. Parent explanations remain behind **Why this journey?**; access/progress/replay controls live behind the settings control. The existing Design studio fixture selector remains available.

The page and map have no vertical scrolling. The complete landscape chapter fits proportionally on desktop, using the height reclaimed from the surrounding page. Tablet and phone preserve a readable scene and use horizontal exploration; the camera now follows that horizontal axis and still yields to manual interaction. There is no independent horizontal/vertical stretching. Bunny movement, the attached current lesson card, artwork, reveal, completion audio, checkpoint, and fixture-only access behavior are preserved.

Verified in the actual browser at 1440×1000, 820×1180, 390×844, and 320×780, plus a separate 1440×900 visual check. The browser harness asserts page-height containment and zero vertical map overflow, and exercises lesson completion/audio, bunny travel, locked access, checkpoint progression, ten fixtures, reveal replay/skip, parent evidence, and reduced motion. Twenty unit tests, typecheck, and scoped ESLint pass. Existing analytics CSP warnings remain; no browser runtime errors or production writes were observed.
