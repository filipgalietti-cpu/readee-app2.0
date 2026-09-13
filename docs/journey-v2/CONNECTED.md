# Connected Journey adventure

The authenticated `/journey` now renders the approved adventure view. The report and reveal already link to `/journey?child=…&from=placement`; that entry plays the saved magician routine, then constructs the route inside the map frame. The real report visuals and assessment scoring are unchanged.

## Data and access

`loadJourneySnapshot` still owns authentication, child ownership, saved placement, progress and billing. `buildAdventureView` is a view adapter over `assignedJourneyCatalog`, not the new curriculum planner. It retains the catalog's exact standard IDs and order. Groups are the existing grade/domain units, split into pages of at most three lessons for the viewport. The page split has no instructional meaning.

`lessonCompleted` still recognizes the existing practice-results and lesson-progress completion sources. `freeJourneyLesson` preserves both the current sample and grandfathered free-unit access. The view gets access flags; `JourneyClient.start` and the authenticated `/learn` page retain their access checks. The existing PaywallModal, billing confirmation retry, trial eligibility, and checkout return behavior are reused.

The view never imports demo lesson metadata, fake entitlement rules, pilot release manifests or proposed prescription mappings. No G1.U1 approval/release status changed. It does not activate adaptive replanning or claim exact diagnostic prescriptions.

## Completion and landmarks

The Astra runner returns the standard ID in the Journey URL. That parameter only requests an animation: Journey verifies it against saved completion before moving the bunny. A URL alone grants no completion credit. No lesson is completed by clicking its map destination.

The book landmark is a reading stop / unit review, not an exam. It summarizes actual progress and permits browsing onward. Only the last page of a whole completed unit offers the existing 20-carrot keepsake. The legacy grade/unit chest IDs and 50-carrot final trophy ID are retained, so previously claimed rewards remain claimed. Actual writes still go through JourneyClient's existing checked-write and award-carrots path.

## Shared presentation

`app/_components/journey` contains the single renderer, landscape, geometry, horizontal viewport controller and magician reveal. The original V2 demo imports these through compatibility exports. The classic Journey renderer remains available in `/demo/journey` and is lazy-loaded; it does not load into the new screen up front.

The production loading surface reserves the same adventure frame. `/journey` is immersive, with no site header/sidebar/footer. The parent plan/report, lesson navigation, membership and progress remain reachable from the compact header and map destinations.

## Verification

- `tests/journey-adventure.test.ts`: catalog/order preservation, pagination, access parity, grandfathering, both progress sources, provisional/missing assessment, legacy reward IDs, all-completed state, and absence of demo dependencies from the shared renderer.
- Existing Journey, placement access and loader suites remain applicable.
- `scripts/journey-connected-browser.cjs`: desktop/tablet/mobile, actual catalog adapter and production view with synthetic input and IO-free callbacks, lesson launch/access, saved return hop, chapter changes, changed reading placements, and reward callbacks. No live child data or writes.
- `scripts/journey-v2-reveal-browser.cjs`: shared reveal stability, magician routine, early dismissal, natural completion, replay and reduced motion.
- `/demo/journey-v2/connected` is the isolated integration review surface; its callback results are shown in the review menu and never sent to Supabase or Stripe.

A signed-in family session with real lesson persistence and a real checkout was not performed by automation. Those paths retain their existing loaders, handlers and authorization checks; server-side tests cover the access boundary.

Final validation: 46 focused tests pass, scoped ESLint passes, and the complete optimized production build passes in an isolated copy with an 8 GB Node heap (the default 4 GB heap exhausted memory). The first isolated typecheck attempt omitted test-imported curriculum documents; including those documents resolved that setup failure. `savedJourneyHref` additionally waits for the Astra completion save before navigation and omits the completion hint when the save fails. No runtime child records, checkout, curriculum release, or production deployment were changed by verification.

## Magic audio

The saved six-second magician routine now drives a quiet wand shimmer, reveal accent and musical ta-da. Native `mtBody` animation start anchors all notes. Audio is unlocked by the report/reveal entry gesture; an autoplay-blocked context remains silent rather than queuing sounds for a later interaction. Skip, mute and unmount disconnect the entire routine immediately. No generated speech or additional network request is required.

`tests/journey-magic-audio.test.ts` verifies timing, cancellation and autoplay blocking. `scripts/journey-magic-audio-browser.cjs` verifies actual running Web Audio playback and muted replay. Release validation: all 749 tests pass, typecheck passes, and desktop/mobile reveal checks pass, including reduced motion.

The final optimized build with magician audio also passed. A broader lint pass reports four pre-existing `no-explicit-any` errors in the older loader/access test mocks (`tests/journey-load.test.ts` and `tests/placement-start-access.test.ts`), plus existing sidebar warnings. The new audio and Journey components pass scoped lint. These existing findings were not suppressed.
