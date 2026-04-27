/**
 * Lesson orchestrator. Mirrors lib/ai/build-assignment.ts but produces
 * a slideshow lesson instead of a quiz.
 *
 * Flow:
 *   1. Generate a passage from the teacher's topic.
 *   2. Split it into N slide chunks (paragraphs / sentence groups).
 *   3. For each slide: generate an image brief → image, and TTS audio.
 *   4. Optionally generate end-of-lesson comprehension MCQs.
 *   5. Run the QC engine over passage + image + (any) questions.
 *   6. Persist as a row in custom_lessons.
 *
 * Cost (typical 5-slide lesson with all media):
 *   1 passage + 5 image briefs + 5 images + 5 audio + 3 MCQs + QC
 *   = 1 + 5 + 40 + 10 + 1 + 4 ≈ 61 credits ≈ $0.30
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  generatePassage,
  generateMCQQuestions,
  generateImage,
  generateImageBrief,
  generateSpeech,
  checkRateLimit,
  settleBatchAgainstTopUp,
  type GeneratedMCQ,
} from "@/lib/ai/readee-ai";
import { runFullQuizQc } from "@/lib/ai/qc";
import {
  CREDIT_COST,
  MONTHLY_CREDIT_LIMIT,
} from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

export type LessonBrief = {
  title: string;
  gradeLevel: string;
  topic: string;
  slideCount: number;
  media: {
    perSlideImage: boolean;
    perSlideAudio: boolean;
  };
  voice?: string | null;
  questionCount: number;
};

export type Slide = {
  position: number;
  body: string;
  display_text: string | null;
  image_url: string | null;
  audio_url: string | null;
};

function validateBrief(brief: LessonBrief): string | null {
  if (!brief.topic.trim()) return "Describe what the lesson is about.";
  if (brief.slideCount < 3 || brief.slideCount > 10) {
    return "Slide count must be between 3 and 10.";
  }
  if (brief.questionCount < 0 || brief.questionCount > 10) {
    return "Question count must be 0–10.";
  }
  return null;
}

export function estimateLessonCredits(brief: LessonBrief): number {
  let credits = CREDIT_COST.passage_generation;
  if (brief.media.perSlideImage) {
    credits += brief.slideCount * (CREDIT_COST.image_generation + CREDIT_COST.quiz_generation);
  }
  if (brief.media.perSlideAudio) {
    credits += brief.slideCount * CREDIT_COST.tts_generation;
  }
  if (brief.questionCount > 0) {
    credits += CREDIT_COST.quiz_generation;
  }
  // QC suite: passage + each question + image judging
  credits += 4;
  return credits;
}

/**
 * Splits a passage into N coherent slide chunks. Tries to keep
 * sentences together — splits on sentence boundaries. If the passage
 * has fewer sentences than slides, repeats with empty slides at the
 * end (rare, low-effort fallback).
 */
function splitPassageIntoSlides(passage: string, n: number): string[] {
  const sentences = passage
    .split(/([.!?]+\s+)/)
    .reduce<string[]>((acc, part, i, arr) => {
      // Recombine sentences with their punctuation.
      if (i % 2 === 0) {
        const next = arr[i + 1] ?? "";
        const s = (part + next).trim();
        if (s) acc.push(s);
      }
      return acc;
    }, []);

  if (sentences.length === 0) return [passage];
  if (sentences.length <= n) {
    // Pad each sentence into its own slide
    while (sentences.length < n) sentences.push("");
    return sentences;
  }

  const slidesText: string[] = Array.from({ length: n }, () => "");
  const perSlide = Math.ceil(sentences.length / n);
  for (let i = 0; i < sentences.length; i++) {
    const slot = Math.min(n - 1, Math.floor(i / perSlide));
    slidesText[slot] = (slidesText[slot] + " " + sentences[i]).trim();
  }
  return slidesText;
}

export async function buildLesson(input: {
  teacherId: string;
  brief: LessonBrief;
}): Promise<
  | { ok: true; lessonId: string; warnings: string[]; creditsUsed: number }
  | { ok: false; error: string }
