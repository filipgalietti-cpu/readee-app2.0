// Phonics vowel notation — the dictionary / Science-of-Reading standard.
//
//   LONG vowel  → MACRON (ā ē ī ō ū) : the vowel "says its name"
//   SHORT vowel → BREVE  (ă ĕ ĭ ŏ ŭ) : the short sound
//
// Use these helpers ANY time a lesson marks vowel length so notation is
// consistent across every phonics lesson (silent-E, vowel teams, etc.).

const LONG: Record<string, string> = {
  a: "ā", e: "ē", i: "ī", o: "ō", u: "ū",
  A: "Ā", E: "Ē", I: "Ī", O: "Ō", U: "Ū",
};

const SHORT: Record<string, string> = {
  a: "ă", e: "ĕ", i: "ĭ", o: "ŏ", u: "ŭ",
  A: "Ă", E: "Ĕ", I: "Ĭ", O: "Ŏ", U: "Ŭ",
};

/** The long-vowel (macron) form of a vowel, e.g. "a" → "ā". Non-vowels pass through. */
export function longVowel(ch: string): string {
  return LONG[ch] ?? ch;
}

/** The short-vowel (breve) form of a vowel, e.g. "a" → "ă". Non-vowels pass through. */
export function shortVowel(ch: string): string {
  return SHORT[ch] ?? ch;
}

export function isVowel(ch: string): boolean {
  return /^[aeiou]$/i.test(ch);
}
