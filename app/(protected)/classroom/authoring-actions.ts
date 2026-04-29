"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import {
  generateMCQQuestions,
  generateTrueFalseQuestions,
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

/**
 * Regenerate the passage hero illustration for a quiz the teacher
 * already built. Reuses the stored passage (custom_quizzes.description)
 * to write a fresh image brief, calls the image model, and updates
 * every question that was sharing the previous hero URL.
 *
 * Use case: the teacher's first AI build came back with a weird image
 * and they want to reroll without rebuilding the whole quiz.
 */
export async function aiRegeneratePassageImage(input: {
  quizId: string;
}): Promise<
  | { ok: true; imageUrl: string; updatedCount: number }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can use Readee.ai." };
  }

  const supabase = await createClient();
  const { data: quizRow } = await supabase
    .from("custom_quizzes")
    .select("id, title, description")
    .eq("id", input.quizId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!quizRow) return { ok: false, error: "Quiz not found." };
  const quiz = quizRow as { id: string; title: string; description: string | null };
  if (!quiz.description?.trim()) {
    return { ok: false, error: "This quiz has no passage to illustrate." };
  }

  // The description is stored as `${title}\n\n${passage}` — strip the
  // title prefix so the brief generator sees just the passage body.
  const desc = quiz.description.trim();
  const passageBody = desc.startsWith(quiz.title)
    ? desc.slice(quiz.title.length).trim()
    : desc;

  const { generateImageBrief, generateImage } = await import(
    "@/lib/ai/readee-ai"
  );
  const briefRes = await generateImageBrief({
    teacherId: profile.id,
    passageTitle: quiz.title,
    passageBody,
  });
  let imagePrompt = `Illustration for a children's reading passage titled "${quiz.title}".`;
  if (briefRes.ok) imagePrompt = briefRes.brief;
  const imgRes = await generateImage({
    teacherId: profile.id,
    prompt: imagePrompt,
  });
  if (!imgRes.ok) return { ok: false, error: imgRes.error };

  // Find the previous hero URL by looking at the first question's
  // image_url, then update every question on this quiz that points at
  // it. Per-question manual images (different URLs) are left alone.
  const { data: junction } = await supabase
    .from("custom_quiz_questions")
    .select("position, question_id")
    .eq("quiz_id", input.quizId)
    .order("position", { ascending: true });
  const ordered = (junction ?? []) as { position: number; question_id: string }[];
  if (ordered.length === 0) {
    return { ok: true, imageUrl: imgRes.imageUrl, updatedCount: 0 };
  }
  const firstId = ordered[0].question_id;
  const { data: firstQ } = await supabase
    .from("custom_questions")
    .select("image_url")
    .eq("id", firstId)
    .maybeSingle();
  const oldUrl = (firstQ as any)?.image_url as string | null;

  const idsToUpdate: string[] = [];
  if (oldUrl) {
    const { data: matching } = await supabase
      .from("custom_questions")
      .select("id")
      .in("id", ordered.map((j) => j.question_id))
      .eq("image_url", oldUrl);
    for (const m of (matching ?? []) as { id: string }[]) {
      idsToUpdate.push(m.id);
    }
  } else {
    // No previous image — just stamp the first question.
    idsToUpdate.push(firstId);
  }

  const { error: updateErr } = await supabase
    .from("custom_questions")
    .update({ image_url: imgRes.imageUrl })
    .in("id", idsToUpdate);
  if (updateErr) {
    return { ok: false, error: `Could not save image: ${updateErr.message}` };
  }

  revalidatePath(`/classroom/authoring/quiz/${input.quizId}`);
  return {
    ok: true,
    imageUrl: imgRes.imageUrl,
    updatedCount: idsToUpdate.length,
  };
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

/**
 * Build a slideshow lesson via the lesson wizard. Mirrors
 * aiBuildAssignment but returns a lessonId for /classroom/lessons.
 */
export async function aiBuildLesson(input: {
  brief: import("@/lib/ai/build-lesson").LessonBrief;
}): Promise<
  | { ok: true; lessonId: string; warnings: string[]; creditsUsed: number }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can use Readee.ai." };
  }
  const { buildLesson } = await import("@/lib/ai/build-lesson");
  const res = await buildLesson({ teacherId: profile.id, brief: input.brief });
  if (res.ok) {
    revalidatePath("/classroom/lessons");
  }
  return res;
}

