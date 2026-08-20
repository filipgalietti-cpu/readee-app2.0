/**
 * Reading-level estimate. Kid Story Studio writes at a read-aloud level (richer
 * than the author's decodable grade), so the community library grade must
 * reflect the STORY's actual difficulty, not the child's grade. Flesch-Kincaid
 * is a standard, deterministic (no-AI) readability formula.
 */

function countSyllables(raw: string): number {
  const word = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  const trimmed = word
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

/** Flesch-Kincaid Grade Level for a block of text. */
export function fleschKincaidGrade(text: string): number {
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length || 1;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  return 0.39 * (wordCount / sentences) + 11.8 * (syllables / wordCount) - 15.59;
}

/** Map the readability score to a K-4 grade token (capped, since Readee is K-4). */
export function readingGradeToken(text: string): string {
  const g = fleschKincaidGrade(text);
  if (g < 1) return "K";
  if (g < 2) return "1st";
  if (g < 3) return "2nd";
  if (g < 4) return "3rd";
  return "4th";
}
