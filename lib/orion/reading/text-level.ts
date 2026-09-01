/**
 * ORION — reading PLUGIN: text-level guard (the confidence circuit-breaker).
 *
 * The most canonical numbers in reading instruction (Clay running records /
 * Fountas & Pinnell): a child reading a text at
 *   95-100% word accuracy = INDEPENDENT level (build fluency, read solo)
 *   90-94%              = INSTRUCTIONAL level (the teaching zone)
 *   below 90%           = FRUSTRATION level (too hard — a tutor steps DOWN)
 *
 * Frustration-level text is where the Matthew-effect spiral starts (failure →
 * avoidance → less practice → more failure), so the guard errs toward easier:
 * confidence is built on engineered success (Bandura: mastery experiences are
 * the strongest source of self-efficacy), not on grinding a too-hard text.
 */

export type ReadingLevel = "independent" | "instructional" | "frustration";

export const INDEPENDENT_MIN = 0.95;
export const INSTRUCTIONAL_MIN = 0.9;

/** A read must be a real attempt before it counts toward leveling. */
export const MIN_QUALIFYING_WORDS = 15;
/** Never re-level off a single bad (or great) day. */
export const MIN_READS_TO_ACT = 2;

/** In-session rescue: after this many lines finished with real errors, Luna
 *  switches to echo mode (model each line first) — the standard assisted-
 *  reading scaffold — instead of grinding the child through more failure. */
export const GENTLE_AFTER_FAILED_LINES = 2;

export function classifyAccuracy(accuracy: number): ReadingLevel {
  if (accuracy >= INDEPENDENT_MIN) return "independent";
  if (accuracy >= INSTRUCTIONAL_MIN) return "instructional";
  return "frustration";
}

export type RecentRead = { wordsCorrect: number; wordsTotal: number };

/**
 * From the child's recent reads (newest first), decide whether the served text
 * level should step down a grade. Pools accuracy across qualifying reads (a
 * single line-noise session can't flip it), and stays put when there isn't
 * enough evidence yet.
 */
export function recommendTextLevel(reads: RecentRead[]): {
  level: ReadingLevel | null;
  stepDown: boolean;
} {
  const qualifying = reads.filter((r) => (r.wordsTotal ?? 0) >= MIN_QUALIFYING_WORDS).slice(0, 3);
  if (qualifying.length < MIN_READS_TO_ACT) return { level: null, stepDown: false };
  const total = qualifying.reduce((n, r) => n + r.wordsTotal, 0);
  const correct = qualifying.reduce((n, r) => n + Math.min(r.wordsCorrect, r.wordsTotal), 0);
  const level = classifyAccuracy(total > 0 ? correct / total : 0);
  return { level, stepDown: level === "frustration" };
}
