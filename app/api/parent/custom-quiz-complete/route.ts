import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/parent/custom-quiz-complete
 * body: { quizId, childId, questionsAttempted, questionsCorrect }
 *
 * Counterpart to /api/student/custom-quiz-complete for parent-owned
 * children playing under their parent's Supabase auth session
 * (no class-code HMAC cookie required).
 *
 * Auth chain:
 *   1. Caller is authenticated via Supabase (requireProfile).
 *   2. childId.parent_id matches the caller — proves ownership.
 *   3. The child has a classroom membership where this quiz is
 *      assigned — proves the kid is supposed to be doing it.
 */
export async function POST(req: Request) {
  const profile = await requireProfile();

  let body: {
    quizId?: string;
    childId?: string;
    questionsAttempted?: number;
    questionsCorrect?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const quizId = (body.quizId ?? "").trim();
  const childId = (body.childId ?? "").trim();
  const attempted = Math.max(0, Math.floor(Number(body.questionsAttempted) || 0));
  const correct = Math.min(
    attempted,
    Math.max(0, Math.floor(Number(body.questionsCorrect) || 0)),
  );

  if (!quizId) return NextResponse.json({ error: "Missing quizId." }, { status: 400 });
  if (!childId) return NextResponse.json({ error: "Missing childId." }, { status: 400 });

  const admin = supabaseAdmin();

  // 1) Parent owns the child
  const { data: child } = await admin
    .from("children")
    .select("id, parent_id, carrots")
    .eq("id", childId)
    .eq("parent_id", profile.id)
    .maybeSingle();
  if (!child) {
    return NextResponse.json({ error: "Child not found." }, { status: 403 });
  }

  // 2) Child is in a classroom that has this quiz assigned
  const { data: memberships } = await admin
    .from("classroom_memberships")
    .select("classroom_id")
    .eq("child_id", childId);
  const classroomIds = (memberships ?? []).map((m: any) => m.classroom_id);
  if (classroomIds.length === 0) {
    return NextResponse.json(
      { error: "Child has no classroom memberships." },
      { status: 403 },
    );
  }

  // Find every assignment of this quiz across the child's classrooms.
  // The dashboard's "open assignments" check filters out anything with
  // a completed_at row in assignment_submissions, so we need to mark
  // every relevant assignment, not just the most recent one.
  const { data: assignments } = await admin
    .from("assignments")
    .select("id, classroom_id, pass_threshold")
    .in("classroom_id", classroomIds)
    .eq("kind", "custom_quiz")
    .eq("source_id", quizId);
  const matching = (assignments ?? []) as {
    id: string;
    pass_threshold: number | null;
  }[];
  if (matching.length === 0) {
    return NextResponse.json(
      { error: "This quiz isn't assigned to your child's class." },
      { status: 403 },
    );
  }

  // 3) Save score + earn carrots. Mirrors the student endpoint's logic.
  const carrotsEarned = correct * 5;
  const scorePercent = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const nowIso = new Date().toISOString();

  // Insert practice_results so analytics + SRS pick this up.
  await admin.from("practice_results").insert({
    child_id: childId,
    standard_id: `custom:${quizId}`,
    questions_attempted: attempted,
    questions_correct: correct,
    carrots_earned: carrotsEarned,
  });

  // Increment carrots + last-played stamp on the child.
  await admin
    .from("children")
    .update({
      carrots: ((child as any).carrots ?? 0) + carrotsEarned,
      last_lesson_at: nowIso,
    })
    .eq("id", childId);

  // Mark each matching assignment complete. Pass threshold gating: if
  // the assignment has one, completed_at is only set when the score
  // meets it — same rule the student endpoint follows. Without a
  // threshold, any attempt counts as complete.
  for (const a of matching) {
    const passed = a.pass_threshold == null || scorePercent >= a.pass_threshold;
    await admin
      .from("assignment_submissions")
      .upsert(
        {
          assignment_id: a.id,
          child_id: childId,
          completed_at: passed ? nowIso : null,
          score_percent: scorePercent,
          carrots_earned: carrotsEarned,
        },
        { onConflict: "assignment_id,child_id" },
      );
  }

  return NextResponse.json({
    ok: true,
    correct,
    attempted,
    scorePercent,
    carrotsEarned,
  });
}
