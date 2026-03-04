"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import type { ReactNode } from "react";

export default function PostHogProvider({ children }: { children: ReactNode }) {
  if (typeof window === "undefined" || !posthog.__loaded) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
