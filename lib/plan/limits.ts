/** Centralized free vs Readee+ limits */

export const FREE_LIMITS = {
  /** Number of lessons available on free plan (per grade) */
  lessons: 1,
  /** Number of stories per grade on free plan */
  storiesPerGrade: 2,
  /** Number of child profiles on free plan */
  children: 1,
  /** Practice questions per standard on free plan */
  practicePerStandard: 10,
  /** Placement test — available on free */
  placementTest: true,
  /** Analytics page — Readee+ only */
  analytics: false,
} as const;

export const PREMIUM_LIMITS = {
  lessons: Infinity,
  storiesPerGrade: Infinity,
  children: 5,
  practicePerStandard: Infinity,
  placementTest: true,
  analytics: true,
} as const;

export function getLimits(plan: string | null) {
  return plan === "premium" ? PREMIUM_LIMITS : FREE_LIMITS;
}

/**
 * Check if a lesson index (0-based) is available on the free plan.
 * Free users get the first N lessons per grade.
 */
export function isLessonFree(lessonIndex: number): boolean {
  return lessonIndex < FREE_LIMITS.lessons;
}
