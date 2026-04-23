import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/auth/student-session";

/**
 * POST /api/student/custom-quiz-complete
 * body: { quizId, questionsAttempted, questionsCorrect }
 *
 * Called by the student custom-quiz runner on completion. Mirrors
 * practice-complete for the readee_lesson kind, but writes results
 * against a custom_quiz assignment (source_id = quizId).
 */
export async function POST(req: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { quizId?: string; questionsAttempted?: number; questionsCorrect?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const quizId = (body.quizId ?? "").trim();
  const attempted = Math.max(0, Math.floor(Number(body.questionsAttempted) || 0));
  const correct = Math.min(
    attempted,
    Math.max(0, Math.floor(Number(body.questionsCorrect) || 0)),
  );

  if (!quizId) return NextResponse.json({ error: "Missing quizId." }, { status: 400 });

  const admin = supabaseAdmin();

  const { data: child } = await admin
    .from("children")
    .select("id, owner_type, owner_classroom_id, carrots")
    .eq("id", session.childId)
    .maybeSingle();

  if (
    !child ||
    (child as any).owner_type !== "classroom" ||
    (child as any).owner_classroom_id !== session.classroomId
  ) {
    return NextResponse.json({ error: "Invalid student." }, { status: 403 });
  }

  const { data: matching } = await admin
    .from("assignments")
    .select("id, pass_threshold")
    .eq("classroom_id", session.classroomId)
    .eq("kind", "custom_quiz")
    .eq("source_id", quizId);

  if (!matching || matching.length === 0) {
    return NextResponse.json({ error: "This quiz isn't assigned to your class." }, { status: 403 });
  }

  const carrotsEarned = correct * 5;
  const nowIso = new Date().toISOString();
  const scorePercent = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  // Record a synthetic practice_results row so teacher/admin mastery
  // analytics still see the activity. We use a "custom:" prefix on
  // standard_id so it doesn't collide with real CCSS standards.
  await admin.from("practice_results").insert({
    child_id: session.childId,
    standard_id: `custom:${quizId}`,
    questions_attempted: attempted,
    questions_correct: correct,
    carrots_earned: carrotsEarned,
  });

  const currentCarrots = Number((child as any).carrots) || 0;
  await admin
    .from("children")
    .update({
      carrots: currentCarrots + carrotsEarned,
      last_lesson_at: nowIso,
    })
    .eq("id", session.childId);

  for (const a of matching as { id: string; pass_threshold: number | null }[]) {
    const passed = a.pass_threshold == null || scorePercent >= a.pass_threshold;
    await admin
      .from("assignment_submissions")
      .upsert(
        {
          assignment_id: a.id,
          child_id: session.childId,
          completed_at: passed ? nowIso : null,
          score_percent: scorePercent,
          carrots_earned: carrotsEarned,
        },
        { onConflict: "assignment_id,child_id" },
      );
  }

  return NextResponse.json({ ok: true, scorePercent, carrotsEarned });
}
