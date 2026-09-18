/**
 * Past-tense "read" for the voice only.
 *
 * ‼️ FILIP, ON THE REPORT NARRATION: "she said read instead of read (same
 * spelling but grammatical error)". The voice said "reed" where the sentence
 * meant "red". One stored line carried two of them:
 *
 *   "Fil read words in the vowel patterns set, read a Kindergarten text
 *    accurately and understood its meaning."
 *
 * The written word is right, so the captions and the emailed report must keep
 * it. Only the text handed to the voice changes, the same split the app already
 * uses between what is displayed and what is spoken.
 *
 * WHY A PHRASE LIST AND NOT A RULE. "Read" is past or present depending on the
 * sentence, and the narration contains both. "They read every word on the list"
 * is past; "understanding what they read is the skill to build" is present, and
 * so is "to read like a second grader". A rule anchored on the subject gets the
 * second one wrong, and a voice saying "red" where it means "reed" is the same
 * defect pointing the other way. So this respells only phrasings that exist in
 * the narration templates and are unambiguously past.
 *
 * Add a phrase here when a template adds one. Anything not listed is left alone
 * on purpose.
 */

/** Unambiguously past-tense phrasings in lib/placement/narration.ts. */
const PAST_READ: readonly RegExp[] = [
  /\bread (every word)\b/gi,
  /\bread (the [a-z\s]*?(?:list|story|passage|text))\b/gi,
  /\bread (a [a-z\s]*?(?:passage|text|story|list))\b/gi,
  /\bread (this passage)\b/gi,
  /\bread (words (?:in|from) the)\b/gi,
  /\bread (with expression)\b/gi,
  /\bread (carefully)\b/gi,
  /\bread (\d)/g,
];

/**
 * Respell past-tense "read" as "red" for a text-to-speech voice. Case of the
 * original is preserved, so a sentence-initial "Read" stays capitalised.
 */
export function spokenTense(text: string): string {
  let out = text;
  for (const pattern of PAST_READ) {
    out = out.replace(pattern, (match, rest: string) => {
      const red = match.startsWith("R") ? "Red" : "red";
      return `${red} ${rest}`;
    });
  }
  return out;
}
