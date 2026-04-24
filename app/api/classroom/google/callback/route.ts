import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, upsertConnection } from "@/lib/classroom/google";
import { trackError } from "@/lib/observability/track";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  if (err) {
    return NextResponse.redirect(
      new URL(`/classroom?google_error=${encodeURIComponent(err)}`, req.url),
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(
      new URL(`/classroom?google_error=missing_params`, req.url),
    );
  }

  let parsed: { u: string; r: string };
  try {
    parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
  } catch {
    return NextResponse.redirect(
      new URL(`/classroom?google_error=bad_state`, req.url),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== parsed.u) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(parsed.r ?? "/classroom")}`, req.url),
    );
  }

  let tokens: Awaited<ReturnType<typeof exchangeCodeForTokens>>;
  try {
    tokens = await exchangeCodeForTokens(code);
  } catch (e) {
    console.error("Google token exchange failed:", e);
    trackError(e, {
      route: "api.classroom.google.callback",
      userId: user.id,
      tags: { stage: "token_exchange" },
    });
    return NextResponse.redirect(
      new URL(`/classroom?google_error=token_exchange`, req.url),
    );
  }

  // Decode the id_token for the Google email (middle segment is JWT payload).
  let googleEmail = user.email ?? "unknown@google";
  if (tokens.id_token) {
    try {
      const payload = JSON.parse(
        Buffer.from(tokens.id_token.split(".")[1], "base64url").toString("utf8"),
      );
      if (payload.email) googleEmail = payload.email;
    } catch {
      /* ignore */
    }
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await upsertConnection({
    profile_id: user.id,
    google_email: googleEmail,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: expiresAt,
    scope: tokens.scope,
  });

  return NextResponse.redirect(new URL(parsed.r || "/classroom", req.url));
}
