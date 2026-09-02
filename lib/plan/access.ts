/**
 * Access model. The ONLY free trial is Stripe's 14-day card trial started at
 * checkout (app/api/checkout/route.ts). The no-card "reverse trial" that gave
 * every new account TRIAL_DAYS of full access was retired on Sep 2 2026 (Filip:
 * one trial, card required); TRIAL_DAYS is 0 so the machinery below resolves
 * every non-paying account to the free tier. Kept rather than deleted so the
 * effective-plan seam stays in one place if a reverse trial ever returns.
 *
 * - Entitlement gates read the EFFECTIVE plan.
 * - Billing / conversion surfaces read the RAW plan (a non-paying user must
 *   still see the subscribe CTA).
 */
import { isPaidPlan } from "./limits";

export const TRIAL_DAYS = 0;

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

/**
 * Full-access check straight off a profile row (plan + created_at +
 * had_subscription). Server gates that select those columns use this so a
 * trial reader passes a paid-only gate.
 */
export function hasFullAccessFromProfile(
  p: { plan?: string | null; created_at?: string | null; had_subscription?: boolean | null } | null | undefined,
): boolean {
  return resolveAccess({
    plan: p?.plan,
    signupAt: p?.created_at,
    everSubscribed: p?.had_subscription ?? false,
  }).hasFullAccess;
}
