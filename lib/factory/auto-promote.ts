/**
 * Confidence-based auto-promotion. Decides where each batched asset
 * lands: ready (visible to teachers), needs_review (human queue), or
 * rejected (shadow row for prompt-tuning).
 *
 * Filip's call Apr 30 2026: Jen will NOT actively triage the
 * needs_review queue. AI QC is the gate. So the default mode is
 * "aggressive" — ship anything where every HARD check passed, even
 * when SOFT checks (reading-level drift, length warns, etc) come
 * back with severity=warn. Only the gameability + safety checks
 * (banlist, judge content concern, mis-tagged standard, MCQ length
 * cheat) block promotion.
 *
 * The cautious mode still exists for new asset prompts under
 * active iteration — flip via the `mode` parameter.
 */

import type { GameabilityCheck } from "@/lib/factory/mcq-balance";
import type { FidelityResult } from "@/lib/factory/standards-fidelity";

/**
 * QC checks that BLOCK promotion when they fail OR warn. These are
 * the safety / gameability layers; soft "this is harder reading than
 * the target grade" warns ship through.
 */
const HARD_CHECK_PREFIXES = [
  "passage.banned_words",
  "passage.judge", // judge said the passage itself has a content concern
  "image.judge", // image judge flagged not-kid-safe / has text / off-prompt
  "q.correct_present", // correct answer literally not in choices
  "q.judge", // per-question judge flagged a content / answer-fidelity concern
];

function isHardCheck(name: string): boolean {
  return HARD_CHECK_PREFIXES.some((p) => name.startsWith(p));
}

export type FactoryQcInput = {
  qcOverall: "pass" | "warn" | "fail";
  qcReport?: {
    checks?: { name: string; severity: "pass" | "warn" | "fail"; message?: string }[];
  };
  fidelity?: FidelityResult | null;
  mcqLengthCheck?: GameabilityCheck | null;
};

export type AutoPromotionVerdict = {
  status: "ready" | "needs_review" | "rejected";
  reason: string;
};

export type AutoPromotionMode = "aggressive" | "cautious";

/**
 * Decide where the item lands.
 *
 * Aggressive mode (default — Filip's "Jen won't review" model):
 *  - Any HARD check at warn or fail → REJECT
 *  - Fidelity mis_tagged → REJECT
 *  - MCQ length cheat → REJECT
 *  - Anything else (including SOFT warns like FK reading-level) → READY
 *
 * Cautious mode (for new prompts under iteration):
 *  - Any QC fail OR fidelity mis_tagged OR length cheat → REJECT
 *  - QC warn (any check) OR fidelity partial → NEEDS_REVIEW
 *  - All-pass → READY
 */
export function decideAutoPromotion(
  input: FactoryQcInput,
  mode: AutoPromotionMode = "aggressive",
): AutoPromotionVerdict {
  // Universal rejections first.
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

  if (mode === "aggressive") {
    // Find any HARD check that warned or failed. If yes → reject.
    const checks = input.qcReport?.checks ?? [];
    const hardHit = checks.find(
      (c) => isHardCheck(c.name) && (c.severity === "warn" || c.severity === "fail"),
    );
    if (hardHit) {
      return {
        status: "rejected",
        reason: `Hard QC check ${hardHit.name} (${hardHit.severity}): ${hardHit.message ?? ""}`.trim(),
      };
    }
    // Check the overall verdict for a fail (in case the report was
    // missing or the overall fail came from a check we don't know about).
    if (input.qcOverall === "fail") {
      return { status: "rejected", reason: "QC overall = fail." };
    }
    return {
      status: "ready",
      reason:
        input.qcOverall === "warn"
          ? "Soft warns only (e.g. reading-level drift); auto-shipped."
          : "All checks pass; auto-shipped.",
    };
  }

  // Cautious mode (legacy, used during prompt iteration).
  if (input.qcOverall === "fail") {
    return { status: "rejected", reason: "QC engine failed the item." };
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
    return { status: "ready", reason: "All checks pass; auto-promoted." };
  }
  return { status: "needs_review", reason: "Defensive default." };
}
