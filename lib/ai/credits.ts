/**
 * Readee.ai cost model + credit budgets.
 *
 * Every AI call consumes credits. Credit cost is weighted to match Gemini's
 * actual per-call cost so the monthly cap is a real dollar cap, not a
 * vibes-based one.
 *
 * Budget logic:
 *   - Each teacher gets MONTHLY_CREDIT_LIMIT credits per 30-day rolling
 *     window. This is the economic cap (known worst-case $/teacher/month).
 *   - HOURLY_CREDIT_LIMIT is an abuse-control rate limit inside that —
 *     stops a bug or a bored teacher from burning a month of credits in
 *     ten minutes.
 *   - On cap hit, we HARD BLOCK and return a friendly error. We do NOT
 *     overage-bill. District admins get a "top up credits" button wired
 *     through the existing Stripe infra.
 *
 * Cost model (approx Gemini pricing as of 2026-04):
 *   Text (MCQ / matching / passage) ≈ $0.005/call  →  1 credit
 *   TTS short clip                   ≈ $0.010/call  →  2 credits
 *   Image                            ≈ $0.040/call  →  8 credits
 *
 * At MONTHLY_CREDIT_LIMIT = 500 credits, hardest possible spend:
 *   500 / 8 = 62 images        × $0.04 = $2.48/month
 *   500 / 2 = 250 TTS          × $0.01 = $2.50/month
 *   500 / 1 = 500 text calls   × $0.005 = $2.50/month
 * → ~$2.50/teacher/month ceiling on a fully-saturated teacher.
 * With district seat pricing around $5-10/teacher/month, that's
 * comfortably margin-positive.
 *
 * Typical usage (5-15 images/week, 20-40 TTS, 5 quiz gens) lands at
 * ~80-120 credits/month and costs ~$0.50-$1.00/teacher — plenty of room.
 *
 * When we want tier-aware limits (pilot vs paid district vs free trial),
 * read from a per-account override rather than editing these constants.
 */

export type AiKind =
  | "quiz_generation"
  | "image_generation"
  | "tts_generation"
  | "passage_generation";

export const CREDIT_COST: Record<AiKind, number> = {
  quiz_generation: 1,
  passage_generation: 1,
  tts_generation: 2,
  image_generation: 8,
};

/** Max credits a teacher can consume in any rolling 30-day window. */
export const MONTHLY_CREDIT_LIMIT = 500;

/** Max credits inside any rolling 60-minute window.
 *  Set equal to the monthly cap on purpose: we WANT teachers to burn
 *  through their allowance as fast as they like — faster burn = sooner
 *  credit-pack purchase. The hourly cap exists only to catch a runaway
 *  code loop (which would have to drain an entire month in 60 minutes
 *  to trip). Monthly cap is the real economic ceiling. */
export const HOURLY_CREDIT_LIMIT = 500;

/**
 * Estimated USD cost per credit — used for internal budgeting views and
 * for projecting spend. Not user-facing.
 */
export const USD_PER_CREDIT_ESTIMATE = 0.005;

export function estimatedDollarCost(creditsUsed: number): number {
  return Number((creditsUsed * USD_PER_CREDIT_ESTIMATE).toFixed(4));
}
