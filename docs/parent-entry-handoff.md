# Parent entry and lesson integration

The assessment measures the starting point. A lesson teaches and practices a
skill. This change preserves the existing assessment, celebration, hold-to-build
sequence and seven narrated reveal cards. The last reveal card now opens the
free first unit assigned by placement. It does not create a Stripe checkout.

## Entry flow

`/dashboard` with no children shows `ParentReaderSetup` in the normal Readee
chrome. It uses the existing Baloo/Nunito fonts, violet action gradient,
violet/indigo surfaces, Glyph icons and bunny artwork. There is no full-screen
takeover and no automatic narration or keyboard focus.

The parent enters an optional nickname and an explicit K–4 enrollment grade.
Missing grade is rejected. No reading level is assigned during setup.
`/api/onboarding/reader` saves the child on this first submit, with an
account-scoped request UUID reused on retries and after a same-tab refresh.
The UUID is the child primary key. Read errors prevent creation; an ambiguous
write is recovered only after confirming the child belongs to this parent.
An existing reader sends the parent back to the dashboard. Welcome email work
uses the existing deduplicated sender after a newly saved reader.

`/placement/ready?child=...` verifies parent ownership and gives an explicit
handoff before the existing `/placement` experience. The parent can return
later. Setup never starts the microphone or calls personalized speech generation.

## What Astra's lesson rebuild needs to keep

- Stable `LessonDef.standard` values and registry entries. Both assessed lessons
  and sample previews resolve the existing server-side V2 catalog by standard.
- The normal `/learn` route continues to use `LessonV2Client`, which attributes
  completion to the child and persists learning progress.
- `/explore` picks an existing free lesson in each grade. `?preview=1` only
  permits the existing free catalog units; it cannot unlock a paid unit or an
  arbitrary child's assessed plan. `PreviewLesson` passes no progress-writing
  callbacks, so samples neither create children nor save assessed results.
- Two optional player props, `headerNote` and `onExit`, put sample navigation
  inside the existing full-screen frame. `LessonShellDesktop.headerNote` is the
  matching slot. Existing lessons are unaffected when these props are omitted.
- Sample completion returns to setup; assessed lesson completion retains the
  journey destination. No pond/demo lesson from the HTML concept was imported.

## Verification

491 unit tests and TypeScript pass. New tests cover setup validation, missing
grades, server read/write failures, lost-response retries, foreign reader IDs,
authentication, and preview access boundaries.

An isolated browser run uses synthetic accounts/database data and verifies:
mobile/desktop setup; exploration with zero child rows; failed save followed by
a refresh and successful retry; one persisted fourth-grade child; no assigned
reading level at setup; the handoff; all seven existing reveal cards; and a
second-grade placement opening `RI.2.1` with no checkout requests or runtime
errors. The full assessment and real microphone are separate acceptance checks.

No production family data, pricing, trial length, child caps or lesson content
were changed. This branch is stacked on assessment PR #30, including its
atomic-save migration and pending physical microphone acceptance check.
