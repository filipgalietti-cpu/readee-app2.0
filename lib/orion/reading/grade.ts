/**
 * ORION KERNEL — reading PLUGIN: the GRADE stage for a line read aloud.
 *
 * Turns a per-word ASR miscue result (Azure Pronunciation Assessment) into
 * Orion's domain-general Diagnosis. The pedagogy it encodes:
 *  - A tutor never re-teaches a word the child read correctly. Azure frequently
 *    reports an omission ("missed") for a word the child actually read, so a
 *    lone missed word is treated as a CLEAN read.
 *  - The only words we KNOW were misread are SUBSTITUTIONS (detected but scored
 *    wrong) → those are the `confident` errors, the only words safe to sound out.
 *  - A genuine skip/mumble shows up as MANY missed words → a `major` diagnosis
 *    (model the whole line; we can't pin it to specific words).
 */

import type { Diagnosis } from "@/lib/orion/grade";

export type WordAnnotation = { word: string; status: string };

const cleanWord = (w: string) => w.replace(/[^A-Za-z'-]/g, "");

/**
 * How many missed words stop reading like recognizer noise and start reading
 * like a real skip/mumble: at least 2, and at least 40% of the line. So a lone
 * undetected word (or 1-2 on a long line) is tolerated.
 */
export function skipThreshold(wordsTotal: number): number {
  return Math.max(2, Math.ceil(wordsTotal * 0.4));
}

export function diagnoseLine(annotations: WordAnnotation[], wordsTotal: number): Diagnosis {
  const confident = annotations
    .filter((a) => a.status === "substituted")
    .map((a) => cleanWord(a.word))
    .filter(Boolean);
  const uncertain = annotations
    .filter((a) => a.status === "missed")
    .map((a) => cleanWord(a.word))
    .filter(Boolean);

  const subCount = confident.length;
  const missCount = uncertain.length;
  const correct = subCount === 0 && missCount < skipThreshold(wordsTotal);
  // Heavy = many real misreads, OR a skip with no clear substitutions (nothing
  // safe to drill) → model the whole line rather than sound out specific words.
  const heavy = subCount >= 4 || (wordsTotal >= 6 && subCount / wordsTotal > 0.6) || subCount === 0;

  return { correct, severity: correct ? "clean" : heavy ? "major" : "minor", confident, uncertain };
}
