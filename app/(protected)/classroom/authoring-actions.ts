"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";

type QuestionInput =
  | {
      kind: "multiple_choice";
      prompt: string;
      choices: string[];
      correct: string;
      hint?: string | null;
    }
  | {
      kind: "true_false";
      prompt: string;
      correct: "True" | "False";
      hint?: string | null;
    }
  | {
      kind: "fill_in_blank";
      prompt: string;
      correct: string[];
      hint?: string | null;
    };

export async function createCustomQuiz(input: {
  title: string;
  description?: string | null;
  gradeLevel?: string | null;
}): Promise<{ ok: true; quizId: string } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can create quizzes." };
  }
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (title.length > 120) return { ok: false, error: "Title is too long." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("custom_quizzes")
    .insert({
      teacher_id: profile.id,
      title,
      description: input.description?.trim() || null,
      grade_level: input.gradeLevel?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create quiz." };
  }
  revalidatePath("/classroom");
  return { ok: true, quizId: (data as any).id as string };
}

export async function updateCustomQuiz(input: {
  quizId: string;
  title?: string;
  description?: string | null;
  gradeLevel?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) {
    const t = input.title.trim();
    if (!t) return { ok: false, error: "Title cannot be empty." };
    patch.title = t.slice(0, 120);
  }
  if (input.description !== undefined) patch.description = input.description?.trim() || null;
  if (input.gradeLevel !== undefined) patch.grade_level = input.gradeLevel?.trim() || null;
  if (Object.keys(patch).length === 0) return { ok: true };
  patch.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("custom_quizzes")
    .update(patch)
    .eq("id", input.quizId)
    .eq("teacher_id", profile.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/classroom/authoring/quiz/${input.quizId}`);
  revalidatePath("/classroom/authoring");
  return { ok: true };
}

export async function deleteCustomQuiz(input: { quizId: string }): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("custom_quizzes")
    .delete()
    .eq("id", input.quizId)
    .eq("teacher_id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/classroom/authoring");
  return { ok: true };
}

function validateQuestion(input: QuestionInput): string | null {
  const p = input.prompt.trim();
  if (!p) return "Prompt is required.";
  if (p.length > 2000) return "Prompt is too long.";

  if (input.kind === "multiple_choice") {
    const choices = (input.choices ?? []).map((c) => c.trim()).filter(Boolean);
    if (choices.length < 2) return "At least 2 choices are required.";
    if (choices.length > 6) return "Maximum 6 choices.";
    if (!choices.includes(input.correct.trim())) return "Correct answer must match one of the choices.";
    if (new Set(choices).size !== choices.length) return "Choices must be unique.";
  }
  if (input.kind === "true_false") {
    if (input.correct !== "True" && input.correct !== "False") {
      return "Correct answer must be True or False.";
    }
  }
  if (input.kind === "fill_in_blank") {
    const answers = (input.correct ?? []).map((a) => a.trim()).filter(Boolean);
    if (answers.length === 0) return "At least one accepted answer is required.";
  }
  return null;
}

function serializeQuestion(input: QuestionInput): {
  kind: string;
  prompt: string;
  choices: any;
  correct: any;
  hint: string | null;
} {
  if (input.kind === "multiple_choice") {
    return {
      kind: "multiple_choice",
      prompt: input.prompt.trim(),
      choices: input.choices.map((c) => c.trim()),
      correct: input.correct.trim(),
      hint: input.hint?.trim() || null,
    };
  }
  if (input.kind === "true_false") {
    return {
      kind: "true_false",
      prompt: input.prompt.trim(),
      choices: ["True", "False"],
      correct: input.correct,
      hint: input.hint?.trim() || null,
    };
  }
  return {
    kind: "fill_in_blank",
    prompt: input.prompt.trim(),
    choices: null,
    correct: input.correct.map((a) => a.trim()).filter(Boolean),
    hint: input.hint?.trim() || null,
  };
}

export async function addQuestionToQuiz(input: {
  quizId: string;
  question: QuestionInput;
}): Promise<{ ok: true; questionId: string } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const validationErr = validateQuestion(input.question);
  if (validationErr) return { ok: false, error: validationErr };

  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("custom_quizzes")
    .select("id")
    .eq("id", input.quizId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!quiz) return { ok: false, error: "Quiz not found." };

  const q = serializeQuestion(input.question);
  const { data: qRow, error: qErr } = await supabase
    .from("custom_questions")
    .insert({
      teacher_id: profile.id,
      kind: q.kind,
      prompt: q.prompt,
      choices: q.choices,
      correct: q.correct,
      hint: q.hint,
    })
    .select("id")
    .single();
  if (qErr || !qRow) {
    return { ok: false, error: qErr?.message ?? "Could not create question." };
  }
  const questionId = (qRow as any).id as string;

  const { data: maxRow } = await supabase
    .from("custom_quiz_questions")
    .select("position")
    .eq("quiz_id", input.quizId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = ((maxRow as any)?.position ?? 0) + 1;

  const { error: junctionErr } = await supabase
    .from("custom_quiz_questions")
    .insert({
      quiz_id: input.quizId,
      question_id: questionId,
      position: nextPosition,
    });
  if (junctionErr) return { ok: false, error: junctionErr.message };

  revalidatePath(`/classroom/authoring/quiz/${input.quizId}`);
  return { ok: true, questionId };
}

export async function updateCustomQuestion(input: {
  questionId: string;
  quizId: string;
  question: QuestionInput;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const validationErr = validateQuestion(input.question);
  if (validationErr) return { ok: false, error: validationErr };

  const supabase = await createClient();
  const q = serializeQuestion(input.question);
  const { error } = await supabase
    .from("custom_questions")
    .update({
      kind: q.kind,
      prompt: q.prompt,
      choices: q.choices,
      correct: q.correct,
      hint: q.hint,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.questionId)
    .eq("teacher_id", profile.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/classroom/authoring/quiz/${input.quizId}`);
  return { ok: true };
}

export async function removeQuestionFromQuiz(input: {
  quizId: string;
  questionId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("custom_quizzes")
    .select("id")
    .eq("id", input.quizId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!quiz) return { ok: false, error: "Quiz not found." };

  // Remove the junction row. The underlying custom_questions row is
  // preserved so the teacher can still see it in a library later, but
  // for now we also delete it to keep things tidy — can evolve into a
  // reusable question bank when we add one.
  const { error: delJunctionErr } = await supabase
    .from("custom_quiz_questions")
    .delete()
    .eq("quiz_id", input.quizId)
    .eq("question_id", input.questionId);
  if (delJunctionErr) return { ok: false, error: delJunctionErr.message };

  const { error: delQErr } = await supabase
    .from("custom_questions")
    .delete()
    .eq("id", input.questionId)
    .eq("teacher_id", profile.id);
  if (delQErr) return { ok: false, error: delQErr.message };

  revalidatePath(`/classroom/authoring/quiz/${input.quizId}`);
  return { ok: true };
}
