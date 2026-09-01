/**
 * ORION TUTORING ENGINE — Success-Band Controller (the difficulty thermostat).
 *
 * Domain-general. Keeps a learner near the ~80-85% success sweet spot where
 * learning is fastest — the point where the ZPD (Vygotsky), desirable
 * difficulties (Bjork), the flow channel (Csikszentmihalyi), Rosenshine's ~80%
 * (master-teacher research: best teachers ran 82% correct vs 73% for the worst),
 * and Wilson et al.'s "85% Rule" (Nature Comms 2019) all converge. Below the
 * band → frustration/anxiety and, worse, error-learning ("once errors are
 * learned they are very difficult to overcome" — Rosenshine). Above it →
 * boredom, no learning.
 *
 * This module knows nothing about reading. Reading tunes passage difficulty,
 * math tunes problem difficulty; the thermostat only sees success rates. It
 * consumes the learner model (child_skill_memory) but does not depend on it.
 */

export const TARGET_SUCCESS = 0.82; // aim here (the flow sweet spot)
export const ADVANCE_ABOVE = 0.9; // consistently this easy → harden / advance
export const EASE_BELOW = 0.75; // struggling below this → scaffold / ease

/** Minimum attempts before we trust a rate enough to change difficulty. */
export const MIN_RECENT = 4;
export const MIN_LIFETIME = 3;
/** Sustained-high-success attempts before a skill is considered mastered. */
export const MASTERY_MIN_ATTEMPTS = 6;

export type BandAction = "advance" | "hold" | "ease";

export type SkillPerformance = {
  /** Recent attempt outcomes for ONE skill, most-recent last (true = correct).
   *  Recency wins over lifetime — this is what the thermostat prefers. */
  recent?: boolean[];
  /** Lifetime fallbacks from the learner model when the window is too thin. */
  totalCorrect?: number;
  totalAttempted?: number;
};

export type BandVerdict = {
  /** The success-rate estimate the decision was made on (0..1). */
  successRate: number;
  /** How many attempts backed the estimate. */
  sample: number;
  /** What the content scheduler should do next for this skill. */
  action: BandAction;
  /** True when there was enough evidence to move; otherwise we hold. */
  confident: boolean;
  /** True when the skill has been sustained-high long enough to graduate. */
  mastered: boolean;
};

const mean = (xs: boolean[]) =>
  xs.length ? xs.reduce((n, x) => n + (x ? 1 : 0), 0) / xs.length : 0;

/**
 * Decide whether to advance, hold, or ease a skill from its recent performance.
 * Prefers the recent window; falls back to lifetime totals; holds (no change)
 * when the evidence is too thin to act.
 */
export function evaluateBand(perf: SkillPerformance): BandVerdict {
  const recent = perf.recent ?? [];
  const hasRecent = recent.length >= MIN_RECENT;
  const lifetimeN = perf.totalAttempted ?? 0;
  const hasLifetime = lifetimeN >= MIN_LIFETIME;

  let successRate: number;
  let sample: number;
  if (hasRecent) {
    successRate = mean(recent);
    sample = recent.length;
  } else if (hasLifetime) {
    successRate = (perf.totalCorrect ?? 0) / lifetimeN;
    sample = lifetimeN;
  } else {
    // Not enough signal yet — stay put and gather more (don't yo-yo difficulty).
    return { successRate: perf.totalAttempted ? (perf.totalCorrect ?? 0) / lifetimeN : 0, sample: recent.length || lifetimeN, action: "hold", confident: false, mastered: false };
  }

  const action: BandAction =
    successRate >= ADVANCE_ABOVE ? "advance" : successRate < EASE_BELOW ? "ease" : "hold";
  const mastered = successRate >= ADVANCE_ABOVE && sample >= MASTERY_MIN_ATTEMPTS;

  return { successRate, sample, action, confident: true, mastered };
}

/**
 * Turn a verdict into a difficulty level for the next task, clamped to a range.
 * `advance` steps up, `ease` steps down, `hold` stays. Domain-general: `level`
 * is whatever the domain's content pool is ordered by (phonics-pattern rank for
 * reading, problem tier for math).
 */
export function nextDifficulty(
  current: number,
  action: BandAction,
  { min = 0, max = Number.MAX_SAFE_INTEGER, step = 1 }: { min?: number; max?: number; step?: number } = {},
): number {
  const delta = action === "advance" ? step : action === "ease" ? -step : 0;
  return Math.max(min, Math.min(max, current + delta));
}
