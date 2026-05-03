/**
 * Public API for the content factory. Crons import from here so they
 * don't have to know about the individual guard helpers — one
 * `enqueueGeneratedAsset()` call per item handles QC, fidelity check,
 * gameability check, auto-promotion decision, and persistence to
 * content_review_queue + the live content table.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  decideAutoPromotion,
  type FactoryQcInput,
  type AutoPromotionVerdict,
} from "./auto-promote";
import {
  checkLengthBalance,
  checkSlotDistribution,
  rebalanceBatch,
  type GameabilityCheck,
} from "./mcq-balance";
import {
  checkStandardsFidelity,
  type FidelityResult,
} from "./standards-fidelity";
import { trackFactoryError } from "./tracking";

export {
  preflight,
  FACTORY_BATCH_CAPS,
  ESTIMATED_CREDITS_PER_ITEM,
  FACTORY_DAILY_CREDIT_CAP,
} from "./guards";
export {
  startFactoryRun,
  finishFactoryRun,
  todayCreditSpend,
  trackFactoryError,
} from "./tracking";
export { brandVoicePromptBlock, getBrandVoiceExemplars } from "./brand-voice";
export { checkTopicNotDuplicate } from "./topic-dedupe";
export {
  checkLengthBalance,
  checkSlotDistribution,
  rebalanceBatch,
  shuffleToSlot,
} from "./mcq-balance";
export {
  checkStandardsFidelity,
  type FidelityVerdict,
  type FidelityResult,
} from "./standards-fidelity";
export {
  decideAutoPromotion,
  type AutoPromotionVerdict,
  type FactoryQcInput,
} from "./auto-promote";

export type AssetKind =
  | "leveled_passage"
  | "calibrated_mcq"
  | "decodable_book"
  | "themed_story"
  | "vocab_card"
  | "multi_voice_audio";

export type EnqueueInput = {
  assetKind: AssetKind;
  /** Pointer to where the asset lives — { table: 'differentiated_passages', id: '<uuid>' }. */
  assetRef: { table: string; id: string };
  generationRunId: string;
  promptVersion: string;
  standardId?: string | null;
  title: string;
  thumbnailUrl?: string | null;
  qcOverall: "pass" | "warn" | "fail";
  qcReport?: Record<string, unknown> | null;
  /** Set if the asset is an MCQ — runs gameability check. */
  mcq?: { choices: string[]; correct: string } | null;
  /** Set to run the standards-fidelity judge. Pass `null` to skip
   *  (e.g. for free-reading themed stories). */
  fidelityInput?: {
    standardId: string;
    standardDescription: string;
    questionPrompt: string;
    choices: string[];
    correctAnswer: string;
    passageBody?: string | null;
  } | null;
  /** Full content for the dashboard preview. Without this, rejected
   *  rows have only the title fragment and operators can't see what
   *  was actually generated. Persists to content_review_queue.content_preview. */
  contentPreview?: {
    passageTitle?: string | null;
    passageBody?: string | null;
    imageUrl?: string | null;
    audioUrl?: string | null;
    /** For MCQ-shaped assets. */
    questionPrompt?: string | null;
    choices?: string[] | null;
    correct?: string | null;
    hint?: string | null;
  } | null;
};

export type EnqueueResult = {
  ok: true;
  queueId: string;
  verdict: AutoPromotionVerdict;
  fidelity: FidelityResult | null;
  gameability: GameabilityCheck | null;
};

/**
 * One-shot enqueue: take a freshly-generated asset, run every gating
 * check, decide auto-promotion, and persist to content_review_queue.
 */
export async function enqueueGeneratedAsset(
  input: EnqueueInput,
): Promise<EnqueueResult | { ok: false; error: string }> {
  // 1) Optional gameability check on MCQ-shaped assets.
  let gameability: GameabilityCheck | null = null;
  if (input.mcq && input.mcq.choices.length > 0) {
    gameability = checkLengthBalance(input.mcq.choices, input.mcq.correct);
  }

  // 2) Optional fidelity judge.
  let fidelity: FidelityResult | null = null;
  if (input.fidelityInput) {
    try {
      const r = await checkStandardsFidelity(input.fidelityInput);
      if (r.ok) fidelity = r.result;
    } catch (e) {
      trackFactoryError(e, {
        assetKind: input.assetKind,
        runId: input.generationRunId,
        extra: { stage: "fidelity_check" },
      });
    }
  }

  // 3) Decide where the item lands.
  const verdict = decideAutoPromotion({
    qcOverall: input.qcOverall,
    qcReport: input.qcReport as FactoryQcInput["qcReport"],
    fidelity,
    mcqLengthCheck: gameability,
  });

  // 4) Persist to the review queue. We stamp the verdict.reason into
  // reviewer_note so /owner/batch-qc shows WHY the auto-promotion
  // landed where it did — without this, rejected rows had null
  // reviewer_note and operators couldn't diagnose. Format: "auto: <reason>"
  // so it's clear this is system-generated, not a human review.
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("content_review_queue")
    .insert({
      asset_kind: input.assetKind,
      asset_ref: input.assetRef,
      source: "batch_v1",
      prompt_version: input.promptVersion,
      generation_run_id: input.generationRunId,
      standard_id: input.standardId ?? null,
      status: verdict.status,
      qc_overall: input.qcOverall,
      qc_report: input.qcReport ?? null,
      title: input.title,
      thumbnail_url: input.thumbnailUrl ?? null,
      reviewer_note: verdict.reason ? `auto: ${verdict.reason}` : null,
      content_preview: input.contentPreview ?? null,
    })
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Queue insert failed." };
  }
  return {
    ok: true,
    queueId: (data as { id: string }).id,
    verdict,
    fidelity,
    gameability,
  };
}

/**
 * Slot-distribution check across a batch. Run AFTER all items in the
 * batch have been enqueued individually. If the distribution is
 * skewed, returns the bias reason — caller's job to either accept it
 * (small batches won't have enough signal) or rebalance via
 * `rebalanceBatch()` before persisting.
 */
export function checkBatchSlotBias(
  questions: { choices: string[]; correct: string }[],
): GameabilityCheck {
  return checkSlotDistribution({ questions });
}
