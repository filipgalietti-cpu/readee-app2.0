import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/luna/session-complete — persist ONE aggregate row for a
 * finished guided Luna session, so the child's performance + weaknesses
 * accumulate over time. Written to fluency_readings (the same store
 * buildBuddyContext + the parent report already read), so Luna can be
 * aimed at the child's real weak patterns going forward.
 *
 * Body (JSON): { childId, passageText, gradeLevel, wordAnnotations,
 *   wordsTotal, wordsCorrect, durationSeconds, wcpm, targetPatterns }
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }
  const childId = String(b?.childId ?? "");
  if (!childId || !b?.passageText) {
    return NextResponse.json({ error: "childId + passageText required" }, { status: 400 });
  }

  // Auth: parent of the child.
  const { data: child } = await supabase
    .from("children")
    .select("id, parent_id")
    .eq("id", childId)
    .maybeSingle();
  if (!child) return NextResponse.json({ error: "child not found" }, { status: 404 });
  if ((child as any).parent_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = supabaseAdmin();
  const { error } = await admin.from("fluency_readings").insert({
    child_id: childId,
    audio_url: null,
    passage_text: String(b.passageText).slice(0, 4000),
    passage_grade_level: b.gradeLevel ?? null,
    transcript: null,
    word_annotations: Array.isArray(b.wordAnnotations) ? b.wordAnnotations : [],
    words_total: Number(b.wordsTotal) || 0,
    words_correct: Number(b.wordsCorrect) || 0,
    duration_seconds: b.durationSeconds != null ? Number(b.durationSeconds) : null,
    wcpm: b.wcpm != null ? Number(b.wcpm) : null,
    prosody_score: b.prosody != null ? Math.round(Number(b.prosody)) : null,
    encouragement: "Guided reading session with Luna.",
    teacher_summary: "Sentence-by-sentence guided session (Luna).",
    target_patterns: Array.isArray(b.targetPatterns) ? b.targetPatterns.slice(0, 5) : [],
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Adaptive spine: update SM-2 mastery for the phonics pattern this passage
  // targeted, so next session serves the child's weakest/most-due pattern.
  const patternId = b?.patternId ? String(b.patternId).slice(0, 80) : null;
  if (patternId) {
    try {
      const total = Number(b.wordsTotal) || 0;
      const correct = Number(b.wordsCorrect) || 0;
      const accuracy = total > 0 ? (correct / total) * 100 : 0;
      const pass = accuracy >= 85; // read the pattern's words accurately enough
      const { data: existing } = await admin
        .from("child_skill_memory")
        .select("ease_factor, interval_days, consecutive_correct, total_correct, total_attempted")
        .eq("child_id", childId).eq("standard_id", patternId).maybeSingle();
      const e = (existing ?? {}) as { ease_factor?: number; interval_days?: number; consecutive_correct?: number; total_correct?: number; total_attempted?: number };
      const ease = e.ease_factor ?? 2.5;
      const interval = e.interval_days ?? 1;
      const newEase = pass ? Math.min(2.8, ease + 0.05) : Math.max(1.3, ease - 0.2);
      const newInterval = pass ? Math.min(60, interval * ease) : 1;
      const now = new Date();
      await admin.from("child_skill_memory").upsert({
        child_id: childId,
        standard_id: patternId,
        ease_factor: newEase,
        interval_days: newInterval,
        consecutive_correct: pass ? (e.consecutive_correct ?? 0) + 1 : 0,
        next_due: new Date(now.getTime() + newInterval * 86400000).toISOString(),
        total_correct: (e.total_correct ?? 0) + (pass ? 1 : 0),
        total_attempted: (e.total_attempted ?? 0) + 1,
        last_practiced_at: now.toISOString(),
        updated_at: now.toISOString(),
      }, { onConflict: "child_id,standard_id" });
    } catch { /* mastery update is best-effort; never fail the session save */ }
  }

  // Reward the reader with carrots for finishing a guided Luna session
  // (parity with lessons/practice). Best-effort — never fail the save on it.
  const LUNA_CARROTS = 10;
  let carrotsAwarded = 0;
  try {
    const { data: cur } = await admin.from("children").select("carrots").eq("id", childId).maybeSingle();
    const next = ((cur as any)?.carrots ?? 0) + LUNA_CARROTS;
    await admin.from("children").update({ carrots: next }).eq("id", childId);
    carrotsAwarded = LUNA_CARROTS;
  } catch { /* non-fatal */ }

  return NextResponse.json({ ok: true, carrotsAwarded });
}
