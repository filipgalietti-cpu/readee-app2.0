"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

/**
 * PostHog provider — initialization deferred to post-interactive so
 * the analytics SDK never ships in the critical path. Pages that
 * want to capture events do `import("posthog-js")` lazily through the
 * `trackEvent` helper or inline dynamic import.
 *
 * Previously this file imported posthog-js statically at the top,
 * which pulled the SDK (~70kb gzipped) into every page's first-load
 * bundle even though we never actually called `posthog.init()`. The
 * provider effectively did nothing while still costing us LCP/INP.
 *
 * Now it's a thin no-op shell so the existing import path keeps
 * working. If we eventually wire real analytics, this is the place
 * to dynamic-import posthog-js + call init inside the useEffect.
 */
export default function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Intentionally empty for now — leaves a clean home for the
    // future posthog.init() once we actually decide to enable it.
    // Loading posthog-js here will keep it off the initial bundle.
  }, []);

  return <>{children}</>;
}
