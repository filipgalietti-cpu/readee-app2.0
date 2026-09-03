/**
 * Client-side funnel surface (and the shared event-name type).
 *
 * The conversion events needed to measure CPA before any paid acquisition.
 * Keep the event names stable — they're referenced in PostHog dashboards,
 * retention queries, and (eventually) ad platform conversion pixels. Append
 * new ones; never rename an existing one.
 *
 * The funnel, in order:
 *   signup_complete -> kid_added -> assessment_start -> placement_complete
 *   -> report_view -> checkout_started -> trial_started -> subscription_active
 * with subscription_canceled as the exit. first_lesson_complete is activation,
 * measured off to the side of the purchase path.
 *
 * Server-side firing lives in `./funnel.server` (imports posthog-node
 * + the server-only marker). Keeping these two surfaces in separate
 * files means "use client" components can `import { trackFunnelClient }`
 * from here without dragging the server PostHog client into the
 * browser bundle.
 *
 * Failures are silent — telemetry should never block the user from
 * completing the funnel step itself.
 */

export type FunnelEvent =
  | "funnel.signup_complete"
  | "funnel.kid_added"
  /** The child actually began the reading assessment (mic open, first word shown). */
  | "funnel.assessment_start"
  | "funnel.placement_complete"
  /** The parent reached the report (the reveal wizard opened with a result loaded). */
  | "funnel.report_view"
  /** The parent tapped "Start <name>'s Reading Journey" and we handed off to Stripe. */
  | "funnel.checkout_started"
  | "funnel.first_lesson_complete"
  | "funnel.trial_started"
  | "funnel.subscription_active"
  | "funnel.subscription_canceled";

export type FunnelProps = Record<string, string | number | boolean | null | undefined>;

/**
 * Client-side fire. Use from "use client" components. Reads the
 * already-mounted posthog-js singleton — no userId arg needed
 * because posthog-js inherits the distinct_id from identification
 * earlier in the session (set in ClientProviders).
 */
export function trackFunnelClient(
  event: FunnelEvent,
  props: FunnelProps = {},
): void {
  if (typeof window === "undefined") return;
  try {
    // Dynamic import so this file stays usable in server modules
    // without bundling posthog-js. The cost is one tiny chunk per
    // first client event, then cached.
    import("posthog-js")
      .then((m) => {
        m.default.capture(event, { ...props, surface: "client" });
      })
      .catch(() => {
        /* silent */
      });
  } catch {
    /* silent */
  }
}
