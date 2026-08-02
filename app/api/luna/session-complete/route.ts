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
    encouragement: "Guided reading session with Luna.",
    teacher_summary: "Sentence-by-sentence guided session (Luna).",
    target_patterns: Array.isArray(b.targetPatterns) ? b.targetPatterns.slice(0, 5) : [],
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
