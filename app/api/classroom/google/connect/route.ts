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

  // The state parameter carries the profile_id + final redirect so
  // the callback knows who's connecting + where to send them next.
  const statePayload = {
    u: user.id,
    r: redirectTo,
    n: crypto.randomUUID(),
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  return NextResponse.redirect(googleAuthorizeUrl(state));
}
