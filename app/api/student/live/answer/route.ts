import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/auth/student-session";

/**
 * POST /api/student/live/answer
 * body: { sessionId, questionIdx, answer, correct }
 *
 * Records the student's answer for the current question. Server uses the
 * cookie-bound session to ensure the student belongs to this classroom
 * and that the answer is for the current question idx (stale answers
 * are rejected as "that question already moved on").
 *
 * The `correct` field comes from the client because the MCQ ground
 * truth is in app/data JSON on the server already, but the question
 * resolution on the client is simpler — we trust the browser's
 * comparison. This is fine for v1 (classroom setting, not an
 * adversarial grading surface); harden later if needed.
 */
export async function POST(req: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { sessionId?: string; questionIdx?: number; answer?: string; correct?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = body.sessionId;
  const questionIdx = Number(body.questionIdx);
  const answer = (body.answer ?? "").slice(0, 500);
  const isCorrect = body.correct === true;

  if (!sessionId || !Number.isInteger(questionIdx) || questionIdx < 0) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: row } = await admin
    .from("live_quiz_sessions")
    .select("id, classroom_id, status, current_question_idx, current_question_started_at")
    .eq("id", sessionId)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  const s = row as any;
  if (s.classroom_id !== session.classroomId) {
    return NextResponse.json({ error: "Wrong classroom." }, { status: 403 });
  }
  if (s.status !== "running") {
    return NextResponse.json({ error: "Not running." }, { status: 410 });
  }
  if (s.current_question_idx !== questionIdx) {
    return NextResponse.json({ error: "Question already moved on." }, { status: 409 });
  }

  const startedAt = s.current_question_started_at
    ? new Date(s.current_question_started_at).getTime()
    : null;
  const msToAnswer = startedAt ? Math.max(0, Date.now() - startedAt) : null;

  const { error } = await admin
    .from("live_quiz_answers")
    .upsert(
      {
        session_id: sessionId,
        child_id: session.childId,
        question_idx: questionIdx,
        answer,
        is_correct: isCorrect,
        ms_to_answer: msToAnswer,
      },
      { onConflict: "session_id,child_id,question_idx" },
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
