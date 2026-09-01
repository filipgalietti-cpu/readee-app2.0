/**
 * FULCRUM KERNEL — reading PLUGIN: the help rungs for a stuck word.
 *
 * This is the only reading-specific part of the coaching loop. It maps a word
 * to the graded, feasibility-gated rungs the kernel's help-ladder engine will
 * order and pace. The escalation LOGIC (least→most, short, no spiral) lives in
 * lib/tutor/help-ladder; here we just say which rungs even apply to THIS word.
 *
 * Decode-first (Science of Reading): a decodable word climbs first-sound →
 * onset-rime → sound-out, then the ladder MODELS it (says the whole word). A
 * SIGHT word is never blended (that teaches it wrong) — it gets "we know it by
 * heart", then modeled. An undecodable word (can't be segmented) has no hints,
 * so the ladder models it immediately. "Say the whole word" is not a rung here —
 * it's what the kernel's `model` step means for reading, so it never doubles up.
 */

import type { HelpRung } from "@/lib/tutor/help-ladder";
import { isSightWord, soundOutSegments } from "@/lib/luna/sound-out";

export const READING_RUNG = {
  FIRST_SOUND: "first-sound", // "what's the first sound? /f/"
  ONSET_RIME: "onset-rime", // "/f/ … /lat/"
  SOUND_OUT: "sound-out", // full phoneme blend (Luna's karaoke)
  SIGHT_SAY: "sight-say", // "it's a sight word — we know it by heart"
} as const;

export type ReadingWordCtx = {
  word: string;
  /** 0-based index within the line (reserved for recue-style rungs later). */
  positionInLine?: number;
};

/** Ordered, feasibility-gated HINT rungs for one word (least → most support).
 *  Modeling ("say the whole word") is the kernel's `model` step, not a rung. */
export function readingRungs({ word }: ReadingWordCtx): HelpRung[] {
  const clean = word.replace(/[^A-Za-z'-]/g, "");
  const sight = isSightWord(clean);
  const segs = sight ? null : soundOutSegments(clean);
  const n = segs?.length ?? 0;
  const decodable = !sight && n >= 2;

  return [
    { id: READING_RUNG.FIRST_SOUND, level: 0, feasible: decodable && clean.length >= 2 },
    { id: READING_RUNG.ONSET_RIME, level: 1, feasible: decodable },
    { id: READING_RUNG.SOUND_OUT, level: 2, feasible: decodable && n <= 5 },
    { id: READING_RUNG.SIGHT_SAY, level: 3, feasible: sight },
  ];
}

/**
 * How many decode rungs to offer before modeling, for reading. Higher than the
 * engine default (2) so a stuck decodable word can climb the full decode ladder
 * — but a child who recovers early never sees the later rungs, which is exactly
 * how we keep help short without amputating the sound-out.
 */
export const READING_MAX_HELPS = 3;
