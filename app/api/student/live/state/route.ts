import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/auth/student-session";

/**
 * GET /api/student/live/state?sessionId=...
 *
 * Polled every ~2s by the student live-quiz UI to detect transitions
 * (lobby → running, question advance, ended). Returns the minimum state
 * the client needs: status, current_question_idx, and whether this
 * student has already answered the current question.
 */
export async function GET(req: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId." }, { status: 400 });

  const admin = supabaseAdmin();

  const { data: row } = await admin
    .from("live_quiz_sessions")
    .select("id, classroom_id, status, current_question_idx, question_ids, title, current_question_started_at")
    .eq("id", sessionId)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  const s = row as any;
  if (s.classroom_id !== session.classroomId) {
    return NextResponse.json({ error: "Wrong classroom." }, { status: 403 });
  }

  const { data: myAnswer } = await admin
    .from("live_quiz_answers")
    .select("answer, is_correct")
    .eq("session_id", sessionId)
    .eq("child_id", session.childId)
    .eq("question_idx", s.current_question_idx)
    .maybeSingle();

  return NextResponse.json({
    status: s.status,
    currentQuestionIdx: s.current_question_idx,
    totalQuestions: Array.isArray(s.question_ids) ? s.question_ids.length : 0,
    title: s.title,
    myAnswerForCurrent: (myAnswer as any)?.answer ?? null,
    currentQuestionStartedAt: s.current_question_started_at,
  });
}
