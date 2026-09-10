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
export type WordAnnotation = { word: string; status: WordStatus; accuracy: number | null; endSeconds?: number };

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
    for (let wi = 0; wi < phrase.length; wi++) {
      const w = phrase[wi];
      if (w.errorType === "Insertion") continue;
      const target = norm(w.word);
      let idx = -1;
      for (let j = cursor; j < Math.min(ref.length, cursor + 4); j++) {
        if (refNorm[j] === target) { idx = j; break; }
      }
      if (idx === -1) {
        // A dropped or skipped phrase must not freeze alignment for the rest
        // of the story. Re-anchor only on three consecutive matching words;
        // the gap remains omissions, never invented correct responses.
        const anchor = phrase.slice(wi).filter(word => word.errorType !== "Insertion").slice(0, 3).map(word => norm(word.word));
        if (anchor.length === 3) {
          for (let j = cursor + 4; j <= ref.length - 3; j++) {
            if (anchor.every((word, k) => word === refNorm[j + k])) { idx = j; break; }
          }
        }
      }
      if (idx === -1) continue; // unaligned speech never becomes scored text
      for (let j = cursor; j < idx; j++) if (annotations[j].status === "unread") annotations[j] = { ...annotations[j], status: "omitted" };
      annotations[idx] = {
        word: ref[idx],
        status: w.errorType === "Omission" ? "omitted" : isWordCorrect(w) ? "correct" : "substituted",
        accuracy: w.errorType === "Omission" ? null : w.accuracy,
        endSeconds: Number.isFinite(w.offsetSeconds) && Number.isFinite(w.durationSeconds) && w.offsetSeconds! >= 0 && w.durationSeconds! >= 0
          ? w.offsetSeconds! + w.durationSeconds! : undefined,
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

/** Score finalized words by when they were spoken. Call after recognition drains,
 * so a phrase arriving after the cutoff still contributes its pre-cutoff words. */
export function passageRate(grade: ReadGrade, elapsed: number, finished: boolean): { wordsCorrect: number; seconds: number } {
  const spoken = grade.annotations.filter((a) => a.status === "correct" || a.status === "substituted");
  if (!spoken.length || spoken.some((a) => a.endSeconds === undefined)) throw new Error("Reading timing was not captured. Please try this story again.");
  const end = Math.max(...spoken.map((a) => a.endSeconds!));
  const seconds = Math.max(1, Math.min(60, finished ? end : elapsed));
  return { seconds, wordsCorrect: spoken.filter((a) => a.status === "correct" && a.endSeconds! <= seconds).length };
}

/** Single-word verdict for the word lists: the reference word must be read with no error. */
export function gradeWord(word: string, phrases: PAWord[][]): { heard: boolean; correct: boolean; accuracy: number | null } {
  const target = norm(word);
  let best: PAWord | null = null;
  for (const phrase of phrases) {
    for (const w of phrase) {
      if (w.errorType === "Insertion" || w.errorType === "Omission") continue;
      if (norm(w.word) === target && (!best || w.accuracy > best.accuracy)) best = w;
    }
  }
  if (!best) return { heard: false, correct: false, accuracy: null };
  if (best.errorType === "Omission") return { heard: false, correct: false, accuracy: null };
  return { heard: true, correct: isWordCorrect(best), accuracy: best.accuracy };
}

/** Interim recognition moves the page only. It never enters scored evidence.
 * Require a multiword suffix so an isolated common word cannot jump pages. */
export function previewReadingReached(reference: string, partial: string, finalized: number): number {
  const ref = reference.split(/\s+/).filter(Boolean).map(norm);
  const words = partial.split(/\s+/).filter(Boolean).map(norm);
  if (words.length < 3) return finalized;
  const suffix = words.slice(-Math.min(4, words.length));
  const start = Math.max(0, finalized - words.length - 4);
  const end = Math.min(ref.length, finalized + words.length + 12);
  for (let i = start; i <= end - suffix.length; i++) {
    if (suffix.every((word, k) => word === ref[i + k]))
      return Math.max(finalized, i + suffix.length);
  }
  return finalized;
}