/**
 * Build a decodable book — short multi-page reader targeting a
 * specific phonics pattern.
 */
export async function aiBuildBook(input: {
  brief: import("@/lib/ai/build-book").BookBrief;
}): Promise<
  | { ok: true; bookId: string; warnings: string[]; creditsUsed: number }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can use Readee.ai." };
  }
  const { buildBook } = await import("@/lib/ai/build-book");
  const res = await buildBook({ teacherId: profile.id, brief: input.brief });
  if (res.ok) {
    revalidatePath("/classroom/books");
  }
  return res;
}

/**
 * Build a differentiated reading passage — same story at three
 * reading levels (easy / on-level / advanced). One AI call so the
 * plot stays identical, only vocabulary varies.
 */
export async function aiBuildLeveledPassage(input: {
  brief: import("@/lib/ai/build-leveled").LeveledBrief;
}): Promise<
  | { ok: true; passageId: string; warnings: string[]; creditsUsed: number }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can use Readee.ai." };
  }
  const { buildLeveledPassage } = await import("@/lib/ai/build-leveled");
  const res = await buildLeveledPassage({ teacherId: profile.id, brief: input.brief });
  if (res.ok) {
    revalidatePath("/classroom/leveled");
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

/**
 * Regenerate a single question in place. Reuses the question's current
 * prompt as the topic seed (so a "rocks" MCQ stays about rocks) and
 * pulls the parent quiz's description as passage context when present.
 *
 * Only multiple_choice and true_false are supported — matching_pairs is
 * a single multi-pair object and fill_in_blank has no AI generator.
 *
 * Preserves image_url + audio_url + position via the untouched junction
 * row, so the visual context (passage hero image, narration) stays
 * attached after regeneration.
 */
export async function aiRegenerateQuestion(input: {
  quizId: string;
  questionId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can use Readee.ai." };
  }

  const supabase = await createClient();

  const { data: q } = await supabase
    .from("custom_questions")
    .select("id, kind, prompt, teacher_id")
    .eq("id", input.questionId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!q) return { ok: false, error: "Question not found." };

  const kind = (q as any).kind as string;
  if (kind !== "multiple_choice" && kind !== "true_false") {
    return {
      ok: false,
      error: "This question type can't be regenerated yet.",
    };
  }

  const { data: quiz } = await supabase
    .from("custom_quizzes")
    .select("description, grade_level")
    .eq("id", input.quizId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!quiz) return { ok: false, error: "Quiz not found." };

  const passage = ((quiz as any).description as string | null) ?? "";
  const gradeLevel = ((quiz as any).grade_level as string | null) ?? null;
  const seedPrompt = ((q as any).prompt as string).trim();

  // Topic seed: passage if present (gives the AI real context), else
  // the question's own prompt as a fallback theme.
  const topic =
    passage.length > 0
      ? `${passage.slice(0, 1500)}\n\nWrite a fresh question about: ${seedPrompt}`
      : seedPrompt;

  if (kind === "multiple_choice") {
    const res = await generateMCQQuestions({
      teacherId: profile.id,
      topic,
      gradeLevel,
      count: 1,
    });
    if (!res.ok) return { ok: false, error: res.error };
    const fresh = res.questions[0];
    if (!fresh) return { ok: false, error: "AI returned no question." };
    const { error: upErr } = await supabase
      .from("custom_questions")
      .update({
        prompt: fresh.prompt,
        choices: fresh.choices,
        correct: fresh.correct,
        hint: fresh.hint ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.questionId)
      .eq("teacher_id", profile.id);
    if (upErr) return { ok: false, error: upErr.message };
  } else {
    const res = await generateTrueFalseQuestions({
      teacherId: profile.id,
      topic,
      gradeLevel,
      count: 1,
    });
    if (!res.ok) return { ok: false, error: res.error };
    const fresh = res.questions[0];
    if (!fresh) return { ok: false, error: "AI returned no question." };
    const { error: upErr } = await supabase
      .from("custom_questions")
      .update({
        prompt: fresh.prompt,
        choices: null,
        correct: fresh.correct,
        hint: fresh.hint ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.questionId)
      .eq("teacher_id", profile.id);
    if (upErr) return { ok: false, error: upErr.message };
  }

  revalidatePath(`/classroom/authoring/quiz/${input.quizId}`);
  return { ok: true };
}
