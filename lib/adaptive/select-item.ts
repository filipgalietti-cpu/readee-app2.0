/**
 * Adaptive engine — item selection (connects DECIDE → the question bank).
 *
 * Pure, additive, dependency-free. Given the controller's reading (Phase 1)
 * and where the child is working right now, it picks the NEXT question at the
 * right difficulty — easing down when they struggle, ramping up hard when
 * they breeze. This is the piece that turns "the engine decided to hit the
 * brakes" into "serve this specific easier question."
 *
 * It reads a `difficulty` number (0-100) off each item — which we already
 * estimate in scripts/difficulty-map.json and which real usage refines later.
 * It does NOT touch the existing question schema; any object with {id,
 * difficulty} works, so this drops in alongside the current bank as-is.
 *
 * The difficulty STEP per state encodes Filip's model as target success rates:
 *   frustrated → aim ~90% success → drop difficulty a lot (quick easy Ws)
 *   struggling → aim ~80%        → drop a bit
 *   flow       → aim ~75%        → hold (the just-right zone)
 *   breezing   → aim ~55%        → raise a LOT (desirable difficulty = real
 *                                   learning; if it's easy, nothing is learned)
 */

import type { AdaptiveReading } from "./controller";

export interface AdaptiveItem {
  id: string;
  difficulty: number; // 0 (easiest) .. 100 (hardest)
}

/** How far to move difficulty from where the child is now, by state. */
const STEP: Record<AdaptiveReading["state"], number> = {
  frustrated: -28,
  struggling: -12,
  flow: 0,
  breezing: 26,
};

/** The difficulty we should aim the next item at. */
export function targetDifficulty(reading: AdaptiveReading, current: number): number {
  return Math.max(0, Math.min(100, current + STEP[reading.state]));
}

export interface SelectResult<T> {
  item: T | null;
  target: number;
  /** the difficulty the child is now working at (feed back as `current`). */
  workingDifficulty: number;
}

/**
 * Pick the next item from a pool (typically the current standard's items,
 * but may span standards/grades when the child needs to go well below or
 * above grade level). Chooses the unseen item closest to the target
 * difficulty; falls back to allowing repeats only if everything's been seen.
 */
export function selectNextItem<T extends AdaptiveItem>(
  reading: AdaptiveReading,
  pool: T[],
  opts: { current: number; seen?: ReadonlySet<string> },
): SelectResult<T> {
  const target = targetDifficulty(reading, opts.current);
  if (pool.length === 0) return { item: null, target, workingDifficulty: opts.current };

  const seen = opts.seen ?? new Set<string>();
  const unseen = pool.filter((i) => !seen.has(i.id));
  const from = unseen.length ? unseen : pool;

  let best = from[0];
  let bestDist = Math.abs(best.difficulty - target);
  for (const i of from) {
    const d = Math.abs(i.difficulty - target);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return { item: best, target, workingDifficulty: best.difficulty };
}
