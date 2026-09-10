import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePlacementNarration } from "@/lib/placement/generate-narration";
import { reportFailure } from "@/lib/observability/critical";

export const maxDuration = 300;
/** Retry only server-authored narration for the authenticated parent's latest assessment. */
export async function POST(req: Request) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (typeof body?.childId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.childId))
    return NextResponse.json({ ok: false }, { status: 400 });
  const { data: child } = await db.from("children").select("id,first_name,name_said_as").eq("id", body.childId).eq("parent_id", user.id).maybeSingle();
  if (!child) return NextResponse.json({ ok: false }, { status: 404 });
  const { data: placement } = await db.from("placements").select("id").eq("child_id", child.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!placement) return NextResponse.json({ ok: false }, { status: 404 });
  try {
    await generatePlacementNarration(placement.id, child.first_name || "Reader", child.name_said_as);
    return NextResponse.json({ ok: true });
  } catch (error) {
    reportFailure("placement.narration", error, { route: "/api/placement/narration" });
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
