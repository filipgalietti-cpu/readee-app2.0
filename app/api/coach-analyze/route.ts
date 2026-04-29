import { NextResponse } from "next/server";
import { checkTeacherTier } from "@/lib/plan/teacher-gate";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  analyzeRunningRecord,
  countWords,
} from "@/lib/ai/build-running-record";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/coach-analyze
 *
 * Solo running-record analyzer. Replaces the prior small-group
 * diarization endpoint with a 1:1 workflow.
 *
 * Form fields:
 *   audio:         the recording (audio/webm)
 *   childId:       UUID of the kid being recorded
 *   passage:       text the kid was reading
 *   gradeLevel:    optional, "K" | "1st" | ... | "4th"
 *   durationSeconds: float, recorded duration
 *
 * Returns the analysis plus the saved running_records row id so the
 * UI can deep-link into the kid's history later.
 */
export async function POST(req: Request) {
  const gate = await checkTeacherTier({ min: "teacher_solo" });
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, error: gate.error },
      { status: gate.status },
    );
  }
  const teacherId = gate.profileId;

  const form = await req.formData();
  const audio = form.get("audio");
  const passage = String(form.get("passage") ?? "");
  const gradeLevel = String(form.get("gradeLevel") ?? "");
  const childId = String(form.get("childId") ?? "");
  const durationSeconds = Number(form.get("durationSeconds") ?? 0) || 0;

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ ok: false, error: "No audio." }, { status: 400 });
  }
  if (audio.size > 20 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: "Audio too large (>20 MB). Try a shorter clip." },
      { status: 400 },
    );
  }
  if (!childId) {
    return NextResponse.json(
      { ok: false, error: "Pick a child first." },
      { status: 400 },
    );
  }
  if (!passage.trim()) {
    return NextResponse.json(
      { ok: false, error: "Paste the passage the kid is reading." },
      { status: 400 },
    );
  }

  // Verify the teacher actually owns this child via the classroom roster.
  const admin = supabaseAdmin();
  const { data: child } = await admin
    .from("children")
    .select("id, owner_classroom_id, classrooms!inner(teacher_id)")
    .eq("id", childId)
    .maybeSingle();
  const ownerOk =
    child &&
    (child as any).classrooms?.teacher_id === teacherId;
  if (!ownerOk) {
    return NextResponse.json(
      { ok: false, error: "That student isn't in your classroom." },
      { status: 403 },
    );
  }

  const buf = Buffer.from(await audio.arrayBuffer());
  const wordCount = countWords(passage);

  const analysis = await analyzeRunningRecord({
    teacherId,
    audioBase64: buf.toString("base64"),
    audioMimeType: audio.type || "audio/webm",
    passageText: passage,
    passageWordCount: wordCount,
    durationSeconds: Math.max(1, durationSeconds),
    gradeLevel: gradeLevel || null,
  });
  if (!analysis.ok) {
    return NextResponse.json(
      { ok: false, error: analysis.error },
      { status: 400 },
    );
  }

  const r = analysis.record;
  const { data: saved } = await admin
    .from("running_records")
    .insert({
      teacher_id: teacherId,
      child_id: childId,
      classroom_id: (child as any).owner_classroom_id ?? null,
      passage_text: passage,
      passage_word_count: wordCount,
      grade_level: gradeLevel || null,
      duration_seconds: Math.round(durationSeconds),
      transcript: r.transcript,
      wcpm: r.wcpm,
      accuracy_pct: r.accuracyPct,
      miscues: r.miscues,
      focus_area: r.focusArea,
      teacher_note: r.teacherSummary || null,
    })
    .select("id")
    .single();

  return NextResponse.json({
    ok: true,
    runningRecordId: (saved as any)?.id ?? null,
    record: r,
  });
}
