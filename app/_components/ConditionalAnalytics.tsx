"use client";

import { usePathname } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Vercel Speed Insights wrapper that skips admin routes.
 *
 * Web Analytics is deliberately NOT mounted here. The project has it
 * switched off in Vercel (so the script shipped and reported nothing),
 * and the app is the child-facing surface — parent-side traffic
 * analytics belong on the marketing site, not here.
 *
 * Speed Insights only reports performance timings (no cookies, no
 * identifiers). The /owner/* surface is parent-of-the-app (Filip +
 * Jen only) and was dragging the public Real Experience Score down
 * to RES 80 — those pages have p75 scores of 13-24 because they're
 * data-heavy dashboards with no perf budget. They're also
 * irrelevant to the public app experience.
 *
 * Skipping the component on those pages means no event fires to
 * Vercel, so the average stays a true reflection of what real
 * parents + kids experience.
 *
 * Admin routes skipped:
 *   /owner/*     — platform admin (us)
 *   /admin/*     — tenant admin (legacy classroom; mostly unused)
 */
const ADMIN_PREFIXES = ["/owner", "/admin"];

export default function ConditionalAnalytics() {
  const pathname = usePathname();
  const isAdminRoute = ADMIN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (isAdminRoute) return null;
  return <SpeedInsights />;
}
