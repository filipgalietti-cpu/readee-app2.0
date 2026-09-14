import type { NextResponse } from "next/server";

/**
 * Copy every cookie one response has set onto another.
 *
 * The proxy refreshes the Supabase session onto its pass-through response. A
 * redirect built afterwards starts from an empty cookie jar, so without this
 * the rotated tokens never reach the browser: it keeps sending the refresh
 * token Supabase revoked, the next refresh fails with "Invalid Refresh Token:
 * Already Used", and the family is signed out.
 */
export function carryCookies<T extends NextResponse>(from: NextResponse, to: T): T {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie);
  return to;
}
