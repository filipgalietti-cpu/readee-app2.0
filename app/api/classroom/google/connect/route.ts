import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { googleAuthorizeUrl } from "@/lib/classroom/google";

/**
 * GET /api/classroom/google/connect?redirect=/classroom/<id>
 *
 * Starts the Google OAuth flow. Redirects the teacher to Google's
 * consent screen with Classroom scopes. After consent, Google redirects
 * back to /api/classroom/google/callback which exchanges the code for
 * tokens.
 */
export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const url = new URL(req.url);
  const redirectTo = url.searchParams.get("redirect") ?? "/classroom";

  // Fail gracefully if the operator hasn't configured the Google
  // OAuth credentials yet — redirect back with a clear error instead
  // of a 500.
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID || !process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    const back = new URL(redirectTo.startsWith("/") ? redirectTo : "/classroom", req.url);
    back.searchParams.set("google_error", "not_configured");
    return NextResponse.redirect(back);
  }

  const statePayload = {
    u: user.id,
    r: redirectTo,
    n: crypto.randomUUID(),
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  try {
    return NextResponse.redirect(googleAuthorizeUrl(state));
  } catch (e) {
    console.error("googleAuthorizeUrl failed:", e);
    const back = new URL(redirectTo.startsWith("/") ? redirectTo : "/classroom", req.url);
    back.searchParams.set("google_error", "authorize_url");
    return NextResponse.redirect(back);
  }
}
