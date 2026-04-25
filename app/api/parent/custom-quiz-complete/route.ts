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

  const { data: assignment } = await admin
    .from("assignments")
    .select("id, classroom_id, pass_threshold")
    .in("classroom_id", classroomIds)
    .eq("kind", "custom_quiz")
    .eq("source_id", quizId)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!assignment) {
    return NextResponse.json(
      { error: "This quiz isn't assigned to your child's class." },
      { status: 403 },
    );
  }

  // 3) Save score + earn carrots. Mirrors the student endpoint's logic.
  const carrotsEarned = correct * 5;

  // Insert practice_results row so it shows on analytics + drives SRS.
  await admin.from("practice_results").insert({
    child_id: childId,
    standard_id: `custom:${quizId}`,
    questions_attempted: attempted,
    questions_correct: correct,
  });

  // Increment carrots
  if (carrotsEarned > 0) {
    await admin
      .from("children")
      .update({ carrots: ((child as any).carrots ?? 0) + carrotsEarned })
      .eq("id", childId);
  }

  return NextResponse.json({
    ok: true,
    correct,
    attempted,
    carrotsEarned,
  });
}
