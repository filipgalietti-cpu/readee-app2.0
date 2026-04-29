import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/auth/student-session";

/**
 * POST /api/student/custom-quiz-progress
 *
 * body: { quizId: string, idx: number, answers: any[], correct: number }
 *
 * Persists an in-flight quiz state so the kid can close the tab and
 * pick up where they left off. We don't trust the client values past
 * basic shape, the worst they can do is over-report their own
 * progress, which doesn't unlock anything new.
 */
export async function POST(req: Request) {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: {
    quizId?: string;
    idx?: number;
    answers?: unknown[];
    correct?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const quizId = (body.quizId ?? "").trim();
  if (!quizId) {
    return NextResponse.json({ error: "Missing quizId." }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: matching } = await admin
    .from("assignments")
    .select("id, assigned_child_ids")
    .eq("classroom_id", session.classroomId)
    .eq("kind", "custom_quiz")
    .eq("source_id", quizId)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!matching) {
    return NextResponse.json(
      { error: "This quiz isn't assigned to your class." },
      { status: 403 },
    );
  }
  const targeted = (matching as any).assigned_child_ids as string[] | null;
  if (
    Array.isArray(targeted) &&
    targeted.length > 0 &&
    !targeted.includes(session.childId)
  ) {
    return NextResponse.json(
      { error: "This quiz isn't for you." },
      { status: 403 },
    );
  }

  const idx = Math.max(0, Math.floor(Number(body.idx) || 0));
  const correct = Math.max(0, Math.floor(Number(body.correct) || 0));
  const answers = Array.isArray(body.answers) ? body.answers.slice(0, 200) : [];

  const progressState = {
    idx,
    answers,
    correct,
    updatedAt: new Date().toISOString(),
  };

  await admin.from("assignment_submissions").upsert(
    {
      assignment_id: (matching as any).id,
      child_id: session.childId,
      progress_state: progressState,
    },
    { onConflict: "assignment_id,child_id" },
  );

  return NextResponse.json({ ok: true });
}
