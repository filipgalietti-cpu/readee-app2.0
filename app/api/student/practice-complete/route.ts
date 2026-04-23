import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/auth/student-session";

/**
 * POST /api/student/practice-complete
 * body: { standardId, questionsAttempted, questionsCorrect }
 *
 * Called by the student practice runner on completion. Verifies the
 * student session cookie, writes practice_results, bumps the child's
 * carrots + last_lesson_at, and — if the standard matches any open
 * classroom assignments — upserts assignment_submissions so the card
 * clears and the teacher's Insights tab picks it up.
 */
export async function POST(req: Request) {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { standardId?: string; questionsAttempted?: number; questionsCorrect?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const standardId = (body.standardId ?? "").trim();
  const attempted = Math.max(0, Math.floor(Number(body.questionsAttempted) || 0));
  const correct = Math.min(
    attempted,
    Math.max(0, Math.floor(Number(body.questionsCorrect) || 0)),
  );

  if (!standardId) {
    return NextResponse.json({ error: "Missing standardId." }, { status: 400 });
  }

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

  const carrotsEarned = correct * 5;
  const nowIso = new Date().toISOString();

  await admin.from("practice_results").insert({
    child_id: session.childId,
    standard_id: standardId,
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

  const { data: matching } = await admin
    .from("assignments")
    .select("id")
    .eq("classroom_id", session.classroomId)
    .eq("kind", "readee_lesson")
    .eq("source_id", standardId);

  const scorePercent = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  for (const a of (matching ?? []) as { id: string }[]) {
    await admin
      .from("assignment_submissions")
      .upsert(
        {
          assignment_id: a.id,
          child_id: session.childId,
          completed_at: nowIso,
          score_percent: scorePercent,
          carrots_earned: carrotsEarned,
        },
        { onConflict: "assignment_id,child_id" },
      );
  }

  return NextResponse.json({
    ok: true,
    scorePercent,
    carrotsEarned,
  });
}
