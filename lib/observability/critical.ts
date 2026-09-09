import { trackError } from "./track";

/** Operational context only: never attach provider messages, forms, audio or payment bodies. */
export function reportFailure(operation: string, error: unknown, context: {
  route: string; userId?: string | null; requestId?: string; eventId?: string; eventType?: string;
}) {
  const e = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const code = typeof e.code === "string" && /^[a-zA-Z0-9_]{1,64}$/.test(e.code) ? e.code : "unknown";
  trackError(new Error(`${operation} failed`), {
    route: context.route, userId: context.userId,
    tags: { operation, error_code: code, ...(context.eventType ? { event_type: context.eventType } : {}) },
    extra: { request_id: context.requestId, stripe_event_id: context.eventId,
      ...(typeof e.status === "number" ? { provider_status: e.status } : {}) },
  });
}
