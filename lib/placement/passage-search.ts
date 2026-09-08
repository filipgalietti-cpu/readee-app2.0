import type { CountEvidence, PassageEvidence } from "./decide";
import type { Band } from "./ladder";

export type ComprehensionCheck = CountEvidence & { band: Band };

/** Keep the existing accuracy/comprehension thresholds, but establish the
 * next level with another passage instead of assuming a one-grade drop fits. */
export function passageIsComfortable(p: PassageEvidence, c: ComprehensionCheck): boolean {
  return p.wordsTotal > 0 && p.wordsCorrect / p.wordsTotal >= 0.9 &&
    c.band === p.band && c.total >= 3 && c.correct / c.total > 0.5;
}

export function nextPassageBand(p: PassageEvidence, c: ComprehensionCheck): Band | null {
  return passageIsComfortable(p, c) ? null : Math.max(0, p.band - 1) as Band;
}
