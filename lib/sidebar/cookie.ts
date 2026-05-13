/**
 * Sidebar open-state persistence via cookie.
 *
 * Server reads on every request to decide the initial margin of the
 * main content column. Client writes whenever the user toggles. With
 * both sides agreeing on the initial state from the same source of
 * truth, there's no post-hydration margin reflow — which was a major
 * CLS contributor (Speed Insights flagged CLS = 0.38).
 *
 * Default: collapsed (false). First-time users see the narrow rail
 * and can expand if they want.
 */

const COOKIE_NAME = "readee_sidebar_open";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readSidebarOpenFromCookieString(cookieString: string | null | undefined): boolean {
  if (!cookieString) return false;
  const match = cookieString
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;
  return match.split("=")[1] === "true";
}

/** Client-side setter. Writes a 1-year cookie. */
export function writeSidebarOpenCookie(open: boolean): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${open ? "true" : "false"}; max-age=${ONE_YEAR_SECONDS}; path=/; samesite=lax`;
}

export const SIDEBAR_COOKIE_NAME = COOKIE_NAME;
