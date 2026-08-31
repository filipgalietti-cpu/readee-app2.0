/**
 * Luna's per-line tutoring decision, isolated from the reader UI so it can be
 * unit-tested with synthetic Azure grades (no mic / Speech SDK needed).
 *
 * Pedagogy this encodes (see LunaReader.sentenceFeedback):
 *  - A tutor never re-teaches a word the child read correctly. Azure frequently
 *    reports an omission ("missed") for a word the child actually read, so a
 *    lone missed word is treated as a CLEAN read.
 *  - The only words we KNOW were misread are SUBSTITUTIONS (detected but scored
 *    wrong). A genuine skip/mumble shows up as MANY missed words.
 *  - How we re-teach depends on how wrong: a few substitutions get a sound-out
 *    mini-lesson on those exact words; a heavy misread or an unclear skip gets
 *    Luna modeling the whole line (we don't drill words we can't confirm).
 */

export type WordAnnotation = { word: string; status: string };

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

const cleanWord = (w: string) => w.replace(/[^A-Za-z'-]/g, "");

/**
 * The number of missed words that stops reading like recognizer noise and
 * starts reading like a real skip/mumble: at least 2, and at least 40% of the
 * line. So a lone undetected word (or 1-2 on a long line) is tolerated.
 */
export function skipThreshold(wordsTotal: number): number {
  return Math.max(2, Math.ceil(wordsTotal * 0.4));
}

export function classifyLineRead(
  annotations: WordAnnotation[],
  wordsTotal: number,
): LineDecision {
  const subWords = annotations
    .filter((a) => a.status === "substituted")
    .map((a) => cleanWord(a.word))
    .filter(Boolean);
  const subCount = subWords.length;
  const missCount = annotations.filter((a) => a.status === "missed").length;

  const hasError = subCount > 0 || missCount >= skipThreshold(wordsTotal);
  // Heavy = many real misreads, OR no clear substitutions at all (a skip we
  // can't pin to specific words) → model the line rather than drill words.
  const heavy =
    subCount >= 4 || (wordsTotal >= 6 && subCount / wordsTotal > 0.6) || subCount === 0;

  return { subWords, hasError, heavy };
}

/** Words-correct-per-minute for a connected read (0 when we have no duration). */
export function wcpm(wordsCorrect: number, durationSeconds: number): number {
  return durationSeconds > 0 ? wordsCorrect / (durationSeconds / 60) : 0;
}
