/**
 * READ GRADER - turns Azure Pronunciation Assessment's per-word stream into
 * the numbers the placement needs, the way DIBELS scores a one-minute read:
 * words attempted up to the last word the child reached, each one correct or
 * not, omissions count as errors, insertions are ignored.
 *
 * Mirrors LunaReader's rule (the per-word score is the truth; the transcript
 * is reference-biased and must not clear an error). Pure, so it is testable
 * and the calibration harness can tune WORD_ACCURACY_MIN without a browser.
 */
import type { PAWord } from "@/app/(protected)/luna/_components/azure-stream";

/** A reference word read with this accuracy or better, with no error type, counts as correct.
 *  Same floor the lesson engine's Speak interaction uses; the calibration harness may move it. */
export const WORD_ACCURACY_MIN = 55;

export type WordStatus = "correct" | "substituted" | "omitted" | "unread";
export type WordAnnotation = { word: string; status: WordStatus; accuracy: number | null };

export type ReadGrade = {
  annotations: WordAnnotation[];
  /** Reference words the child reached (last recognized reference word + 1). */
  wordsAttempted: number;
  wordsCorrect: number;
  /** The words the child got wrong or skipped, in reading order (for moments). */
  missed: string[];
};

const norm = (w: string): string => w.toLowerCase().replace(/[^a-z0-9']/g, "");

export function isWordCorrect(w: PAWord): boolean {
  return w.errorType === "None" && w.accuracy >= WORD_ACCURACY_MIN;
}

/**
 * Align the stream's words to the reference text. Azure returns reference
 * words in order (omissions included as errorType "Omission"); insertions are
 * extra words the child said and are skipped. We walk both lists in order,
 * matching on normalized text, tolerating a stream word that is not the next
 * reference word by scanning ahead a few words (a recognizer hiccup) before
 * giving up on it.
 */
export function gradeRead(reference: string, phrases: PAWord[][]): ReadGrade {
  const ref = reference.split(/\s+/).filter(Boolean);
  const refNorm = ref.map(norm);
  const annotations: WordAnnotation[] = ref.map((word) => ({ word, status: "unread", accuracy: null }));
  let cursor = 0;
  for (const phrase of phrases) {
    for (const w of phrase) {
      if (w.errorType === "Insertion") continue;
      const target = norm(w.word);
      let idx = -1;
      for (let j = cursor; j < Math.min(ref.length, cursor + 4); j++) {
        if (refNorm[j] === target) { idx = j; break; }
      }
      if (idx === -1) continue; // could not place it; do not advance
      for (let j = cursor; j < idx; j++) if (annotations[j].status === "unread") annotations[j] = { ...annotations[j], status: "omitted" };
      annotations[idx] = {
        word: ref[idx],
        status: w.errorType === "Omission" ? "omitted" : isWordCorrect(w) ? "correct" : "substituted",
        accuracy: w.errorType === "Omission" ? null : w.accuracy,
      };
      cursor = idx + 1;
    }
  }
  const wordsAttempted = cursor;
  const attempted = annotations.slice(0, wordsAttempted);
  const wordsCorrect = attempted.filter((a) => a.status === "correct").length;
  const missed = attempted.filter((a) => a.status !== "correct").map((a) => a.word);
  return { annotations, wordsAttempted, wordsCorrect, missed };
}

/** Single-word verdict for the word lists: the reference word must be read with no error. */
export function gradeWord(word: string, phrases: PAWord[][]): { heard: boolean; correct: boolean; accuracy: number | null } {
  const target = norm(word);
  let best: PAWord | null = null;
  for (const phrase of phrases) {
    for (const w of phrase) {
      if (w.errorType === "Insertion") continue;
      if (norm(w.word) === target && (!best || w.accuracy > best.accuracy)) best = w;
    }
  }
  if (!best) return { heard: false, correct: false, accuracy: null };
  if (best.errorType === "Omission") return { heard: false, correct: false, accuracy: null };
  return { heard: true, correct: isWordCorrect(best), accuracy: best.accuracy };
}
