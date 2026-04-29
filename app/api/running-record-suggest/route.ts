import { NextResponse } from "next/server";
import { checkTeacherTier } from "@/lib/plan/teacher-gate";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { suggestPracticeForFocus } from "@/lib/ai/suggest-practice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/running-record-suggest
 * body: { focusArea: string, studentId: string }
 *
 * Maps a freeform focus_area string from a running record to 1-3
 * lessons in the Readee K-4 catalog. Verifies the teacher owns the
 * student before running, so the lookup picks the right grade band.
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

  let body: { focusArea?: string; studentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const focusArea = String(body.focusArea ?? "").trim();
  const studentId = String(body.studentId ?? "").trim();
  if (!focusArea) {
    return NextResponse.json(
      { ok: false, error: "Missing focus area." },
      { status: 400 },
    );
  }
  if (!studentId) {
    return NextResponse.json(
      { ok: false, error: "Missing student id." },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  const { data: child } = await admin
    .from("children")
    .select("id, grade, classrooms!inner(teacher_id)")
    .eq("id", studentId)
    .maybeSingle();
  const ownerOk =
    child && (child as any).classrooms?.teacher_id === teacherId;
  if (!ownerOk) {
    return NextResponse.json(
      { ok: false, error: "That student isn't in your classroom." },
      { status: 403 },
    );
  }

  const result = await suggestPracticeForFocus({
    teacherId,
    focusArea,
    studentGrade: ((child as any).grade ?? null) as string | null,
  });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true, suggestions: result.suggestions });
}
