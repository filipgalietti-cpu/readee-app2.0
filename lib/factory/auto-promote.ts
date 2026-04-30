/**
 * Confidence-based auto-promotion: items the QC engine is highly
 * confident about ship straight to the library; only ambiguous
 * ("warn") items hit the human review queue. Without this, Jen has
 * to triage 47 items/day — unsustainable.
 *
 * Goal: <10 items/day in the human queue at steady state.
 */

import type { GameabilityCheck } from "@/lib/factory/mcq-balance";
import type { FidelityResult } from "@/lib/factory/standards-fidelity";

export type FactoryQcInput = {
  qcOverall: "pass" | "warn" | "fail";
  qcReport?: {
    checks?: { name: string; severity: "pass" | "warn" | "fail" }[];
  };
  fidelity?: FidelityResult | null;
  mcqLengthCheck?: GameabilityCheck | null;
};

export type AutoPromotionVerdict = {
  status: "ready" | "needs_review" | "rejected";
  reason: string;
};

/**
 * Decide where the item lands. Rules in order:
 *
 *  1. Any QC `fail` OR fidelity `mis_tagged` OR length-cheat detected
 *     → REJECT (shadow row, prompt-tune signal)
 *  2. QC overall `warn` OR fidelity `partial` → NEEDS_REVIEW (human triage)
 *  3. QC overall `pass` AND fidelity `aligned` AND no length cheat → READY (auto-ship)
 *  4. Anything else (defensive default) → NEEDS_REVIEW
 */
export function decideAutoPromotion(input: FactoryQcInput): AutoPromotionVerdict {
  if (input.qcOverall === "fail") {
    return { status: "rejected", reason: "QC engine failed the item." };
  }
  if (input.fidelity?.verdict === "mis_tagged") {
    return {
      status: "rejected",
      reason: `Standards fidelity: ${input.fidelity.reason}`,
    };
  }
  if (input.mcqLengthCheck && !input.mcqLengthCheck.ok) {
    return {
      status: "rejected",
      reason: `MCQ gameability: ${input.mcqLengthCheck.reason}`,
    };
  }
  if (input.qcOverall === "warn" || input.fidelity?.verdict === "partial") {
    const hints: string[] = [];
    if (input.qcOverall === "warn") hints.push("QC flagged a warning");
    if (input.fidelity?.verdict === "partial")
      hints.push("standards fidelity is partial");
    return {
      status: "needs_review",
      reason: hints.join(" + "),
    };
  }
  if (input.qcOverall === "pass") {
    return {
      status: "ready",
      reason: "All checks pass; auto-promoted to library.",
    };
  }
  return { status: "needs_review", reason: "Defensive default." };
}
