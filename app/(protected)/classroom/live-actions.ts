"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoids 0/O/1/I
const CODE_LEN = 6;

function randomCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LEN; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/**
 * Create a new live quiz session. Teacher picks a readee_lesson (by
 * standard id) or a custom_quiz (by id) and a set of question IDs to
 * run. Returns the session id + session_code.
 */
export async function createLiveQuiz(input: {
  classroomId: string;
  sourceKind: "readee_lesson" | "custom_quiz";
  sourceId: string;
  title: string;
  questionIds: string[];
}): Promise<
  | { ok: true; sessionId: string; sessionCode: string }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can host live quizzes." };
  }
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  if (input.questionIds.length === 0) {
    return { ok: false, error: "Pick at least one question." };
  }

  const supabase = await createClient();

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id")
    .eq("id", input.classroomId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!classroom) return { ok: false, error: "Classroom not found." };

  for (let attempt = 0; attempt < 5; attempt++) {
    const sessionCode = randomCode();
    const { data, error } = await supabase
      .from("live_quiz_sessions")
      .insert({
        classroom_id: input.classroomId,
        teacher_id: profile.id,
        source_kind: input.sourceKind,
        source_id: input.sourceId,
        title: input.title.trim().slice(0, 120),
        question_ids: input.questionIds,
        session_code: sessionCode,
      })
      .select("id, session_code")
      .single();

    if (!error && data) {
      revalidatePath(`/classroom/${input.classroomId}`);
      return {
        ok: true,
        sessionId: (data as any).id,
        sessionCode: (data as any).session_code,
      };
    }
    if (error?.code === "23505") continue; // code collision, retry
    return { ok: false, error: error?.message ?? "Could not start session." };
  }
  return { ok: false, error: "Could not allocate a unique session code." };
}

export async function advanceLiveQuiz(input: { sessionId: string }): Promise<
  { ok: true; status: string; idx: number } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("live_quiz_sessions")
    .select("id, status, current_question_idx, question_ids")
    .eq("id", input.sessionId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!session) return { ok: false, error: "Session not found." };

  const s = session as any;
  const total = Array.isArray(s.question_ids) ? s.question_ids.length : 0;

  // lobby → running (at question 0)
  if (s.status === "lobby") {
    const { error } = await supabase
      .from("live_quiz_sessions")
      .update({
        status: "running",
        current_question_idx: 0,
        current_question_started_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
      })
      .eq("id", input.sessionId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/classroom/live/${input.sessionId}`);
    return { ok: true, status: "running", idx: 0 };
  }

  // running → running (next question) or running → ended (past last)
  if (s.status === "running") {
    const next = s.current_question_idx + 1;
    if (next >= total) {
      const { error } = await supabase
        .from("live_quiz_sessions")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", input.sessionId);
      if (error) return { ok: false, error: error.message };
      revalidatePath(`/classroom/live/${input.sessionId}`);
      return { ok: true, status: "ended", idx: s.current_question_idx };
    }
    const { error } = await supabase
      .from("live_quiz_sessions")
      .update({
        current_question_idx: next,
        current_question_started_at: new Date().toISOString(),
      })
      .eq("id", input.sessionId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/classroom/live/${input.sessionId}`);
    return { ok: true, status: "running", idx: next };
  }

  return { ok: false, error: "Session already ended." };
}

export async function endLiveQuiz(input: { sessionId: string }): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("live_quiz_sessions")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", input.sessionId)
    .eq("teacher_id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/classroom/live/${input.sessionId}`);
  return { ok: true };
}
