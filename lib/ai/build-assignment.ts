/**
 * Readee.ai assignment orchestrator.
 *
 * Single entry point used by the authoring wizard. Given a teacher brief
 * (topic, grade, question mix, media options), it:
 *
 *   1. Runs a pre-flight credit check on the *total* projected spend,
 *      so a teacher never gets halfway through a build and hits the cap.
 *   2. Creates the custom_quizzes row.
 *   3. Generates the passage (optional), passage image (optional),
 *      passage TTS (optional).
 *   4. Generates the requested MCQ + T/F questions in one model call,
 *      then matching pairs (if requested) which are converted to MCQs via
 *      pairsToMCQs so they plug into the existing student runner.
 *   5. Optionally generates TTS for every question prompt.
 *   6. Persists everything transactionally — if any post-quiz step fails
 *      hard, the placeholder quiz is deleted so the teacher doesn't see
 *      a half-built ghost.
 *
 * Errors during media generation (image / TTS) are *soft* — we log them
 * and continue, because losing an image shouldn't nuke an otherwise good
 * quiz. Errors during question generation are hard — without questions
 * the quiz is useless, so we roll back.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  generateMCQQuestions,
  generateMatchingPairs,
  generatePassage,
  generateImage,
  generateSpeech,
  generateTrueFalseQuestions,
  checkRateLimit,
  settleBatchAgainstTopUp,
} from "@/lib/ai/readee-ai";
import { CREDIT_COST, MONTHLY_CREDIT_LIMIT } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

export type AssignmentBrief = {
  title: string;
  gradeLevel: string;
  topic: string;
  phonicsPattern?: string | null;

  passage: { enabled: boolean };
  questions: {
    multipleChoice: number;
    trueFalse: number;
    matching: number;
  };
  media: {
    passageImage: boolean;
    passageTts: boolean;
    perQuestionTts: boolean;
  };
  /** Underlying Gemini voice name. Defaults to Autonoe. */
  voice?: string;
};

export type BuildProgressStep =
  | "passage"
  | "passage_image"
  | "passage_tts"
  | "mcq"
  | "matching"
  | "per_question_tts";

export type BuildResult =
  | {
      ok: true;
      quizId: string;
      warnings: string[];
      creditsUsed: number;
    }
  | { ok: false; error: string };

/**
 * Estimate the total credit cost of a brief. Pure, no DB calls —
 * the wizard uses this to show teachers the price before they commit,
 * and the orchestrator uses it for the pre-flight budget check.
 */
export function estimateBriefCredits(brief: AssignmentBrief): number {
  let credits = 0;
  if (brief.passage.enabled) {
    credits += CREDIT_COST.passage_generation;
    if (brief.media.passageImage) credits += CREDIT_COST.image_generation;
    if (brief.media.passageTts) credits += CREDIT_COST.tts_generation;
  }
  const mcqCount = brief.questions.multipleChoice + brief.questions.trueFalse;
  if (mcqCount > 0) credits += CREDIT_COST.quiz_generation;
  if (brief.questions.matching > 0) credits += CREDIT_COST.quiz_generation;
  if (brief.media.perQuestionTts) {
    const totalQuestions =
      brief.questions.multipleChoice +
      brief.questions.trueFalse +
      brief.questions.matching;
    credits += totalQuestions * CREDIT_COST.tts_generation;
  }
  return credits;
}

function validateBrief(brief: AssignmentBrief): string | null {
  if (!brief.title.trim()) return "Give the assignment a title.";
  if (!brief.topic.trim()) return "Describe what the assignment is about.";
  const totalQs =
    brief.questions.multipleChoice +
    brief.questions.trueFalse +
    brief.questions.matching;
  if (totalQs === 0) return "Pick at least one question to generate.";
  if (totalQs > 20) return "Keep an assignment under 20 questions.";
  if (brief.questions.multipleChoice > 15) return "Max 15 MCQs per batch.";
  if (brief.questions.trueFalse > 10) return "Max 10 true/false per batch.";
  if (brief.questions.matching > 8) return "Max 8 matching pairs per batch.";
  if (brief.media.passageImage && !brief.passage.enabled) {
    return "Passage image requires a passage.";
  }
  if (brief.media.passageTts && !brief.passage.enabled) {
    return "Passage audio requires a passage.";
  }
  return null;
}

