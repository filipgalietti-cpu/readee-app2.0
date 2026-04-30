/**
 * Hard caps + pre-flight checks every factory cron must pass before
 * spending Gemini API credits. Catches runaway loops, prompt bugs,
 * and misconfigured cron triggers BEFORE we burn money.
 */

/** Per-cron hard cap on items in one batch. Override only with eyes open. */
export const FACTORY_BATCH_CAPS: Record<string, number> = {
  leveled_passage: 15,
  calibrated_mcq: 50,
  decodable_book: 10,
  themed_story: 3,
  vocab_card: 30,
  multi_voice_audio: 100,
};

/**
 * Estimated worst-case credits per asset kind. Used to fail fast if
 * a batch would blow past the daily factory budget.
 *
 * Costs are approximations of Gemini Batch API at 50% off:
 *   leveled_passage (3 levels + image + audio) ≈ 8 credits
 *   calibrated_mcq (text + judge) ≈ 1.5 credits
 *   decodable_book (4 pages + image) ≈ 10 credits
 *   themed_story (passage + image + audio) ≈ 12 credits
 *   vocab_card (text + image + audio) ≈ 6 credits
 */
export const ESTIMATED_CREDITS_PER_ITEM: Record<string, number> = {
  leveled_passage: 8,
  calibrated_mcq: 2,
  decodable_book: 10,
  themed_story: 12,
  vocab_card: 6,
  multi_voice_audio: 4,
};

/** Daily factory budget across all asset kinds. ~$50/mo target. */
export const FACTORY_DAILY_CREDIT_CAP = 350;

export type PreflightResult =
  | { ok: true; budgetUsed: number }
  | { ok: false; reason: string; budgetUsed: number };

/**
 * Run before any factory cron generates anything. Validates:
 * - asset_kind is recognized
 * - requested_count is within the per-kind cap
 * - estimated cost fits today's remaining factory budget
 *
 * `creditsAlreadySpentToday` should be the sum of factory_runs.credits_used
 * for today's date across all kinds. The cron caller passes it in so this
 * helper stays pure.
 */
export function preflight(input: {
  assetKind: string;
  requestedCount: number;
  creditsAlreadySpentToday: number;
}): PreflightResult {
  const cap = FACTORY_BATCH_CAPS[input.assetKind];
  const perItem = ESTIMATED_CREDITS_PER_ITEM[input.assetKind];
  if (cap == null || perItem == null) {
    return {
      ok: false,
      reason: `Unknown asset_kind "${input.assetKind}". Add it to FACTORY_BATCH_CAPS.`,
      budgetUsed: input.creditsAlreadySpentToday,
    };
  }
  if (input.requestedCount <= 0) {
    return {
      ok: false,
      reason: "requestedCount must be > 0",
      budgetUsed: input.creditsAlreadySpentToday,
    };
  }
  if (input.requestedCount > cap) {
    return {
      ok: false,
      reason: `Requested ${input.requestedCount} > per-kind cap ${cap} for ${input.assetKind}.`,
      budgetUsed: input.creditsAlreadySpentToday,
    };
  }
  const estimatedCost = input.requestedCount * perItem;
  const projected = input.creditsAlreadySpentToday + estimatedCost;
  if (projected > FACTORY_DAILY_CREDIT_CAP) {
    return {
      ok: false,
      reason: `Estimated ${estimatedCost} credits would push today's spend to ${projected}, over daily cap ${FACTORY_DAILY_CREDIT_CAP}.`,
      budgetUsed: input.creditsAlreadySpentToday,
    };
  }
  return { ok: true, budgetUsed: input.creditsAlreadySpentToday };
}
