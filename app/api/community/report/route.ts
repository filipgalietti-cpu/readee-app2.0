import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/community/report — flag a published community story for review.
 * Anyone reading a story can file a report (reporter may be logged out). The
 * report lands in community_reports for the Readee team (and, later, the
 * compliance-review agent) to action.
 *
 * Body (JSON): { slug: string, reason?: string }
 */
export async function POST(req: Request) {
  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const slug = String(b?.slug ?? "").trim();
  const reason = b?.reason ? String(b.reason).trim().slice(0, 500) : null;
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: passage } = await admin
    .from("community_passages")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!passage) {
    return NextResponse.json({ error: "story not found" }, { status: 404 });
  }

  // Best-effort: attach the reporter if they happen to be signed in.
  let reporterId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    reporterId = user?.id ?? null;
  } catch {
    /* anonymous report is fine */
  }

  const { error } = await admin.from("community_reports").insert({
    community_id: (passage as any).id,
    slug,
    reason,
    reporter_id: reporterId,
  });
  if (error) {
    return NextResponse.json({ error: "could not file report" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