type BuiltQuestion =
  | {
      kind: "multiple_choice";
      prompt: string;
      choices: string[];
      correct: string;
      hint: string | null;
      image_url?: string | null;
      audio_url?: string | null;
    }
  | {
      kind: "true_false";
      prompt: string;
      correct: "True" | "False";
      hint: string | null;
      image_url?: string | null;
      audio_url?: string | null;
    }
  | {
      kind: "matching_pairs";
      prompt: string;
      // Left column items in display order.
      choices: string[];
      // jsonb: { pairs: [{left, right}, ...] } — answer key.
      correct: { pairs: { left: string; right: string }[] };
      hint: string | null;
      image_url?: string | null;
      audio_url?: string | null;
    };

async function appendQuestion(
  quizId: string,
  teacherId: string,
  q: BuiltQuestion,
  position: number,
): Promise<string | null> {
  const admin = supabaseAdmin();
  const choicesValue =
    q.kind === "true_false" ? ["True", "False"] : q.choices;
  const correctValue = q.correct;
  const { data: qRow, error: qErr } = await admin
    .from("custom_questions")
    .insert({
      teacher_id: teacherId,
      kind: q.kind,
      prompt: q.prompt,
      choices: choicesValue,
      correct: correctValue,
      hint: q.hint ?? null,
      image_url: q.image_url ?? null,
      audio_url: q.audio_url ?? null,
    })
    .select("id")
    .single();
  if (qErr || !qRow) return null;
  const questionId = (qRow as any).id as string;
  const { error: jErr } = await admin
    .from("custom_quiz_questions")
    .insert({ quiz_id: quizId, question_id: questionId, position });
  if (jErr) return null;
  return questionId;
}

