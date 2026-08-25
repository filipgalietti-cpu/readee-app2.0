/**
 * Rule-based grapheme → phoneme-clip decomposition for Luna's inline
 * mini-lesson. Maps a broken word ("sit") to the pre-recorded phoneme clip
 * ids (audio/phonemes/{id}.mp3): ["s", "short_i", "t"].
 *
 * CONSERVATIVE by design: it only handles the patterns our decodable
 * passages actually use (CVC, digraphs, silent-e, common vowel teams,
 * r-controlled). If any part of the word doesn't match confidently, it
 * returns null and the caller falls back to generic feedback — better no
 * mini-lesson than sounding a word out WRONG to a five-year-old.
 */

const SHORT: Record<string, string> = {
  a: "short_a", e: "short_e", i: "short_i", o: "short_o", u: "short_u",
};
const LONG: Record<string, string> = {
  a: "long_a", e: "long_e", i: "long_i", o: "long_o", u: "long_u",
};
const VOWELS = new Set(["a", "e", "i", "o", "u"]);

// Multi-letter graphemes, longest-first. Values are phoneme clip ids.
const TEAMS: [string, string][] = [
  ["igh", "long_i"],
  ["tch", "ch"],
  ["ck", "k"],
  ["sh", "sh"],
  ["ch", "ch"],
  ["th", "th_unvoiced"],
  ["wh", "w"],
  ["ph", "f"],
  ["ee", "long_e"],
  ["ea", "long_e"],
  ["ai", "long_a"],
  ["ay", "long_a"],
  ["oa", "long_o"],
  ["ow", "ow"],
  ["oo", "oo_long"],
  ["oi", "oi"],
  ["oy", "oi"],
  ["aw", "aw"],
  ["au", "aw"],
  ["ar", "ar"],
  ["or", "or"],
  ["er", "er"],
  ["ir", "er"],
  ["ur", "er"],
  // double consonants → one sound
  ["bb", "b"], ["dd", "d"], ["ff", "f"], ["gg", "g"], ["ll", "l"],
  ["mm", "m"], ["nn", "n"], ["pp", "p"], ["rr", "r"], ["ss", "s"],
  ["tt", "t"], ["zz", "z"],
];

const SINGLE: Record<string, string> = {
  b: "b", d: "d", f: "f", g: "g", h: "h", j: "j", k: "k", l: "l",
  m: "m", n: "n", p: "p", r: "r", s: "s", t: "t", v: "v", w: "w",
  x: "x", y: "y", z: "z", q: "q",
};

/** A grapheme chunk aligned to its phoneme clip — powers the karaoke
 *  underline in the big word-lesson view ("sh" lights up while /sh/ plays). */
export type SoundSegment = { graph: string; id: string };

/** Irregular high-frequency words that CANNOT be sounded out — they're
 *  learned by sight. Blending them letter-by-letter teaches them WRONG
 *  ("the" is /ðə/, not /th/-/eh/; "was" is /wʌz/, not /w/-/a/-/s/), so the
 *  decomposer refuses them and Luna teaches them as whole words instead. */
const SIGHT_WORDS = new Set([
  "the", "a", "i", "to", "of", "was", "is", "his", "as", "has", "said",
  "you", "your", "they", "we", "she", "he", "me", "be", "are", "were",
  "do", "does", "done", "what", "who", "one", "once", "two", "some",
  "come", "comes", "there", "where", "here", "want", "wants", "from",
  "have", "give", "live", "love", "put", "pull", "push", "very", "any",
  "many", "again", "against", "could", "would", "should", "our", "out",
  "her", "their", "my", "by", "says", "goes", "gone", "eye", "own",
]);

export function isSightWord(raw: string): boolean {
  return SIGHT_WORDS.has((raw || "").toLowerCase().replace(/[^a-z]/g, ""));
}

/** Decompose a word into phoneme clip ids, or null if not confident. */
export function soundOut(raw: string): string[] | null {
  return soundOutSegments(raw)?.map((s) => s.id) ?? null;
}

/** Segment-aligned decomposition (grapheme + clip id per sound). */
export function soundOutSegments(raw: string): SoundSegment[] | null {
  const word = (raw || "").toLowerCase().replace(/[^a-z]/g, "");
  if (isSightWord(word)) return null; // irregular — must be taught by sight
  if (word.length < 2 || word.length > 8) return null;

  // Silent-e (CVCe): "bike" → b + long_i + k. Detect: ends in e, previous is a
  // single consonant, and there's exactly one earlier vowel.
  let letters = word;
  let magicE = false;
  if (
    letters.length >= 3 &&
    letters.endsWith("e") &&
    !VOWELS.has(letters[letters.length - 2]) &&
    letters[letters.length - 2] !== "r" && // "here"/"more" are r-controlled-ish
    [...letters.slice(0, -1)].filter((c) => VOWELS.has(c)).length === 1
  ) {
    magicE = true;
    letters = letters.slice(0, -1);
  }

  const out: SoundSegment[] = [];
  let i = 0;
  while (i < letters.length) {
    // Longest-match multi-letter grapheme first.
    const team = TEAMS.find(([g]) => letters.startsWith(g, i));
    if (team) {
      out.push({ graph: team[0], id: team[1] });
      i += team[0].length;
      continue;
    }
    const c = letters[i];
    if (VOWELS.has(c)) {
      out.push({ graph: c, id: magicE ? LONG[c] : SHORT[c] });
      i++;
      continue;
    }
    if (c === "c") {
      // c before e/i/y → soft; else hard.
      out.push({ graph: c, id: "eiy".includes(letters[i + 1] ?? "") ? "c_soft" : "c_hard" });
      i++;
      continue;
    }
    // Word-final y is a vowel sound ("city", "my") our y clip ("yuh") would
    // get wrong — bail rather than teach it wrong.
    if (c === "y" && i === letters.length - 1) return null;
    const single = SINGLE[c];
    if (!single) return null; // unmappable — bail rather than guess
    out.push({ graph: c, id: single });
    i++;
  }
  // Silent-e display: fold the dropped "e" into the last chunk so the big
  // word view still shows every letter ("bike" → b·i·ke).
  if (magicE && out.length > 0) out[out.length - 1].graph += "e";
  // A useful sound-out is 2-5 sounds; longer reads as noise to a young kid.
  return out.length >= 2 && out.length <= 5 ? out : null;
}
