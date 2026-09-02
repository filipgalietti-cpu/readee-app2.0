import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PlacementResult } from "@/lib/placement/types";

/**
 * GET /api/placement/result?child=<id> — the child's latest placement, for the
 * reveal and the report. RLS scopes the read to the parent's own children;
 * the narration audio paths are minted into signed URLs by /api/child-audio.
 */
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const childId = new URL(req.url).searchParams.get("child") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(childId)) return NextResponse.json({ ok: false, error: "bad child" }, { status: 400 });

  const { data: child } = await supabase.from("children").select("id, first_name, parent_id").eq("id", childId).maybeSingle();
  if (!child || (child as { parent_id: string }).parent_id !== user.id) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  const { data: row } = await supabase
    .from("placements")
    .select("id, child_id, enrolled, decision, moments, plan, narration, passage_recording_path, duration_seconds, created_at")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row) return NextResponse.json({ ok: true, result: null });

  const r = row as Record<string, unknown>;
  const result: PlacementResult = {
    id: String(r.id),
    childId: String(r.child_id),
    childName: (((child as { first_name?: string }).first_name ?? "").split(" ")[0] || "Reader"),
    enrolled: Number(r.enrolled) as PlacementResult["enrolled"],
    decision: r.decision as PlacementResult["decision"],
    moments: (r.moments ?? []) as PlacementResult["moments"],
    plan: r.plan as PlacementResult["plan"],
    narration: (r.narration ?? []) as PlacementResult["narration"],
    passageRecordingPath: (r.passage_recording_path as string | null) ?? null,
    durationSeconds: Number(r.duration_seconds ?? 0),
    createdAt: String(r.created_at),
  };
  return NextResponse.json({ ok: true, result });
}
