/** Bounded whole-word transformations. Recognition is practice, not pronunciation mastery. */
export function knownWordChange(text: string, startingWord: string, targetWord: string) {
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/g, "")
    .trim();
  // Explicit alternative single words are uncertainty, even when one is the starting word.
  if (/^[a-z]+\s+or\s+[a-z]+$/.test(normalized))
    return { verdict: "unclear", reason: "unclear" } as const;
  const noun = normalized.replace(/^(?:a|the) /, "");
  if (noun === targetWord) return { verdict: "accepted", reason: "fact-detail" } as const;
  if (noun === startingWord) return { verdict: "needs-help", reason: "incomplete" } as const;
  if (normalized === `not ${targetWord}`)
    return { verdict: "needs-help", reason: "contradiction" } as const;
  return null; // Full paraphrases, negation and instructions retain the semantic rubric.
}
