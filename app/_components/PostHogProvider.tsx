"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * PostHog provider — product analytics + acquisition tracking.
 *
 * The SDK is loaded post-interactive via dynamic `import("posthog-js")`
 * inside the effect, so it never ships in any page's first-load bundle
 * (the reason this file was previously a no-op). Turning it back on
 * gives us:
 *   - autocapture (clicks) + pageviews → basic behavior
 *   - $referrer / $referring_domain / utm_* on first touch → "how did
 *     they find us" for every new signup
 *   - identify() on login so events tie to the real person/email, and
 *     reset() on logout so a shared device doesn't merge two people.
 *
 * Requires NEXT_PUBLIC_POSTHOG_KEY (+ optional NEXT_PUBLIC_POSTHOG_HOST).
 * If the key is absent it stays a clean no-op.
 */
export default function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const firstView = useRef(true);

  // ── Init once + identify the logged-in user ──────────────────────
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    let cancelled = false;

    (async () => {
      const posthog = (await import("posthog-js")).default;
      if (cancelled) return;

      if (!posthog.__loaded) {
        posthog.init(key, {
          api_host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          // We fire $pageview manually on route change (App Router SPA
          // nav doesn't reload), so let init capture the very first one.
          capture_pageview: true,
          capture_pageleave: true,
          autocapture: true,
          // Only create person profiles for identified (signed-in) users —
          // anonymous visits still capture their referrer/utm and merge onto
          // the person once they sign up + identify.
          person_profiles: "identified_only",
          // COPPA: this app is used by children under a parent's account, so
          // we must never screen-record them. Session replay stays hard off
          // here in code, regardless of any PostHog project-level setting.
          disable_session_recording: true,
        });
      }

      // Tie events to the real user so a search by email resolves.
      try {
        const { data } = await supabaseBrowser().auth.getUser();
        const u = data?.user;
        if (u && !cancelled) {
          posthog.identify(u.id, { email: u.email });
        }
      } catch {
        /* not signed in / auth unavailable — stay anonymous */
      }

      // Keep identity in sync: identify on login, reset on logout so a
      // shared family device doesn't fold two accounts into one person.
      try {
        supabaseBrowser().auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            posthog.identify(session.user.id, { email: session.user.email });
          } else if (event === "SIGNED_OUT") {
            posthog.reset();
          }
        });
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Pageview on client-side route change ─────────────────────────
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    // init already captured the first pageview; skip the mount fire.
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    import("posthog-js")
      .then((m) => {
        if (m.default.__loaded) m.default.capture("$pageview");
      })
      .catch(() => {});
  }, [pathname]);

  return <>{children}</>;
}
