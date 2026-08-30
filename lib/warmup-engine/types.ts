/**
 * Warm-Up Arcade engine types (Fulcrum: Generate → Judge → Adapt → Grade).
 *
 * A warm-up is a 30-60 second, no-fail arcade round played right before its
 * lesson: LISTEN (intro) → PLAY (count-up tap round) → CELEBRATE. Nothing is
 * ever marked wrong: off-target taps wobble and cost nothing, the score only
 * counts up, and the round always ends in a celebration + carrots.
 *
 * One engine, two round shapes:
 *  - "rule"  — one standing rule ("pop every word where ow sounds like cow"),
 *              all targets on screen across waves, kid pops matches.
 *  - "call"  — sequential audio calls ("Catch the word storm!"), one match
 *              per call among decoys. Used to pre-teach story/topic words.
 */

export type WarmupRecipe =
  | "sound-hunt" // phonics: rule-based sound match
  | "word-catch" // word work: rule-based morphology match (prefixes, compounds)
  | "story-scout" // literature: call-based anchor-word hunt
  | "topic-scout"; // informational: call-based topic-word hunt

export type WarmupTile = {
  /** Lowercase display word. Also the tile id within its wave. */
  word: string;
  /** True if tapping this tile scores a point. */
  isMatch: boolean;
};

export type WarmupWave = {
  /** Audio call played when the wave starts (call rounds). Omit for rule rounds. */
  call?: { audio: string; script: string };
  /** The word this wave's call asks for (call rounds); shown after the pop. */
  callWord?: string;
  tiles: WarmupTile[];
};

export type WarmupDef = {
  id: string;
  /** Lesson this warm-up feeds. Journey plays warmup → lesson → questions. */
  lessonId: string;
  title: string;
  recipe: WarmupRecipe;
  /** "rule" = standing match rule; "call" = tap what the voice asks for. */
  mode: "rule" | "call";
  /** Short kid-facing rule line shown during play, e.g. "Pop the cow sounds!" */
  playPrompt: string;
  intro: {
    audio: string;
    script: string;
    /** Big card text shown during the intro, e.g. "ow" or "Story Words". */
    cardText: string;
  };
  /** Play-phase length in seconds (soft harvest window, default 45). */
  playSeconds?: number;
  waves: WarmupWave[];
  celebrate: {
    audio: string;
    script: string;
  };
  /** Carrots granted on completion (always granted; no-fail). */
  carrots: number;
};
