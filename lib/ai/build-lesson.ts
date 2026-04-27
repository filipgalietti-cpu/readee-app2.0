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
  generateLessonStructure,
  generateMCQQuestions,
  generateImage,
  generateSpeech,
  checkRateLimit,
  settleBatchAgainstTopUp,
  type GeneratedMCQ,
} from "@/lib/ai/readee-ai";
import { extractCharacterCard } from "@/lib/ai/character-card";
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
    // image_scene is produced inline by the lesson generator, so we
    // skip the per-slide image_brief call — just pay for the image.
    credits += brief.slideCount * CREDIT_COST.image_generation;
    // Character card: 1 text call + 1 reference image (only spent if a
    // recurring character is detected — otherwise just the text call).
    credits += CREDIT_COST.passage_generation + CREDIT_COST.image_generation;
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

  // 2) Generate the lesson structure (title + slides with display_text +
  //    body + image_scene). The model classifies concept-vs-topic and
  //    picks the right teaching arc — no more story-shaped slideshows.
  const lessonRes = await generateLessonStructure({
    teacherId,
    topic: brief.topic,
    gradeLevel: brief.gradeLevel,
    slideCount: brief.slideCount,
  });
  if (!lessonRes.ok) {
    warnings.push(`Lesson: ${lessonRes.error}`);
    return { ok: false, error: `Lesson generation failed: ${lessonRes.error}` };
  }
  creditsUsed += CREDIT_COST.passage_generation;
  const passageTitle = lessonRes.lesson.title;
  const lessonSlides = lessonRes.lesson.slides;
  const passageBody = lessonSlides.map((s) => s.body).join("\n\n");

  // Backfill the row title with the AI title if teacher left it blank.
  if (brief.title.trim().length === 0) {
    await admin
      .from("custom_lessons")
      .update({ title: passageTitle.slice(0, 120) })
      .eq("id", lessonId);
  }

  // 3) Character card — same pattern as books. If the slideshow has a
  //    recurring character, generate a reference portrait and anchor
  //    every slide image to it. For purely informational/concept lessons
  //    with no protagonist, the helper returns hasCharacter=false and
  //    we skip the reference step.
  let characterDescription = "";
  let referenceImage: { data: string; mimeType: string } | null = null;
  if (brief.media.perSlideImage) {
    const cardRes = await extractCharacterCard({
      teacherId,
      title: passageTitle,
      units: lessonSlides.map((s) => s.body),
      contextTag: "lesson",
    });
    if (cardRes.ok && cardRes.hasCharacter) {
      creditsUsed += CREDIT_COST.passage_generation;
      characterDescription = cardRes.description;
      const refRes = await generateImage({
        teacherId,
        prompt: `${cardRes.cardPrompt} ${cardRes.description} Centered, full body visible, soft pastel background, no other characters, no text or labels.`,
      });
      if (refRes.ok) {
        creditsUsed += CREDIT_COST.image_generation;
        referenceImage = { data: refRes.imageBase64, mimeType: refRes.mimeType };
      } else {
        warnings.push(`Character card: ${refRes.error}`);
      }
    } else if (cardRes.ok && !cardRes.hasCharacter) {
      creditsUsed += CREDIT_COST.passage_generation;
    } else if (!cardRes.ok) {
      warnings.push(`Character card: ${cardRes.error}`);
    }
  }

  // 4) Per-slide media (image + audio). image_scene comes pre-written
  //    by the lesson generator, so no separate image-brief call.
  const slides: Slide[] = [];
  for (let i = 0; i < lessonSlides.length; i++) {
    const s = lessonSlides[i];
    let imageUrl: string | null = null;
    let audioUrl: string | null = null;

    if (s.body && brief.media.perSlideImage) {
      const baseScene = s.image_scene && s.image_scene.length > 10
        ? s.image_scene
        : `Scene from a children's lesson titled "${passageTitle}": ${s.body.slice(0, 180)}`;
      const imagePrompt = characterDescription
        ? `Character: ${characterDescription}\nScene: ${baseScene}`
        : baseScene;
      const imgRes = await generateImage({
        teacherId,
        prompt: imagePrompt,
        referenceImage,
      });
      if (imgRes.ok) {
        imageUrl = imgRes.imageUrl;
        creditsUsed += CREDIT_COST.image_generation;
      } else {
        warnings.push(`Slide ${i + 1} image: ${imgRes.error}`);
      }
    }

    if (s.body && brief.media.perSlideAudio) {
      const ttsRes = await generateSpeech({
        teacherId,
        text: s.body.slice(0, 800),
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
      body: s.body,
      display_text: s.display_text || null,
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
