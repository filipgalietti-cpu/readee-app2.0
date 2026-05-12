import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Public testimonial feed for the marketing site.
 *
 * GET → 200 { ok: true, testimonials: Testimonial[] }
 *
 * Returns only rows that are BOTH approved AND have marketing_consent.
 * Capped at 12 most recent so the marketing component stays light.
 *
 * Read-only, no auth — but uses the service-role admin client because
 * the parent_testimonials RLS policies are owner-only / admin-only.
 * Service role bypasses RLS, but we only project the public-safe
 * columns (no email, no user_id).
 *
 * Cached at the edge for an hour. New approvals show up within an
 * hour without a redeploy.
 */
export const revalidate = 3600; // 1 hour

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
    Vary: "Origin",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(req.headers.get("origin")),
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}

export async function GET(req: Request) {
  const headers = corsHeaders(req.headers.get("origin"));

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("parent_testimonials")
    .select("display_name, child_grade, rating, quote, approved_at")
    .eq("approved", true)
    .eq("marketing_consent", true)
    .order("approved_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("[public-testimonials] query failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not load testimonials." },
      { status: 500, headers },
    );
  }

  // Shape to a stable public schema — don't leak DB column names that
  // might change. Trim to only fields the marketing component renders.
  const testimonials = (data ?? []).map((t: any) => ({
    name: t.display_name ?? "A Readee parent",
    role: t.child_grade ?? null,
    rating: t.rating ?? 5,
    quote: t.quote,
    approvedAt: t.approved_at,
  }));

  return NextResponse.json({ ok: true, testimonials }, { status: 200, headers });
}
