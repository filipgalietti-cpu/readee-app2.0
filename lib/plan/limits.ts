/** Centralized plan tiers and what they unlock. */

export type PlanTier = "free" | "premium" | "teacher_solo";

export const FREE_LIMITS = {
  /** Number of lessons available on free plan (per grade) */
  lessons: 1,
  /** Number of stories per grade on free plan */
  storiesPerGrade: 2,
  /** Free taste of "Read with Luna" — completed reads before the upgrade wall. */
  lunaReadsFree: 3,
  /**
   * ‼️ The allowance that actually bites. `lunaReadsFree` counts COMPLETED
   * reads, and Luna's costs are incurred per sentence while a read is still in
   * progress, so a free reader who never finishes a session stayed at zero
   * forever and read unlimited sentences. As of 2026-09-07 no free account had
   * ever completed a read, so that gate had never once fired.
   *
   * This counts Azure streaming tokens minted for Luna instead - the thing that
   * costs money. A token lasts ~10 minutes, so 12 is roughly three generous
   * reads. Raise it to be more generous with the free taste; lower it to
   * convert harder.
   */
  lunaMintsFree: 12,
  /** Free taste of "Story with Luna" — personalized stories before upgrade. */
  personalizedStoriesFree: 3,
  /** Practice questions per standard on free plan */
  practicePerStandard: 10,
  /** Placement test — available on free */
  placementTest: true,
  /** Analytics page — Readee+ only */
  analytics: false,
  /** Teacher classroom creation — free teachers get none (upgrade to Teacher Solo) */
  maxClassrooms: 0,
  /** Students allowed across all teacher-owned classrooms */
  maxStudents: 0,
  /** Monthly Readee.ai credit pool for teacher-surface tools */
  teacherAiCreditsMonthly: 0,
  /** Monthly Readee.ai credit pool for parent-surface (Ask Readee) */
  parentAiCreditsMonthly: 0,
} as const;

export const PREMIUM_LIMITS = {
  lessons: Infinity,
  storiesPerGrade: Infinity,
  lunaReadsFree: Infinity,
  lunaMintsFree: Infinity,
  personalizedStoriesFree: Infinity,
  practicePerStandard: Infinity,
  placementTest: true,
  analytics: true,
  maxClassrooms: 0,
  maxStudents: 0,
  teacherAiCreditsMonthly: 0,
  /** Ask Readee for Readee+ parents */
  parentAiCreditsMonthly: 200,
} as const;

export const TEACHER_SOLO_LIMITS = {
  lessons: Infinity,
  storiesPerGrade: Infinity,
  lunaReadsFree: Infinity,
  lunaMintsFree: Infinity,
  personalizedStoriesFree: Infinity,
  practicePerStandard: Infinity,
  placementTest: true,
  analytics: true,
  /** Teacher Solo = up to 2 classrooms, 40 students */
  maxClassrooms: 2,
  maxStudents: 40,
  /** Full teacher AI cap, same as district-backed educators */
  teacherAiCreditsMonthly: 500,
  parentAiCreditsMonthly: 0,
} as const;

export function getLimits(plan: string | null) {
  if (plan === "premium") return PREMIUM_LIMITS;
  if (plan === "teacher_solo") return TEACHER_SOLO_LIMITS;
  return FREE_LIMITS;
}

export function isPaidPlan(plan: string | null | undefined): boolean {
  return plan === "premium" || plan === "teacher_solo";
}

