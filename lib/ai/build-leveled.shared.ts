/**
 * Client-safe slice of build-leveled.
 *
 * The full build-leveled module imports server-only deps (@google/genai,
 * supabase admin client, Vertex auth via google-auth-library, which
 * pulls node:net + child_process). Client components (LeveledWizard)
 * only need the brief shape and the credit estimator — those have no
 * node-only imports and live here so the wizard renders without
 * dragging the server surface into the browser bundle.
 *
 * The full module re-exports these so existing server-side imports
 * keep working without churn.
 */

import { CREDIT_COST } from "@/lib/ai/credits";

export type Level = "easy" | "on_level" | "advanced";

export type LeveledBrief = {
  title: string;
  topic: string;
  baseGrade: string; // e.g. "3rd"
  perVersionAudio: boolean;
  sharedImage: boolean;
  questionsPerLevel: number; // 0-5
};

export type LeveledVersion = {
  level: Level;
  grade: string;
  title: string;
  body: string;
  audio_url: string | null;
  question_ids: string[];
};

export function estimateLeveledCredits(brief: LeveledBrief): number {
  let credits = CREDIT_COST.passage_generation;
  if (brief.sharedImage) {
    credits += CREDIT_COST.image_generation + CREDIT_COST.quiz_generation;
  }
  if (brief.perVersionAudio) {
    credits += 3 * CREDIT_COST.tts_generation;
  }
  if (brief.questionsPerLevel > 0) {
    credits += 3 * CREDIT_COST.quiz_generation;
  }
  credits += 3; // QC
  return credits;
}