> {
  const { teacherId, brief } = input;
  const validationErr = validateBrief(brief);
  if (validationErr) return { ok: false, error: validationErr };

  const admin = supabaseAdmin();
  const warnings: string[] = [];
  let creditsUsed = 0;

  // Pre-flight rate limit check (mirrors build-assignment).
  const budget = await checkRateLimit(teacherId, "passage_generation");
  if (!budget.allowed) return { ok: false, error: "Hit your monthly credit cap." };
  const monthlyUsedBefore = budget.monthlyUsed;

  // 1) Skeleton row so subsequent uploads have a parent.
  const initialTitle =
    brief.title.trim().slice(0, 120) || "Untitled lesson";
  const { data: lessonRow, error: lessonErr } = await admin
    .from("custom_lessons")
    .insert({
      teacher_id: teacherId,
      title: initialTitle,
      topic: brief.topic.trim().slice(0, 400),
      grade_level: brief.gradeLevel || null,
    })
    .select("id")
    .single();
  if (lessonErr || !lessonRow) {
    return {
      ok: false,
      error: `Could not create lesson row: ${lessonErr?.message ?? "unknown"}`,
    };
  }
  const lessonId = (lessonRow as { id: string }).id;

  // 2) Generate the passage.
  const passageRes = await generatePassage({
    teacherId,
    topic: brief.topic,
    gradeLevel: brief.gradeLevel,
    phonicsPattern: null,
  });
  if (!passageRes.ok) {
    warnings.push(`Passage: ${passageRes.error}`);
    return { ok: false, error: `Passage generation failed: ${passageRes.error}` };
  }
  creditsUsed += CREDIT_COST.passage_generation;
  const passageTitle = passageRes.passage.title;
  const passageBody = passageRes.passage.passage;

  // Backfill the row title with the AI title if teacher left it blank.
  if (brief.title.trim().length === 0) {
    await admin
      .from("custom_lessons")
      .update({ title: passageTitle.slice(0, 120) })
      .eq("id", lessonId);
  }

  // 3) Split into slide chunks.
  const slidesText = splitPassageIntoSlides(passageBody, brief.slideCount);
  const slides: Slide[] = [];

  // 4) Per-slide media (image + audio).
  for (let i = 0; i < slidesText.length; i++) {
    const text = slidesText[i];
    let imageUrl: string | null = null;
    let audioUrl: string | null = null;
    let displayText: string | null = null;

    if (text && brief.media.perSlideImage) {
      const briefRes = await generateImageBrief({
        teacherId,
        passageTitle: passageTitle,
        passageBody: text,
      });
      let imagePrompt = `Illustration for slide ${i + 1} of "${passageTitle}". Scene: ${text.slice(0, 200)}.`;
      if (briefRes.ok) {
        imagePrompt = briefRes.brief;
        creditsUsed += CREDIT_COST.quiz_generation;
      } else {
        warnings.push(`Slide ${i + 1} image brief: ${briefRes.error}`);
      }
      const imgRes = await generateImage({ teacherId, prompt: imagePrompt });
      if (imgRes.ok) {
        imageUrl = imgRes.imageUrl;
        creditsUsed += CREDIT_COST.image_generation;
      } else {
        warnings.push(`Slide ${i + 1} image: ${imgRes.error}`);
      }
    }

    if (text && brief.media.perSlideAudio) {
      const ttsRes = await generateSpeech({
        teacherId,
        text: text.slice(0, 800),
        voice: brief.voice ?? undefined,
      });
      if (ttsRes.ok) {
        audioUrl = ttsRes.audioUrl;
        creditsUsed += CREDIT_COST.tts_generation;
      } else {
        warnings.push(`Slide ${i + 1} audio: ${ttsRes.error}`);
      }
    }

    slides.push({
      position: i + 1,
      body: text,
      display_text: displayText,
      image_url: imageUrl,
      audio_url: audioUrl,
    });
  }

  // Cover image = the first slide's image (if any).
  const coverImageUrl = slides.find((s) => s.image_url)?.image_url ?? null;

  // 5) Comprehension questions (optional).
  const questionIds: string[] = [];
  let qcQuestions: { kind: "multiple_choice"; prompt: string; choices: string[]; correct: string; hint: string | null }[] = [];
  if (brief.questionCount > 0) {
    const mcqRes = await generateMCQQuestions({
      teacherId,
      topic: `${brief.topic}\n\nPassage students just read:\n"""\n${passageBody}\n"""`,
      gradeLevel: brief.gradeLevel,
      count: brief.questionCount,
    });
    if (mcqRes.ok && mcqRes.questions.length > 0) {
      creditsUsed += CREDIT_COST.quiz_generation;
      for (let i = 0; i < mcqRes.questions.length; i++) {
        const q = mcqRes.questions[i];
        const { data: row } = await admin
          .from("custom_questions")
          .insert({
            teacher_id: teacherId,
            kind: "multiple_choice",
            prompt: q.prompt,
            choices: q.choices,
            correct: q.correct,
            hint: q.hint ?? null,
          })
          .select("id")
          .single();
        if (row) {
          questionIds.push((row as { id: string }).id);
          qcQuestions.push({
            kind: "multiple_choice" as const,
            prompt: q.prompt,
            choices: q.choices,
            correct: q.correct,
            hint: q.hint ?? null,
          });
        }
      }
    } else if (!mcqRes.ok) {
      warnings.push(`Questions: ${mcqRes.error}`);
    }
  }

  // 6) QC pass.
  let qcReport: any = null;
  let qcOverall: "pass" | "warn" | "fail" = "pass";
  try {
    qcReport = await runFullQuizQc({
      teacherId,
      passageTitle,
      passageBody,
      gradeLevel: brief.gradeLevel,
      questions: qcQuestions,
      imageUrl: coverImageUrl,
      imageScene: null,
    });
    qcOverall = qcReport.overall;
    creditsUsed += qcReport.creditsUsed;
    for (const c of qcReport.checks) {
      if (c.severity === "fail") warnings.push(`QC: ${c.message}`);
    }
  } catch (e: any) {
    warnings.push(`QC: ${e.message ?? "QC failed"}`);
  }

  // 7) Persist final state.
  await admin
    .from("custom_lessons")
    .update({
      slides,
      question_ids: questionIds,
      cover_image_url: coverImageUrl,
      qc_overall: qcOverall,
      qc_report: qcReport,
    })
    .eq("id", lessonId);

  // 8) Top-up settlement.
  await settleBatchAgainstTopUp({
    profileId: teacherId,
    pool: "teacher",
    monthlyUsedBefore,
    creditsConsumed: creditsUsed,
    monthlyLimit: MONTHLY_CREDIT_LIMIT,
  });

  return { ok: true, lessonId, warnings, creditsUsed };
}
