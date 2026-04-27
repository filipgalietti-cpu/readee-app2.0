"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth/helpers";
import { regenerateMCQQuestion } from "@/lib/ai/readee-ai";

type Level = "easy" | "on_level" | "advanced";

type LeveledVersion = {
  level: Level;
  grade: string;
  title: string;
  body: string;
  audio_url: string | null;
  question_ids: string[];
};

/**
 * Records an APPROVE on a question. Idempotent.
 */
export async function approveQuestion(input: {
  questionId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: q } = await supabase
    .from("custom_questions")
    .select("id, prompt")
    .eq("id", input.questionId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!q) return { ok: false, error: "Question not found." };

  const { error } = await supabase.from("question_feedback").upsert(
    {
      teacher_id: profile.id,
      question_id: input.questionId,
      verdict: "approved",
      reason: null,
      prompt_snapshot: (q as any).prompt,
      replacement_question_id: null,
    },
    { onConflict: "teacher_id,question_id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * REJECT + regenerate. Saves the rejection feedback, asks Gemini for a
 * single replacement question grounded in the leveled-passage body, then
 * swaps the old question id for the new one inside
 * differentiated_passages.versions[N].question_ids. Readee eats the
 * regen cost (logged with creditsUsed=0).
 */
export async function rejectAndRegenerateLeveledQuestion(input: {
  passageId: string;
  level: Level;
  questionId: string;
  reason: string;
}): Promise<
  | { ok: true; newQuestionId: string }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can review questions." };
  }

  const reason = input.reason.trim().slice(0, 500);
  if (!reason) return { ok: false, error: "Tell us briefly what was wrong." };

  const supabase = await createClient();

  const [
    { data: passage },
    { data: oldQ },
  ] = await Promise.all([
    supabase
      .from("differentiated_passages")
      .select("id, base_grade, versions")
      .eq("id", input.passageId)
      .eq("teacher_id", profile.id)
      .maybeSingle(),
    supabase
      .from("custom_questions")
      .select("id, prompt, choices, correct, hint")
      .eq("id", input.questionId)
      .eq("teacher_id", profile.id)
      .maybeSingle(),
  ]);

  if (!passage) return { ok: false, error: "Passage not found." };
  if (!oldQ) return { ok: false, error: "Question not found." };

  const versions = ((passage as any).versions ?? []) as LeveledVersion[];
  const v = versions.find((x) => x.level === input.level);
  if (!v) return { ok: false, error: "Level not on this passage." };
  if (!v.question_ids.includes(input.questionId)) {
    return { ok: false, error: "Question doesn't belong to that level." };
  }

  const oldChoices = Array.isArray((oldQ as any).choices)
    ? ((oldQ as any).choices as string[])
    : [];

  // 1) Regenerate via Gemini.
  const regen = await regenerateMCQQuestion({
    teacherId: profile.id,
    passageBody: v.body,
    gradeLevel: v.grade ?? (passage as any).base_grade ?? null,
    oldQuestion: {
      prompt: (oldQ as any).prompt,
      choices: oldChoices,
      correct: String((oldQ as any).correct),
    },
    rejectionReason: reason,
  });
  if (!regen.ok) return { ok: false, error: regen.error };

  const admin = supabaseAdmin();

  // 2) Insert the new question.
  const { data: newQ, error: insErr } = await admin
    .from("custom_questions")
    .insert({
      teacher_id: profile.id,
      kind: "multiple_choice",
      prompt: regen.question.prompt,
      choices: regen.question.choices,
      correct: regen.question.correct,
      hint: regen.question.hint ?? null,
    })
    .select("id")
    .single();
  if (insErr || !newQ) {
    return { ok: false, error: `Could not save replacement: ${insErr?.message ?? "unknown"}` };
  }
  const newQuestionId = (newQ as { id: string }).id;

  // 3) Swap the id inside versions[level].question_ids.
  const updatedVersions = versions.map((ver) => {
    if (ver.level !== input.level) return ver;
    return {
      ...ver,
      question_ids: ver.question_ids.map((id) =>
        id === input.questionId ? newQuestionId : id,
      ),
    };
  });
  const { error: updErr } = await admin
    .from("differentiated_passages")
    .update({ versions: updatedVersions })
    .eq("id", input.passageId);
  if (updErr) return { ok: false, error: updErr.message };

  // 4) Save the rejection feedback (with replacement link).
  await admin.from("question_feedback").upsert(
    {
      teacher_id: profile.id,
      question_id: input.questionId,
      verdict: "rejected",
      reason,
      prompt_snapshot: (oldQ as any).prompt,
      replacement_question_id: newQuestionId,
    },
    { onConflict: "teacher_id,question_id" },
  );

  revalidatePath(`/classroom/leveled/${input.passageId}`);
  return { ok: true, newQuestionId };
}
