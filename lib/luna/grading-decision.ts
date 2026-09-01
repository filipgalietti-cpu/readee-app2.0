/**
 * Luna's per-line tutoring decision — now a thin adapter over Orion's reading
 * GRADE stage (lib/orion/reading/grade). The engine produces a domain-general
 * Diagnosis; LunaReader still consumes the compact { subWords, hasError, heavy }
 * shape it always has, so nothing in the reader changes.
 */

import { diagnoseLine, skipThreshold } from "@/lib/orion/reading/grade";

export type WordAnnotation = { word: string; status: string };
export { skipThreshold };

export type LineDecision = {
  /** Words we're confident were misread — the ONLY words safe to sound-out. */
  subWords: string[];
  /** True when the child should re-read (a real error, not recognizer noise). */
  hasError: boolean;
  /**
   * True → Luna models the whole line and the child re-reads (heavy misread, or
   * a skip with no clear substitutions). False → sound-out mini-lesson on
   * `subWords`. Only meaningful when `hasError`.
   */
  heavy: boolean;
};

export function classifyLineRead(
  annotations: WordAnnotation[],
  wordsTotal: number,
): LineDecision {
  const d = diagnoseLine(annotations, wordsTotal);
  return { subWords: d.confident, hasError: !d.correct, heavy: d.severity === "major" };
}

/** Words-correct-per-minute for a connected read (0 when we have no duration). */
export function wcpm(wordsCorrect: number, durationSeconds: number): number {
  return durationSeconds > 0 ? wordsCorrect / (durationSeconds / 60) : 0;
}
