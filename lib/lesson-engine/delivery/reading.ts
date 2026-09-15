import { gradeRead, type ReadGrade } from "@/lib/placement/read-grade";
/** Stop capture once scored speech reaches the final reference word, even if
 * earlier words were missed. This is an endpoint signal, never a passing grade.
 * Trailing Azure omissions are trimmed by gradePracticeRead before this check. */
export function hasReadEndpoint(result: ReadGrade) {
  const last = result.annotations.at(-1);
  return result.wordsAttempted === result.annotations.length &&
    !!last && (last.status === "correct" || last.status === "substituted");
}
/** Practice participation requires every reference word to have speech evidence.
 * It is deliberately separate from pronunciation accuracy or assessment mastery. */
export function hasReadCoverage(result: ReadGrade) {
  return (
    result.annotations.length > 0 &&
    result.wordsAttempted === result.annotations.length &&
    result.annotations.every((w) => w.status === "correct" || w.status === "substituted")
  );
}

/** Continuous recognition may pad each phrase with reference omissions. At a
 * pause those trailing words are still unread, not an instruction to consume
 * the remainder of the reference. Internal omissions remain errors. */
export function gradePracticeRead(reference: string, phrases: Parameters<typeof gradeRead>[1]) {
  const target = reference.split(/\s+/).filter(Boolean).map(normalizeWord);
  let cursor = 0;
  const ordered = phrases.map((phrase) => {
    const spoken = phrase.filter((w) => w.errorType !== "Insertion");
    const start = spoken.findIndex((w) => w.errorType !== "Omission");
    if (start < 0) return [];
    let end = spoken.length;
    while (end > start && spoken[end - 1].errorType === "Omission") end--;
    const words = spoken.slice(start, end);
    return words.filter((word, index) => {
      const value = normalizeWord(word.word);
      let next = -1;
      for (let j = cursor; j < Math.min(target.length, cursor + 4); j++) {
        if (target[j] === value) { next = j; break; }
      }
      // A spurious phrase prefix must not skip a word that this SAME phrase
      // subsequently scores. For "and hop and skip", keep "hop and skip".
      // Never reorder words, fill a missing word, or replace Azure accuracy.
      if (next > cursor && word.errorType !== "Omission" &&
          words.slice(index + 1).some(w => w.errorType !== "Omission" && normalizeWord(w.word) === target[cursor])) {
        return false;
      }
      if (next >= 0) cursor = next + 1;
      return true;
    });
  });
  return gradeRead(reference, ordered);
}
const normalizeWord = (word: string) => word.toLowerCase().replace(/[^a-z0-9']/g, "");
/** Interim text is only a provisional visual cue / endpoint signal. It never
 * supplies a pronunciation score or marks an answer correct. */
export function provisionalReadWords(reference: string, partial: string, confirmed: ReadGrade) {
  const norm = (word: string) => word.toLowerCase().replace(/[^a-z0-9']/g, "");
  const target = reference.split(/\s+/).filter(Boolean).map(norm);
  const heard = partial.split(/\s+/).filter(Boolean).map(norm);
  let cursor = confirmed.wordsAttempted;
  const indices: number[] = [];
  for (const word of heard) {
    if (word !== target[cursor]) continue;
    indices.push(cursor++);
  }
  return indices;
}
