/**
 * Routes that require authentication. The proxy redirects a signed-out visitor
 * on any of these to /login before the page ever renders.
 *
 * This must list every URL segment under `app/(protected)/`. A protected page
 * missing here still renders, and its `requireProfile()` throws "Unauthorized"
 * — the `(protected)` layout redirects to /login in parallel so the visitor
 * lands in the right place, but the thrown page error is still reported as an
 * unhandled 500 (Sentry JAVASCRIPT-NEXTJS-D on /placement, 2755a50d on
 * /explore). Gating here means the render never starts.
 *
 * `tests/protected-route-gating.test.ts` walks `app/(protected)` and fails the
 * build if a segment is added without an entry here.
 */
export const AUTH_REQUIRED_PREFIXES: readonly string[] = [
  "/learn",
  "/lesson",
  "/practice",
  "/practice-hub",
  "/journey",
  "/stories",
  "/stories-for-me",
  "/discover",
  "/daily",
  "/analytics",
  "/dashboard",
  "/settings",
  "/account",
  "/billing",
  "/word-bank",
  "/upgrade",
  "/roadmap",
  "/shop",
  "/leaderboard",
  "/levels",
  "/more",
  "/help",
  "/feedback",
  "/review",
  "/fluency",
  "/question-bank",
  "/notifications",
  "/placement",
  "/assessment-results",
  "/learning-report",
  "/parent-lesson",
  "/luna",
  "/carrot-rewards",
  "/classroom",
  "/classroom-join",
  "/admin",
  "/owner",
  "/play",
  // Internal audit / dev surfaces — also under (protected).
  "/assessment-audit",
  "/classroom-dev",
  "/dev",
  "/interactive-audit",
  "/k-audit",
  "/k-interactive-audit",
  "/lesson-audit",
  "/phoneme-audit",
  "/prototype",
  "/question-audit",
  // Added Sep 16 2026 after Sentry 2755a50d ("Unauthorized" on GET /explore):
  // both were under (protected) but missing here.
  "/explore",
  "/assessment",
];

/** True when `pathname` is, or is nested under, an auth-required prefix. */
export function requiresAuth(pathname: string): boolean {
  return AUTH_REQUIRED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}
