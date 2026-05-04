/**
 * Client-safe slice of build-lesson.
 *
 * The full build-lesson module imports server-only deps (supabase admin
 * client, Gemini SDK via readee-ai, Vertex auth via google-auth-library,
 * which pulls node:net + child_process). Client components (LessonWizard)
 * only need the brief shape and the credit estimator — those have no
 * node-only imports and live here so the wizard renders without
 * dragging the server surface into the browser bundle.
 *
 * The full module re-exports these so existing server-side imports
 * keep working without churn.
 */

import { CREDIT_COST } from "@/lib/ai/credits";

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
