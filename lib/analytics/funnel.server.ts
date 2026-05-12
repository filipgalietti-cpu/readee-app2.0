import "server-only";

import { getPostHogServer } from "@/lib/posthog/server";
import type { FunnelEvent, FunnelProps } from "./funnel";

/**
 * Server-side funnel fire.
 *
 * Importable only from server modules (route handlers, webhook
 * handlers, server actions). The `server-only` marker fails the
 * build if a "use client" file pulls this in by mistake — that
 * would otherwise ship posthog-node to the browser.
 *
 * Pass the Supabase auth user id as `userId` — that becomes the
 * PostHog distinct_id so server fires line up with the
 * trackFunnelClient calls from the same parent in PostHog.
 */
export async function trackFunnel(
  event: FunnelEvent,
  userId: string | null,
  props: FunnelProps = {},
): Promise<void> {
  if (!userId) return; // anon events not worth tracking for funnel
  const ph = getPostHogServer();
  if (!ph) return;
  try {
    ph.capture({
      distinctId: userId,
      event,
      properties: { ...props, surface: "server" },
    });
    // Flush so serverless can shut down cleanly without losing the
    // event. posthog-node's default batching loses events on cold
    // process exit.
    await ph.flush();
  } catch {
    /* silent */
  }
}
