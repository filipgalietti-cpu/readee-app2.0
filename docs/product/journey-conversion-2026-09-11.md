# Journey and membership rollout

The assessment leads to the parent report, then `/journey`. The journey explains the child's actual starting point and assigned lessons before asking the parent to start Readee+. The existing bunny path, hops, chest rewards and completion celebrations remain the progression interface.

## Parent flow

1. Open the free assessment report and its enrollment comparison.
2. Open the saved custom journey. See the same grade comparison, the first teaching priorities and real upcoming lesson titles.
3. Choose monthly or annual Readee+, then enter a card in Stripe Checkout. A less prominent link opens an included starter lesson.
4. Return to the same child's journey. Show the next lesson once subscription access is confirmed. A delayed webhook is reconciled against the authenticated parent's Stripe customer; the URL alone never grants access.
5. Complete a lesson and return to the bunny's next stop. A paid next lesson opens the parent membership offer for a free account.

Confirmed and provisional placement retain their existing meanings. No score is changed for conversion, no missed skill is invented, and no improvement deadline is promised.

## Access and pricing

| Surface | Free account | Readee+ |
| --- | --- | --- |
| Assessment, saved report, journey preview | Available | Available |
| Assigned journey lessons, new accounts | First assigned lesson, replayable | Full journey |
| Existing families' included units | Preserved | Full journey |
| Explore | Five unscored K–4 samples | Same previews, plus full lesson access |
| Other activities | Existing limited story, practice and Luna allowances; existing Daily/community access | Existing Readee+ entitlements |

The new-account cutoff is **September 12, 2026 at 00:00 UTC (September 11 at 8 p.m. Eastern)**, in `lib/journey/lesson-access.ts`. Accounts created before then retain their previous included units. This future cutoff avoids taking away access that a family received before deployment. Missing historical creation dates also retain the old allowance. Changing this policy later requires updating the shared rule, billing copy, and route tests together.

Pricing remains **$9.99/month** or **$83.88/year**. Eligible accounts get the existing **14-day, card-required trial**. Returning subscribers see immediate recurring charges rather than a new free-trial promise. Exact billing dates and applicable taxes appear in Stripe Checkout. Trial-ending and cancellation templates now describe the saved report and included starter lesson instead of promising every family a whole free unit. Nothing in this release sends an email or changes Stripe products, trial length, assessment scoring, enrollment, or authored lesson content.

## Loading and billing reliability

- Authenticated server snapshot resolves child ownership, plan, assessment and progress before the journey renders. A premium account does not briefly see a free paywall while a client store loads.
- One stable journey placeholder replaces timed skeleton swaps. Loading errors keep a retry action.
- The path measures its SVG segments once per layout, without repeatedly measuring growing path prefixes. It no longer scrolls a parent away from the introduction on initial arrival. Completion-driven camera movement remains.
- Monthly/annual selection, terms and checkout live in one offer shared with the modal. The modal contains keyboard focus, closes with Escape, and keeps its close button visible on a small screen.
- Checkout retries reuse an idempotency key. Customer creation and billing-profile failures are checked and reported. Already-paid profiles are not offered another subscription.
- Success/cancel return paths preserve the child. Confirmation failures offer retry without prompting for another card. Verification uses Stripe's existing reconciliation helper.
- Direct lesson URLs and the legacy library cannot bypass the new allowance. `preview=1` opens only the five samples advertised in Explore.

## Measurement

Existing signup, placement, checkout, trial, paid-subscription and first-lesson events remain. Added:

- `funnel.journey_viewed`
- `funnel.journey_trial_clicked`
- `funnel.journey_sample_clicked`
- `funnel.journey_paywall_viewed`
- `funnel.checkout_return_confirmed`

Events contain operational state and billing choice, not child names, speech, scores or payment details. Compare journey visits → checkout starts → confirmed trials → first lesson completions. Do not interpret this release as proven conversion uplift before real families use it.

## Verification

The synthetic `/demo/journey` route covers new, legacy, paid, lapsed, completed, unconfirmed, checkout-return, canceled and loading states. Production demos remain disabled. `scripts/journey-browser.cjs` blocks POST/PATCH writes and simulates checkout failure and delayed confirmation. It checks 320–1440 px viewports, horizontal overflow, plan selection, idempotent retries, the modal, bunny movement, and the paid boundary after the completion animation.

Unit and route tests cover ownership, unavailable billing/progress data, new versus legacy allowances, direct-link gates, fixed previews, card collection, once-per-account trial behavior, checkout idempotency, and authoritative subscription confirmation. The full suite passed: 637 tests across 72 files. TypeScript and the isolated CI/Vercel production builds are release gates. Existing dashboard and lesson lint debt is outside this change; new components receive targeted lint checks.

No real card was charged and no family record was modified for testing. Real trial-to-paid conversion and a live card transaction cannot be established by synthetic browser tests.