export async function buildAssignment(input: {
  teacherId: string;
  brief: AssignmentBrief;
}): Promise<BuildResult> {
  const { teacherId, brief } = input;
  const validationErr = validateBrief(brief);
  if (validationErr) return { ok: false, error: validationErr };

  // Pre-flight budget check: total projected spend must fit.
  const projected = estimateBriefCredits(brief);
  if (projected > MONTHLY_CREDIT_LIMIT) {
    return {
      ok: false,
      error: `This assignment would cost ${projected} credits, above the monthly cap of ${MONTHLY_CREDIT_LIMIT}. Reduce the question count or media options.`,
    };
  }
  const budget = await checkRateLimit(teacherId, "quiz_generation");
  const effectiveLimit = MONTHLY_CREDIT_LIMIT + budget.topUpBalance;
  if (budget.monthlyUsed + projected > effectiveLimit) {
    return {
      ok: false,
      error: `Not enough credits this month. You'd need ${projected}, but only ${
        effectiveLimit - budget.monthlyUsed
      } remain (${budget.topUpBalance} from top-ups). Top up more credits to keep building.`,
    };
  }
  const monthlyUsedBefore = budget.monthlyUsed;

  const admin = supabaseAdmin();
  const warnings: string[] = [];
  let creditsUsed = 0;

  // 1) Create the quiz skeleton first so image/audio uploads have a parent.
  const { data: quizRow, error: quizErr } = await admin
    .from("custom_quizzes")
    .insert({
      teacher_id: teacherId,
      title: brief.title.trim().slice(0, 120),
      description: brief.topic.trim().slice(0, 400) || null,
      grade_level: brief.gradeLevel || null,
    })
    .select("id")
    .single();
  if (quizErr || !quizRow) {
    return { ok: false, error: quizErr?.message ?? "Could not create quiz." };
  }
  const quizId = (quizRow as any).id as string;

  async function rollback(reason: string): Promise<BuildResult> {
    await admin.from("custom_quizzes").delete().eq("id", quizId);
    trackError(new Error(`buildAssignment rollback: ${reason}`), {
      route: "build-assignment",
      userId: teacherId,
      tags: { step: "rollback" },
      extra: { brief },
    });
    return { ok: false, error: reason };
  }

  // 2) Passage — optional, but if the teacher asked for one and it fails,
  //    the questions that depend on it would be contextless. We continue
  //    gracefully (questions will just be topic-based instead).
  let passageText = "";
  let passageImageUrl: string | null = null;
  let passageAudioUrl: string | null = null;

  if (brief.passage.enabled) {
    const passageRes = await generatePassage({
      teacherId,
      topic: brief.topic,
      gradeLevel: brief.gradeLevel,
      phonicsPattern: brief.phonicsPattern ?? null,
    });
    if (passageRes.ok) {
      passageText = passageRes.passage.passage;
      creditsUsed += CREDIT_COST.passage_generation;

      // Store the passage in the quiz description (first 2000 chars).
      await admin
        .from("custom_quizzes")
        .update({
          description:
            passageRes.passage.title +
            "\n\n" +
            passageText.slice(0, 1800),
        })
        .eq("id", quizId);

      if (brief.media.passageImage) {
        const imgRes = await generateImage({
          teacherId,
          prompt: `Illustration for a children's reading passage titled "${passageRes.passage.title}". Scene: ${brief.topic}.`,
        });
        if (imgRes.ok) {
          passageImageUrl = imgRes.imageUrl;
          creditsUsed += CREDIT_COST.image_generation;
        } else {
          warnings.push(`Passage image: ${imgRes.error}`);
        }
      }

      if (brief.media.passageTts) {
        const ttsRes = await generateSpeech({
          teacherId,
          text: passageText.slice(0, 1200),
          voice: brief.voice,
        });
        if (ttsRes.ok) {
          passageAudioUrl = ttsRes.audioUrl;
          creditsUsed += CREDIT_COST.tts_generation;
        } else {
          warnings.push(`Passage audio: ${ttsRes.error}`);
        }
      }
    } else {
      warnings.push(`Passage: ${passageRes.error}`);
    }
  }

  // Build the topic context we pass to question generators. If we have
  // a passage, questions reference it directly. Otherwise the topic.
  const questionContext = passageText
    ? `The passage below is what students read. Write questions strictly about it — do NOT invent facts outside it.\n\nPassage:\n"""\n${passageText}\n"""`
    : brief.topic;

  // 3) MCQ — only count what teacher asked as "multiple_choice".
  //    True/false has its own generator now (was previously merged into
  //    MCQ count, which meant T/F never showed up as actual T/F items).
  const builtQuestions: BuiltQuestion[] = [];

  if (brief.questions.multipleChoice > 0) {
    const mcqRes = await generateMCQQuestions({
      teacherId,
      topic: questionContext,
      gradeLevel: brief.gradeLevel,
      count: brief.questions.multipleChoice,
    });
    if (!mcqRes.ok) {
      return rollback(`Questions: ${mcqRes.error}`);
    }
    builtQuestions.push(
      ...mcqRes.questions.map((q) => ({
        kind: "multiple_choice" as const,
        prompt: q.prompt,
        choices: q.choices,
        correct: q.correct,
        hint: q.hint,
      })),
    );
    creditsUsed += CREDIT_COST.quiz_generation;
  }

  // 4) True/False — separate generator path so the kind is preserved.
  if (brief.questions.trueFalse > 0) {
    const tfRes = await generateTrueFalseQuestions({
      teacherId,
      topic: questionContext,
      gradeLevel: brief.gradeLevel,
      count: brief.questions.trueFalse,
    });
    if (tfRes.ok) {
      builtQuestions.push(
        ...tfRes.questions.map((q) => ({
          kind: "true_false" as const,
          prompt: q.prompt,
          correct: q.correct,
          hint: q.hint,
        })),
      );
      creditsUsed += CREDIT_COST.quiz_generation;
    } else {
      // T/F failure isn't fatal if MCQs succeeded.
      if (builtQuestions.length === 0) {
        return rollback(`True/false: ${tfRes.error}`);
      }
      warnings.push(`True/false: ${tfRes.error}`);
    }
  }

  // 5) Matching pairs — saved as a real matching_pairs question kind
  //    (no longer flattened into MCQs). The runner renders a
  //    connect-the-pairs UI for these.
  if (brief.questions.matching > 0) {
    const matchRes = await generateMatchingPairs({
      teacherId,
      topic: questionContext,
      gradeLevel: brief.gradeLevel,
      count: brief.questions.matching,
    });
    if (!matchRes.ok) {
      if (builtQuestions.length === 0) {
        return rollback(`Matching: ${matchRes.error}`);
      }
      warnings.push(`Matching: ${matchRes.error}`);
    } else {
      // One matching question = the whole set of pairs (typical UX
      // pattern). Left column = pair.left in original order; the
      // student's job is to connect each left to its matching right.
      const pairs = matchRes.pairs;
      builtQuestions.push({
        kind: "matching_pairs" as const,
        prompt: "Match each item on the left with the right answer.",
        choices: pairs.map((p) => p.left),
        correct: { pairs },
        hint: null,
      });
      creditsUsed += CREDIT_COST.quiz_generation;
    }
  }

  if (builtQuestions.length === 0) {
    return rollback("The AI didn't produce any usable questions.");
  }

  // 5) Per-question TTS (optional). Generated sequentially — the API
  //    rate-limits per teacher and parallel calls tend to fail.
  const questionAudioUrls: (string | null)[] = [];
  if (brief.media.perQuestionTts) {
    for (const q of builtQuestions) {
      const ttsRes = await generateSpeech({
        teacherId,
        text: q.prompt.slice(0, 1200),
        voice: brief.voice,
      });
      if (ttsRes.ok) {
        questionAudioUrls.push(ttsRes.audioUrl);
        creditsUsed += CREDIT_COST.tts_generation;
      } else {
        warnings.push(`Audio for "${q.prompt.slice(0, 30)}…": ${ttsRes.error}`);
        questionAudioUrls.push(null);
      }
    }
  }

  // 6) Persist each generated question — preserve its kind. The image
  //    + audio URLs attach to every question for consistent context.
  let position = 1;
  for (let i = 0; i < builtQuestions.length; i++) {
    const q = builtQuestions[i];
    const audio = questionAudioUrls[i] ?? null;
    const withMedia = { ...q, image_url: passageImageUrl, audio_url: audio };
    const saved = await appendQuestion(quizId, teacherId, withMedia, position++);
    if (!saved) {
      warnings.push(`Could not save question ${i + 1}.`);
    }
  }

  // Attach passage audio to the quiz description URL (via the first
  // question's prompt prefix isn't the right home — we'd need a quiz-
  // level audio column). For now we store it on the first question as
  // a shared audio so students hear it once when the quiz opens.
  if (passageAudioUrl && builtQuestions.length > 0) {
    const { data: firstJ } = await admin
      .from("custom_quiz_questions")
      .select("question_id")
      .eq("quiz_id", quizId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (firstJ) {
      const firstQId = (firstJ as any).question_id as string;
      // Only overwrite if we didn't already set a per-question TTS.
      if (!questionAudioUrls[0]) {
        await admin
          .from("custom_questions")
          .update({ audio_url: passageAudioUrl })
          .eq("id", firstQId);
      }
    }
  }

  // Debit the top-up pool for any credits spent past the monthly cap.
  await settleBatchAgainstTopUp({
    profileId: teacherId,
    pool: "teacher",
    monthlyUsedBefore,
    creditsConsumed: creditsUsed,
    monthlyLimit: MONTHLY_CREDIT_LIMIT,
  });

  return { ok: true, quizId, warnings, creditsUsed };
}
