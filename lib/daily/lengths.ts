/**
 * Length rules for the two Daily Readee renditions.
 *
 * The page offers a "Short read" (K-1 easy rendition) and a "Full read"
 * (2nd grade, the base passage). The toggle only means something when the two
 * are clearly different lengths. Two things broke that:
 *
 * 1. The full read's floor is advisory. An article ships every day, so a full
 *    read that stays short after its retries ships short.
 * 2. The easy rendition used a fixed 55-85 word band. The moment the full read
 *    came in short, the bands overlapped: 2026-09-17 shipped 67 words against
 *    58, and switching changed almost nothing.
 *
 * So the full read gets several retries toward its floor, and the easy
 * rendition is sized against the base passage it actually got.
 */

/** 2nd grade "medium" tier is 100-150 words; below this the full read is short. */
export const FULL_MIN_WORDS = 100;
export const FULL_MAX_WORDS = 150;

/** Retries toward FULL_MIN_WORDS before a short full read ships anyway. */
export const FULL_LENGTH_RETRIES = 3;

/** Below this an easy rendition cannot carry the same story. */
export const EASY_ABSOLUTE_MIN_WORDS = 35;

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * Target and ceiling for the easy rendition, from the base passage's length.
 * About half the full read, never more than about two thirds of it, within
 * what a K-1 retelling can hold.
 */
export function easyRenditionLengths(baseWords: number): { target: number; ceiling: number } {
  const target = clamp(Math.round(baseWords * 0.5), 40, 60);
  const ceiling = clamp(Math.round(baseWords * 0.65), 45, 70);
  return { target, ceiling };
}

/** True when an easy rendition of `easyWords` is acceptable next to `baseWords`. */
export function easyLengthOk(easyWords: number, baseWords: number): boolean {
  const { ceiling } = easyRenditionLengths(baseWords);
  return easyWords >= EASY_ABSOLUTE_MIN_WORDS && easyWords <= ceiling;
}
