/**
 * Warm-Up Arcade engine types (Fulcrum: Generate → Judge → Adapt → Grade).
 *
 * A warm-up is a 30-60 second, no-fail arcade round played right before its
 * lesson: LISTEN (intro) → PLAY (count-up tap round) → CELEBRATE. Nothing is
 * ever marked wrong: off-target taps wobble and cost nothing, the score only
 * counts up, and the round always ends in a celebration + carrots.
 *
 * One engine, three round shapes:
 *  - "rule"    — one standing rule ("pop every word where ow sounds like cow"),
 *                all targets on screen across waves, kid pops matches.
 *  - "call"    — sequential audio calls ("Catch the word storm!"), one match
 *                per call among decoys. Used to pre-teach story/topic words.
 *  - "builder" — sequential audio calls name a compound target ("Now build
 *                sunset!"); the kid taps its two drifting parts into bench
 *                slots and they fuse. Runs in WordBuilderArcade, not
 *                WarmupArcade (different mechanic, shared conventions).
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
  /** Optional call-out played on catch ("Thunder!") — reinforces the word. */
  audio?: string;
};

export type WarmupWave = {
  /** Audio call played when the wave starts (call rounds). Omit for rule rounds. */
  call?: { audio: string; script: string };
  /** The word this wave's call asks for (call rounds); shown after the pop. */
  callWord?: string;
  tiles: WarmupTile[];
};

/** One target of a "builder" round: a compound word and its two parts. */
export type WarmupBuild = {
  /** The finished word, lowercase ("sunset"). */
  word: string;
  /** Its two parts in slot order: parts[0] + parts[1] = word. */
  parts: [string, string];
  /** Legacy guided-mode call — unused in free build. */
  call?: { audio: string; script: string };
  /** Completion clip played as the parts fuse ("Sunset!"). */
  wordAudio: string;
  /** Inline SVG emblem shown in the banner hint + assembly bloom. */
  emblem?: string;
};

/** Arcade skin hint. WarmupArcade renders "carrot" | "sky"; WordBuilderArcade
 *  renders "workshop" | "pond". Optional — surfaces fall back to a per-recipe
 *  default when absent (hand-built pilots pass skins explicitly). */
export type WarmupSkinHint = "carrot" | "sky" | "workshop" | "pond";

export type WarmupDef = {
  id: string;
  /** Lesson this warm-up feeds. Journey plays warmup → lesson → questions. */
  lessonId: string;
  title: string;
  /** Human lesson title for the "Warming up for …" chip (generated defs carry
   *  it so the dynamic demo route doesn't need the full lesson manifest). */
  lessonTitle?: string;
  /** Default skin for surfaces that don't choose one (dynamic demo route). */
  skin?: WarmupSkinHint;
  recipe: WarmupRecipe;
  /** "rule" = standing match rule; "call" = tap what the voice asks for;
   *  "builder" = snap two called parts together (WordBuilderArcade). */
  mode: "rule" | "call" | "builder";
  /** Short kid-facing rule line shown during play, e.g. "Pop the cow sounds!" */
  playPrompt: string;
  /** Start-screen invitation line; falls back to `playPrompt` when absent
   *  (builder rounds word it differently: "Listen, then snap…"). */
  startPrompt?: string;
  intro: {
    audio: string;
    script: string;
    /** Big card text shown during the intro, e.g. "ow" or "Story Words". */
    cardText: string;
  };
  /** Play-phase length in seconds (soft harvest window, default 45). */
  playSeconds?: number;
  /** Opt-in arcade ramp (rule rounds): spawn gaps and tile dwell shorten
   *  gently as the round progresses — playful pace, never punishing.
   *  Defaults off; reduced-motion players keep the calm base pace. */
  speedRamp?: boolean;
  waves: WarmupWave[];
  /** Builder rounds: the compound targets, built in order. Empty `waves`. */
  builds?: WarmupBuild[];
  /** Builder rounds: never-needed drifting parts ("dog", "tree", …). */
  decoyParts?: string[];
  celebrate: {
    audio: string;
    script: string;
  };
  /** Played instead of `celebrate` when the child caught nothing — honest,
   *  warm, forward-pointing. No false praise, no shame. */
  celebrateZero?: {
    audio: string;
    script: string;
  };
  /** Carrots granted on completion (always granted; no-fail). */
  carrots: number;
};
