import { getActiveMultiplier } from "./active-multiplier";

/**
 * Apply the flat, session-wide mystery-box powerup (e.g. the 2x) to a session's
 * carrot TOTAL — once, at the post-quiz summary, instead of per question.
 *
 * Per-question streak multipliers (daily + session-streak) vary per question and
 * are already baked into `base`. The mystery-box powerup is flat over the whole
 * session, so it belongs on the total. Routing every surface's completion through
 * this one helper means a new surface can't silently forget the boost (which is
 * exactly how /learn missed it when the boost was scattered per-question).
 */
export type FinalizedCarrots = {
  /** Carrots before the flat powerup (streak-multiplied base). */
  base: number;
  /** Carrots actually awarded (base × boost). */
  final: number;
  /** The powerup multiplier applied (>= 1). */
  boost: number;
  /** True when a powerup was actually active (boost > 1). */
  boosted: boolean;
};

export function finalizeSessionCarrots(
  base: number,
  child: Parameters<typeof getActiveMultiplier>[0],
): FinalizedCarrots {
  const boost = getActiveMultiplier(child);
  const final = Math.floor(base * boost);
  return { base, final, boost, boosted: boost > 1 };
}
