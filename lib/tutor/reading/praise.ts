/**
 * FULCRUM KERNEL — reading PLUGIN: the process-praise bank + growth phrasing.
 *
 * These are the words Luna actually says. Every line names what the child DID
 * (a strategy/process), never who they are — no "you're smart", no "good job".
 * Copy rules apply (spoken to the child): no em-dashes, warm, second person.
 */

import { personalGrowth, type PraiseBank } from "@/lib/tutor/motivation";

export const READING_WIN = {
  SELF_CORRECTED: "self_corrected",
  SOUNDED_OUT: "sounded_out",
  DECODED_WORD: "decoded_word", // detail = the word
  READ_LINE: "read_line",
  READ_STORY: "read_story",
  FIXED_WORD: "fixed_word", // detail = the word
} as const;

export const READING_PRAISE: PraiseBank = {
  [READING_WIN.SELF_CORRECTED]: [
    "You caught that all by yourself!",
    "Nice fixing! You went back and got it right.",
    "You noticed it did not sound right and fixed it.",
  ],
  [READING_WIN.SOUNDED_OUT]: [
    "You sounded that out all by yourself!",
    "You blended every sound and got it.",
    "You tapped it out sound by sound.",
  ],
  [READING_WIN.DECODED_WORD]: [
    "You worked out {detail} all by yourself!",
    "You sounded out {detail} sound by sound.",
    "Yes, {detail}! You blended it.",
  ],
  [READING_WIN.READ_LINE]: [
    "You read that whole line!",
    "Smooth reading all the way through that line!",
    "You kept it going the whole line.",
  ],
  [READING_WIN.READ_STORY]: [
    "You read the whole story by yourself!",
    "You put it all together, start to finish!",
    "You made it through the whole story!",
  ],
  [READING_WIN.FIXED_WORD]: [
    "You got {detail} that time!",
    "Yes, {detail}! You fixed it.",
    "That is it, {detail}!",
  ],
};

/** Self-referential fluency growth: this read vs. the child's OWN last read.
 *  Returns null when there's no prior or no gain (never announce a slowdown). */
export function readingGrowthLine(
  currentWcpm: number,
  previousWcpm: number | null | undefined,
): string | null {
  const { improved, delta } = personalGrowth(currentWcpm, previousWcpm);
  if (!improved) return null;
  const unit = delta === 1 ? "word a minute" : "words a minute";
  return `You read ${delta} more ${unit} than last time!`;
}
