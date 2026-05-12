import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Marketing-site newsletter capture.
 *
 * POST { email: string, source?: string }
 *   → 200 { ok: true, alreadySubscribed?: boolean }
 *   → 400 on invalid input
 *
 * Stores in newsletter_subscribers (migration 103). Re-subscribing the
 * same address is a no-op — we return 200 with alreadySubscribed=true
 * so the form's success state still fires.
 *
 * CORS: this endpoint is hit from readee.app (marketing site) which
 * is a different origin than learn.readee.app, so we set permissive
 * CORS headers. Body-only / no cookies / no auth — safe to expose.
 */

const ALLOWED_ORIGINS = new Set([
  "https://readee.app",
  "https://www.readee.app",
  "http://localhost:3000",
  "http://localhost:3001",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const ok = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://readee.app";
  return {
    "Access-Control-Allow-Origin": ok,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  let body: { email?: unknown; source?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bad JSON." },
      { status: 400, headers },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source =
    typeof body.source === "string" ? body.source.trim().slice(0, 64) : null;

  // Permissive email regex — RFC-correct validation isn't worth the
  // complexity. We just need to catch the obvious typos. The mailing
  // service will hard-bounce anything truly malformed.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "Invalid email." },
      { status: 400, headers },
    );
  }

  const sb = supabaseAdmin();
  const { data: existing } = await sb
    .from("newsletter_subscribers")
    .select("id, unsubscribed_at")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    // Re-subscribe if they previously unsubscribed.
    if ((existing as any).unsubscribed_at) {
      await sb
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: null, source })
        .eq("id", (existing as any).id);
    }
    return NextResponse.json(
      { ok: true, alreadySubscribed: true },
      { status: 200, headers },
    );
  }

  const { error } = await sb
    .from("newsletter_subscribers")
    .insert({ email, source });
  if (error) {
    console.error("[newsletter] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save your email. Try again in a sec." },
      { status: 500, headers },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200, headers });
}
