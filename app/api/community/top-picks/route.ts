import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Top 4 approved community passages by view count, with a small
 * recency boost. No auth required — same data as the public
 * /community surface; we just expose it for the practice-hub tile.
 */
export async function GET() {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("community_passages")
    .select(
      "id, slug, title, image_url, grade_level, topic, phonics_pattern, view_count, display_byline",
    )
    .eq("status", "approved")
    .not("slug", "is", null)
    .order("view_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(4);
  return NextResponse.json({ items: data ?? [] });
}
