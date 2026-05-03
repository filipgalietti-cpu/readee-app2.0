/**
 * Client-safe slice of build-parent-content.
 *
 * The full build-parent-content module imports server-only deps
 * (supabase admin client, Gemini SDK, Vertex auth). Client components
 * (AskReadeeWizard, etc.) only need the brief shape, the credit
 * estimator, and the monthly cap — those have no node-only imports
 * and live here so the wizard can render without dragging the server
 * surface into the browser bundle.
 *
 * The full module re-exports these so existing server-side imports
 * keep working without churn.
 */

import { CREDIT_COST } from "@/lib/ai/credits";

export const MONTHLY_PARENT_CREDIT_LIMIT = 200;
// Hourly cap == monthly cap on purpose — see lib/ai/credits.ts. We
// want fast burn (drives top-up purchases). This only catches a
// runaway loop, not legitimate batch usage.
export const HOURLY_PARENT_CREDIT_LIMIT = 200;

export type ParentAiBrief = {
  childId: string;
  topic: string;
  phonicsPattern?: string | null;

  passage: { enabled: boolean };
  questionCount: number; // 0-5
  media: {
    image: boolean;
    passageTts: boolean;
    perQuestionTts: boolean;
  };
  voice?: string;

  /** Opt-in community sharing toggle — honored when Layer 4 ships. */
  shareWithCommunity: boolean;
};

export type ParentBuildResult =
  | {
      ok: true;
      contentId: string;
      warnings: string[];
      creditsUsed: number;
    }
  | { ok: false; error: string };

export function estimateParentBriefCredits(brief: ParentAiBrief): number {
  let credits = 0;
  if (brief.passage.enabled) {
    credits += CREDIT_COST.passage_generation;
    if (brief.media.image) credits += CREDIT_COST.image_generation;
    if (brief.media.passageTts) credits += CREDIT_COST.tts_generation;
  }
  const qCount = Math.max(0, Math.min(5, Math.floor(brief.questionCount)));
  if (qCount > 0) credits += CREDIT_COST.quiz_generation;
  if (brief.media.perQuestionTts) {
    credits += qCount * CREDIT_COST.tts_generation;
  }
  return credits;
}
