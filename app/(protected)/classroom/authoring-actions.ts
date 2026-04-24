"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import {
  generateMCQQuestions,
  generateMatchingPairs,
  generatePassage,
  generateImage,
  generateSpeech,
  pairsToMCQs,
  type GeneratedMCQ,
  type GeneratedPair,
  type GeneratedPassage,
} from "@/lib/ai/readee-ai";

type QuestionInput =
  | {
      kind: "multiple_choice";
      prompt: string;
      choices: string[];
      correct: string;
      hint?: string | null;
      imageUrl?: string | null;
      audioUrl?: string | null;
    }
  | {
      kind: "true_false";
      prompt: string;
      correct: "True" | "False";
      hint?: string | null;
      imageUrl?: string | null;
      audioUrl?: string | null;
    }
  | {
      kind: "fill_in_blank";
      prompt: string;
      correct: string[];
      hint?: string | null;
      imageUrl?: string | null;
      audioUrl?: string | null;
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
  image_url: string | null;
  audio_url: string | null;
} {
  const image_url = input.imageUrl?.trim() || null;
  const audio_url = input.audioUrl?.trim() || null;
  if (input.kind === "multiple_choice") {
    return {
      kind: "multiple_choice",
      prompt: input.prompt.trim(),
      choices: input.choices.map((c) => c.trim()),
      correct: input.correct.trim(),
      hint: input.hint?.trim() || null,
      image_url,
      audio_url,
    };
  }
  if (input.kind === "true_false") {
    return {
      kind: "true_false",
      prompt: input.prompt.trim(),
      choices: ["True", "False"],
      correct: input.correct,
      hint: input.hint?.trim() || null,
      image_url,
      audio_url,
    };
  }
  return {
    kind: "fill_in_blank",
    prompt: input.prompt.trim(),
    choices: null,
    correct: input.correct.map((a) => a.trim()).filter(Boolean),
    hint: input.hint?.trim() || null,
    image_url,
    audio_url,
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
      image_url: q.image_url,
      audio_url: q.audio_url,
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
      image_url: q.image_url,
      audio_url: q.audio_url,
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

/**
 * Readee.ai: generate MCQ questions for the teacher to review and
 * optionally add to a custom quiz. Does NOT save the questions — the
 * teacher reviews a preview and chooses which to keep.
 */
export async function aiGenerateQuestions(input: {
  topic: string;
  gradeLevel?: string | null;
  count: number;
}): Promise<
  { ok: true; questions: GeneratedMCQ[] } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can use Readee.ai." };
  }
  return generateMCQQuestions({
    teacherId: profile.id,
    topic: input.topic,
    gradeLevel: input.gradeLevel ?? null,
    count: input.count,
  });
}

export async function aiGenerateMatchingPairs(input: {
  topic: string;
  gradeLevel?: string | null;
  count: number;
}): Promise<
  { ok: true; pairs: GeneratedPair[]; mcqs: GeneratedMCQ[] } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can use Readee.ai." };
  }
  const res = await generateMatchingPairs({
    teacherId: profile.id,
    topic: input.topic,
    gradeLevel: input.gradeLevel ?? null,
    count: input.count,
  });
  if (!res.ok) return res;
  // Convert to MCQs so they plug into the existing student runner
  // without introducing a new question-kind UI. Each pair becomes a
  // "Match: <left>" question with the right side as the correct answer
  // and 3 other rights as distractors.
  const mcqs: GeneratedMCQ[] = pairsToMCQs(res.pairs).map((q) => ({
    prompt: q.prompt,
    choices: q.choices,
    correct: q.correct,
    hint: q.hint,
  }));
  return { ok: true, pairs: res.pairs, mcqs };
}

export async function aiGenerateImage(input: { prompt: string }): Promise<
  { ok: true; imageUrl: string } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can use Readee.ai." };
  }
  const res = await generateImage({
    teacherId: profile.id,
    prompt: input.prompt,
  });
  if (!res.ok) return res;
  return { ok: true, imageUrl: res.imageUrl };
}

export async function aiBuildAssignment(input: {
  brief: import("@/lib/ai/build-assignment").AssignmentBrief;
}): Promise<
  | { ok: true; quizId: string; warnings: string[]; creditsUsed: number }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can use Readee.ai." };
  }
  const { buildAssignment } = await import("@/lib/ai/build-assignment");
  const res = await buildAssignment({ teacherId: profile.id, brief: input.brief });
  if (res.ok) {
    revalidatePath("/classroom/authoring");
  }
  return res;
}

export async function aiGenerateAudio(input: { text: string }): Promise<
  { ok: true; audioUrl: string } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can use Readee.ai." };
  }
  const res = await generateSpeech({
    teacherId: profile.id,
    text: input.text,
  });
  if (!res.ok) return res;
  return { ok: true, audioUrl: res.audioUrl };
}

export async function aiGeneratePassage(input: {
  topic: string;
  gradeLevel?: string | null;
  phonicsPattern?: string | null;
}): Promise<
  { ok: true; passage: GeneratedPassage } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can use Readee.ai." };
  }
  return generatePassage({
    teacherId: profile.id,
    topic: input.topic,
    gradeLevel: input.gradeLevel ?? null,
    phonicsPattern: input.phonicsPattern ?? null,
  });
}

