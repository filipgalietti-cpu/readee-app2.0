/**
 * Client-safe slice of build-assignment.
 *
 * The full build-assignment module imports server-only deps (supabase
 * admin client, Gemini SDK via readee-ai, Vertex auth via
 * google-auth-library, which pulls node:net + child_process). Client
 * components (AssignmentWizard) only need the brief shape and the
 * credit estimator — those have no node-only imports and live here
 * so the wizard renders without dragging the server surface into the
 * browser bundle.
 *
 * The full module re-exports these so existing server-side imports
 * keep working without churn.
 */

import { CREDIT_COST } from "@/lib/ai/credits";

export type AssignmentBrief = {
  title: string;
  gradeLevel: string;
  topic: string;
  phonicsPattern?: string | null;
  /** Optional CCSS standard the teacher picked. When set, every
   *  question generator gets the standard description as a hard
   *  skill-fidelity constraint — questions MUST require the named
   *  skill, not generic plot recall. Pre-empts the "Author's POV
   *  brief → plot-recall MCQs" mismatch where the topic was named
   *  but the generator didn't know what skill to test. */
  standardId?: string | null;
  standardDescription?: string | null;

  passage: {
    enabled: boolean;
    /** Per-grade word-count tier. Short by default so 2nd graders
     *  aren't reading an essay. */
    length?: "short" | "medium" | "long";
  };
  questions: {
    multipleChoice: number;
    trueFalse: number;
    matching: number;
    /** Number of free-response writing prompts to append. Each one
     *  is AI-generated based on the passage and rubric-graded at
     *  submit time. */
    writingPrompts?: number;
  };
  media: {
    passageImage: boolean;
    passageTts: boolean;
    perQuestionTts: boolean;
  };
  /** Underlying Gemini voice name. Defaults to Autonoe. */
  voice?: string;
};

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
  // Writing prompts: one Gemini call to generate prompts (cheap),
  // and the rubric grading happens at student-submit time, billed
  // per submission rather than per-build.
  if ((brief.questions.writingPrompts ?? 0) > 0) {
    credits += CREDIT_COST.quiz_generation;
  }
  if (brief.media.perQuestionTts) {
    const totalQuestions =
      brief.questions.multipleChoice +
      brief.questions.trueFalse +
      brief.questions.matching +
      (brief.questions.writingPrompts ?? 0);
    credits += totalQuestions * CREDIT_COST.tts_generation;
  }
  return credits;
}
