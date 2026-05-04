/**
 * Client-safe slice of build-book.
 *
 * The full build-book module imports server-only deps (@google/genai,
 * supabase admin client, Vertex auth via google-auth-library, which
 * pulls node:net + child_process). Client components (BookWizard) only
 * need the brief shape and the credit estimator — those have no
 * node-only imports and live here so the wizard renders without
 * dragging the server surface into the browser bundle.
 *
 * The full module re-exports these so existing server-side imports
 * keep working without churn.
 */

import { CREDIT_COST } from "@/lib/ai/credits";

export type BookBrief = {
  title: string;
  phonicsPattern: string;
  patternLabel: string;
  gradeLevel: string;
  pageCount: number;
  perPageImage: boolean;
};

export function estimateBookCredits(brief: BookBrief): number {
  let credits = CREDIT_COST.passage_generation;
  if (brief.perPageImage) {
    // +1 text credit for the character-card extraction, +1 image for the
    // reference card. Per-page = image_brief + image (the reference image
    // anchors all pages so the cat looks like the same cat throughout).
    credits += CREDIT_COST.passage_generation + CREDIT_COST.image_generation;
    credits += brief.pageCount * (CREDIT_COST.image_generation + CREDIT_COST.quiz_generation);
  }
  credits += 3; // QC suite (no questions, just passage + image)
  return credits;
}