/**
 * Bulk-add a batch of AI-generated (or teacher-approved) MCQs to an
 * existing quiz. Runs validation per question via the same path as
 * addQuestionToQuiz.
 */
export async function addManyQuestionsToQuiz(input: {
  quizId: string;
  questions: {
    kind: "multiple_choice";
    prompt: string;
    choices: string[];
    correct: string;
    hint?: string | null;
  }[];
}): Promise<
  { ok: true; added: number } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can edit quizzes." };
  }

  const supabase = await createClient();
  const { data: quiz } = await supabase
    .from("custom_quizzes")
    .select("id")
    .eq("id", input.quizId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!quiz) return { ok: false, error: "Quiz not found." };

  let added = 0;
  const { data: maxRow } = await supabase
    .from("custom_quiz_questions")
    .select("position")
    .eq("quiz_id", input.quizId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextPosition = ((maxRow as any)?.position ?? 0) + 1;

  for (const q of input.questions) {
    const prompt = q.prompt?.trim();
    const choices = Array.isArray(q.choices)
      ? q.choices.map((c) => String(c).trim()).filter(Boolean)
      : [];
    const correct = q.correct?.trim();
    if (!prompt || choices.length < 2 || choices.length > 6) continue;
    if (!correct || !choices.includes(correct)) continue;

    const { data: qRow, error: qErr } = await supabase
      .from("custom_questions")
      .insert({
        teacher_id: profile.id,
        kind: "multiple_choice",
        prompt,
        choices,
        correct,
        hint: q.hint?.trim() || null,
      })
      .select("id")
      .single();
    if (qErr || !qRow) continue;

    const { error: junctionErr } = await supabase
      .from("custom_quiz_questions")
      .insert({
        quiz_id: input.quizId,
        question_id: (qRow as any).id,
        position: nextPosition,
      });
    if (junctionErr) continue;
    nextPosition += 1;
    added += 1;
  }

  if (added === 0) {
    return { ok: false, error: "No questions could be added." };
  }

  revalidatePath(`/classroom/authoring/quiz/${input.quizId}`);
  return { ok: true, added };
}

/**
 * Bulk-import questions from a CSV upload. Caller validates client-side,
 * server validates again before any insert. Cap at 100 rows / upload.
 *
 * Returns the count imported plus per-row errors. Errors don't abort —
 * we import everything that's valid and report what wasn't.
 */
export async function bulkImportQuestionsFromCsv(input: {
  quizId: string;
  csvText: string;
}): Promise<
  | {
      ok: true;
      imported: number;
      errors: { row: number; message: string }[];
    }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can edit quizzes." };
  }
  if (!input.csvText || input.csvText.length > 500_000) {
    return { ok: false, error: "CSV is empty or too large (max ~500KB)." };
  }

  const { parseCsv } = await import("@/lib/csv/parse");
  const { normalizeRows } = await import("@/lib/csv/quiz-template");
  const rows = parseCsv(input.csvText);
  const { questions, errors } = normalizeRows(rows);

  if (questions.length > 100) {
    return {
      ok: false,
      error: `Found ${questions.length} questions but the per-upload cap is 100. Split into multiple files.`,
    };
  }

  const supabase = await createClient();
  const { data: quiz } = await supabase
    .from("custom_quizzes")
    .select("id")
    .eq("id", input.quizId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!quiz) return { ok: false, error: "Quiz not found." };

  const { data: maxRow } = await supabase
    .from("custom_quiz_questions")
    .select("position")
    .eq("quiz_id", input.quizId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextPosition = ((maxRow as any)?.position ?? 0) + 1;

  let imported = 0;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const choicesValue =
      q.kind === "multiple_choice"
        ? q.choices
        : q.kind === "true_false"
        ? ["True", "False"]
        : null;
    const correctValue =
      q.kind === "fill_in_blank" ? q.correct : (q.correct as string);

    const { data: qRow, error: qErr } = await supabase
      .from("custom_questions")
      .insert({
        teacher_id: profile.id,
        kind: q.kind,
        prompt: q.prompt,
        choices: choicesValue,
        correct: correctValue,
        hint: q.hint,
        image_url: q.imageUrl,
        audio_url: q.audioUrl,
      })
      .select("id")
      .single();
    if (qErr || !qRow) {
      errors.push({
        row: i + 2,
        message: `DB insert failed: ${qErr?.message ?? "unknown error"}`,
      });
      continue;
    }
    const { error: jErr } = await supabase
      .from("custom_quiz_questions")
      .insert({
        quiz_id: input.quizId,
        question_id: (qRow as any).id,
        position: nextPosition,
      });
    if (jErr) {
      errors.push({ row: i + 2, message: `Couldn't attach to quiz: ${jErr.message}` });
      continue;
    }
    nextPosition += 1;
    imported += 1;
  }

  revalidatePath(`/classroom/authoring/quiz/${input.quizId}`);
  return { ok: true, imported, errors };
}
