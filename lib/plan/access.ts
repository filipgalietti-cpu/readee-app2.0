/**
 * Reverse-trial access model. A new reader gets full Readee+ access for the
 * first TRIAL_DAYS days (no card), then drops to the limited free tier. This is
 * the single source of truth that folds "in trial" into an effective plan, so
 * every existing `plan === "premium"` gate inherits trial access unchanged.
 *
 * - Entitlement gates read the EFFECTIVE plan (trial resolves to "premium").
 * - Billing / conversion surfaces read the RAW plan (a trial user is NOT paying,
 *   so they must still see the subscribe CTA).
 */
import { isPaidPlan } from "./limits";

export const TRIAL_DAYS = 7;

export type AccessTier = "paid" | "trial" | "free" | "lapsed";

export interface Access {
  tier: AccessTier;
  /** paid OR in-trial → everything unlocked. */
  hasFullAccess: boolean;
  /** >0 only while tier === "trial". */
  trialDaysLeft: number;
}

function daysSince(signupAt: string | null | undefined): number {
  if (!signupAt) return 0;
  const ms = Date.parse(signupAt);
  if (Number.isNaN(ms)) return 0;
  return Math.max(0, Math.floor((Date.now() - ms) / 86_400_000));
}

/** Full access resolution from raw plan + signup date + prior-subscriber flag. */
export function resolveAccess(opts: {
  plan: string | null | undefined;
  signupAt: string | null | undefined;
  everSubscribed?: boolean;
}): Access {
  if (isPaidPlan(opts.plan)) {
    return { tier: "paid", hasFullAccess: true, trialDaysLeft: 0 };
  }
  const trialDaysLeft = Math.max(0, TRIAL_DAYS - daysSince(opts.signupAt));
  if (trialDaysLeft > 0) {
    return { tier: "trial", hasFullAccess: true, trialDaysLeft };
  }
  // Trial over, not paying: lapsed (had it, let it end) vs never-paid free.
  return { tier: opts.everSubscribed ? "lapsed" : "free", hasFullAccess: false, trialDaysLeft: 0 };
}

/**
 * Effective plan for entitlement gates: within the trial window a free user
 * resolves to "premium" so every existing plan check unlocks. Paid plans pass
 * through untouched; expired-trial free stays "free".
 */
export function effectivePlan(plan: string | null | undefined, signupAt: string | null | undefined): string {
  if (isPaidPlan(plan)) return plan as string;
  return TRIAL_DAYS - daysSince(signupAt) > 0 ? "premium" : (plan ?? "free");
}
