/** Centralized free vs Readee+ limits */

export const FREE_LIMITS = {
  /** Number of lessons available on free plan */
  lessons: 5,
  /** Number of stories per grade on free plan */
  storiesPerGrade: 2,
  /** Number of child profiles on free plan */
  children: 1,
  /** Practice questions — unlimited on free */
  practiceUnlimited: true,
  /** Placement test — available on free */
  placementTest: true,
  /** Analytics page — Readee+ only */
  analytics: false,
} as const;

export const PREMIUM_LIMITS = {
  lessons: Infinity,
  storiesPerGrade: Infinity,
  children: 5,
  practiceUnlimited: true,
  placementTest: true,
  analytics: true,
} as const;

export function getLimits(plan: string | null) {
  return plan === "premium" ? PREMIUM_LIMITS : FREE_LIMITS;
}
