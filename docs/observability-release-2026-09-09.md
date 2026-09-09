# Payment and monitoring release — September 9, 2026

This release is independent of the assessment behavior changes in PR #30, whose
physical microphone acceptance check remains pending.

## Verified findings

Production was at `6e2939a0`. That commit already contains the Daily system-ID
allowance and the SafeLinks/router-state Sentry filters. The earlier report was
stale on those points. Added regression tests explicitly use different QC and
Daily IDs and confirm ordinary teachers remain capped. The four Daily healers
now preserve the failure reason returned by their underlying regeneration call.

Using the Sentry API, seven issues (N, P, Q, R, S, G, J) were ignored as confirmed
noise and the two placement issues (D, F) were resolved in release `6e2939a0`.
The M_ID frames were `app:///executors/200.js`; the placement events belonged to
the older `81470416` release. Other unresolved issues were left intact.

## Changes

- Stripe subscription events and checkout completion reconcile the customer's
  current subscription state. Missing profiles/subscriptions, unmapped prices,
  provider outages, database errors and concurrent profile changes return 503
  with an operation-tagged Sentry event. Old checkout/deletion events cannot
  revive a canceled subscription or remove a newer active subscription.
- Failed credit-pack grants are retryable. Existing unique checkout-session
  constraints keep top-ups idempotent. Cancellation/team emails use event-based
  provider idempotency keys; no new payment-creation operation was added.
- Assessment saves and signup account/profile/child creation report handled
  failures with operation names, provider codes and correlation IDs. Public
  signup and client-side auth failures are instrumented separately.
- All 18 cron routes report returned server failures, `ok:false`/`success:false`
  responses and thrown exceptions. Expected auth/validation responses are quiet.
  Responses remain consumable after inspection.
- Browser Sentry identity follows auth independently of PostHog configuration,
  uses the opaque parent ID, clears on logout, and guards against stale initial
  lookups. Error events omit request bodies, headers, cookies, query strings,
  email addresses and IP addresses. Session Replay remains off.
- Narrow filters cover Zalo errors and extension/executors frames while retaining
  genuine `app:///_next` errors. No origin allowlist is used.
- GitHub CI's build previously exhausted Node's default ~4 GB heap; the build step
  now permits a 6 GB heap and provides build-only Stripe/Supabase placeholders
  for SDK initialization. No production credentials enter CI, and its artifact
  is never deployed. Vercel builds with its own environment configuration.

## Validation and scope

Tests exercise the actual webhook and signup/placement routes with injected
provider/database failures, subscription retries and stale deliveries, identity
logout races, returned/thrown cron failures, privacy scrubbing, and the actual
Sentry filter integration. All external email/payment mutations are mocked in
these tests. No customers were charged, no family records were rewritten, no
emails were sent, and no credit top-ups were applied as part of this verification.

Webhook reconciliation follows Stripe's documented duplicate and out-of-order
delivery model: https://docs.stripe.com/webhooks?lang=node .
