/** Supported oral rhyme practice: a transcript cannot prove arbitrary phonology.
 * No model may turn a mentioned keyword, mixed guess or instruction into credit.
 * Recognized whole response forms are deliberately bounded; other speech is unclear.
 * This vocabulary and its accepted sentence forms require educator/dialect review. */
export const RHYME_FAMILIES = {
  near: ["dear", "deer", "hear", "here", "ear", "year", "clear", "fear", "cheer", "gear", "peer", "pier", "rear", "steer", "sphere", "sheer"],
  hop: ["chop", "cop", "crop", "drop", "flop", "mop", "pop", "prop", "shop", "slop", "sop", "stop", "top"],
  sun: ["bun", "done", "fun", "gun", "none", "one", "run", "shun", "son", "spun", "stun", "ton", "won"],
  boat: ["bloat", "coat", "float", "goat", "moat", "note", "oat", "rote", "tote", "vote", "wrote"],
} as const;
const clearlyDifferent = {
  near: ["cat", "dog", "sun", "moon", "hat", "boat", "fish", "hop", "rug"],
  hop: ["fish", "cat", "dog", "boat", "boot", "hat", "hen", "sun", "rug", "cake", "chair", "beans", "lupini beans"],
  sun: ["fish", "cat", "dog", "boat", "boot", "hat", "hen", "rug", "cake", "chair", "beans", "lupini beans"],
  boat: ["fish", "cat", "dog", "hop", "boot", "hat", "hen", "sun", "rug", "cake", "chair", "mop", "beans", "lupini beans"],
} as const;
export function offeredRhymeWord(target: string, text: string) {
  const normalized = text.trim().toLowerCase().replace(/[.!?]+$/g, "").trim();
  // Only strip an entire recognized sentence frame. Remaining negation,
  // alternatives, meta-instructions and unknown words cannot match the lexicon.
  return normalized
    .replace(/^(?:my word is|my rhyme is|i can say|i say|i said|the word is|the word|it is|it's|how about|i think) /, "")
    .replace(/^(?:a|an) /, "")
    .replace(new RegExp("^" + target + " rhymes with "), "")
    .replace(new RegExp(" rhymes with " + target + "$"), "");
}
export function checkRhymeProduction(target: keyof typeof RHYME_FAMILIES, text: string) {
  const word=offeredRhymeWord(target,text);
  if ((RHYME_FAMILIES[target] as readonly string[]).includes(word))
    return { verdict: "accepted", reason: "rhyme-word", evidenceKey: ["mop", "goat", "coat"].includes(word) ? word : "other" } as const;
  if (word === target) return { verdict: "needs-help", reason: "incomplete" } as const;
  if ((clearlyDifferent[target] as readonly string[]).includes(word) || (target !== "near" && Object.values(RHYME_FAMILIES).some(family => (family as readonly string[]).includes(word))))
    return { verdict: "needs-help", reason: "contradiction" } as const;
  return { verdict: "unclear", reason: "unclear" } as const;
}
