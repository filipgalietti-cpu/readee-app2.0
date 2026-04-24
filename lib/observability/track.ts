import * as Sentry from "@sentry/nextjs";

/**
 * Capture a swallowed error — cases where we catch an exception but
 * still return a normal response (e.g., server action returns
 * `{ok: false, error: "..."}` instead of throwing). Without this,
 * those errors never reach Sentry and we have no visibility.
 *
 * Next.js already captures thrown errors from route handlers + server
 * components via instrumentation.ts → Sentry.captureRequestError. Do
 * NOT double-capture by calling this on errors you also rethrow.
 */
export function trackError(
  err: unknown,
  context: {
    route: string;
    userId?: string | null;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
): void {
  try {
    Sentry.withScope((scope) => {
      scope.setTag("route", context.route);
      if (context.userId) scope.setUser({ id: context.userId });
      if (context.tags) {
        for (const [k, v] of Object.entries(context.tags)) {
          scope.setTag(k, v);
        }
      }
      if (context.extra) scope.setExtras(context.extra);
      Sentry.captureException(err);
    });
  } catch {
    // Sentry capture itself failed — never block the app on telemetry.
  }
}

/**
 * Capture a non-Error signal (something worth flagging that isn't a thrown
 * exception — e.g., AI returned malformed output, GC roster was empty when
 * it shouldn't be). Sends a "warning" event to Sentry.
 */
export function trackSignal(
  message: string,
  context: {
    route: string;
    userId?: string | null;
    level?: "info" | "warning" | "error";
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
): void {
  try {
    Sentry.withScope((scope) => {
      scope.setTag("route", context.route);
      scope.setLevel(context.level ?? "warning");
      if (context.userId) scope.setUser({ id: context.userId });
      if (context.tags) {
        for (const [k, v] of Object.entries(context.tags)) {
          scope.setTag(k, v);
        }
      }
      if (context.extra) scope.setExtras(context.extra);
      Sentry.captureMessage(message);
    });
  } catch {
    /* silent */
  }
}
