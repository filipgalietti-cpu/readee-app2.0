import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildParentSnapshot, type SnapshotFacts, type ParentSnapshot } from "@/lib/ai/build-parent-snapshot";

/**
 * POST /api/analytics/snapshot
 * body: { childId, facts }  — facts are computed client-side from real
 *   practice data (grounded-hybrid; the model only words them, never invents).
 *
 * Returns { snapshot: { headline, action } }.
 *
 * Cached on children.ai_snapshot / .ai_snapshot_at and refreshed at most once
 * per calendar day, so revisiting /analytics doesn't re-bill a Gemini call.
 *
 * Auth: caller authenticated (requireProfile) AND owns the child (parent_id).
 */
export async function POST(req: Request) {
  const profile = await requireProfile();

  let body: { childId?: string; facts?: SnapshotFacts };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const childId = (body.childId ?? "").trim();
  const facts = body.facts;
  if (!childId) return NextResponse.json({ error: "Missing childId." }, { status: 400 });
  if (!facts || typeof facts !== "object") {
    return NextResponse.json({ error: "Missing facts." }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // Parent owns the child (also pulls the cache).
  const { data: child } = await admin
    .from("children")
    .select("id, parent_id, ai_snapshot, ai_snapshot_at")
    .eq("id", childId)
    .eq("parent_id", profile.id)
    .maybeSingle();
  if (!child) return NextResponse.json({ error: "Child not found." }, { status: 403 });

  // Serve today's cached snapshot if we already generated one.
  const cachedAt = (child as { ai_snapshot_at?: string | null }).ai_snapshot_at;
  const cached = (child as { ai_snapshot?: ParentSnapshot | null }).ai_snapshot;
  if (cached && cachedAt && sameUTCDate(new Date(cachedAt), new Date())) {
    return NextResponse.json({ snapshot: cached, cached: true });
  }

  const snapshot = await buildParentSnapshot(facts);
  if (!snapshot) {
    // Generation failed — let the client fall back to its static line.
    return NextResponse.json({ snapshot: null }, { status: 200 });
  }

  await admin
    .from("children")
    .update({ ai_snapshot: snapshot, ai_snapshot_at: new Date().toISOString() })
    .eq("id", childId);

  return NextResponse.json({ snapshot, cached: false });
}

function sameUTCDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}
