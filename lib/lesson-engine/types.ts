// Lesson Engine — core types.
//
// RULES (from docs/LESSON_ENGINE_AUDIT.md):
//  • Interaction mechanics know NO subject — all meaning (labels, marks, images,
//    audio) arrives as data. `sort` must serve short/long vowels today and
//    odd/even numbers later without edits.
//  • Progression is input-driven (`gate`), never timer-driven. Cues choreograph
//    animation DURING narration; they do not advance the lesson.
//  • The registry (registry.tsx) grows only when an exemplar demands it.

// ── assets ─────────────────────────────────────────────────────────
export type AssetRef = string; // app-relative URL produced by the asset pipelines

// ── interactions ───────────────────────────────────────────────────
export interface TransformDef {
  /** Optional reversible demonstration; never scored as an assessment. */
  states?: { id: string; label: string; text: string; script: string; context?: string; before?: string; actionLabel?: string; emphasis?: string; image?: AssetRef; visual?: Record<string, string | number | boolean> }[];
  control?: "toggle";
  /** Navigation can begin on an overview before the child chooses a destination. */
  startUnselected?: boolean;
  presentation?: "swap" | "book-covers";
  type: "transform";
  base: string;          // "CAP"
  add: string;           // "E"
  result: string;        // "CAPE"
  changeIndex: number;   // index of the letter that changes character
  options?: string[];    // letter choices (must include `add`); omit → [add]
  /** Teaching labels shown under tiles after the transform — DATA, not renderer
   *  knowledge. e.g. { added: "silent", changed: "says its name!" } */
  labels?: { added?: string; changed?: string };
  /** Character overrides for the changing letter (e.g. phonics notation ă → ā).
   *  Compute in the lesson data (lib/lesson-engine/phonics helpers). */
  marks?: { before?: string; after?: string };
  imageBefore?: AssetRef;
  imageAfter?: AssetRef;
  emojiBefore?: string;  // fallback when no illustration exists
  emojiAfter?: string;
  successAudio?: AssetRef; // confirmation (the new word said aloud)
  coachWrong?: string;
}

export interface SortDef {
  /** Explicit vocabulary support: pictures remain attached to their word cards. */
  showImages?: boolean;
  bucketImages?: Record<string, AssetRef>;
  bucketMarkers?: Record<string, number>;
  type: "sort";
  buckets: string[];
  items: { label: string; spoken?: string; bucket: string; audio?: AssetRef; image?: AssetRef; explanation?: string }[];
  /** Spoken name per bucket — tapped buckets announce themselves, and the
   *  feedback chain reads item → bucket → verdict ("bug… rug… correct!"). */
  bucketAudio?: Record<string, AssetRef>;
  coachWrong?: string;
}

export interface ListenDef {
  type: "listen";
  items: { label: string; audio?: AssetRef; image?: AssetRef }[];
}

export interface SpeakDef {
  /** Expose capture/verdict state to the lesson-owned scene visual. */
  visualFeedback?: boolean;
  type: "speak";
  text: string;
  /**
   * WHICH SPEAKING TASK THIS IS. Two genuinely different things share this
   * interaction, and the engine used to guess between them by word count:
   *
   *   "read" - read this exact text aloud. The text is SHOWN, because a child
   *            cannot read aloud something they cannot see, and the whole thing
   *            has to be said.
   *   "any"  - open production: `text` is a space-separated ACCEPT LIST and any
   *            one entry counts ("rain raining", "drink drinks drinking"). The
   *            list is HIDDEN, because it is the answer.
   *
   * Omit and the engine classifies from the text's own shape - a capitalised
   * opener, terminal punctuation or a function word means "read". Authoring it
   * explicitly is always better than being classified.
   */
  mode?: "read" | "any" | "respond" | "open";
  rubricId?: string;
  /** Opt-in Azure single utterance for short spoken answers; no target-word hint. */
  captureMode?: "single-utterance";
  /** Whole alphabet hints; never the expected answer alone. */
  recognitionVocabulary?: "letter-names";
  reflection?: {
    acknowledgments?: Record<"happy" | "sad" | "worried" | "excited" | "other", string>;
    followUp: { rubricId: string; prompt: string; invitation: string; thanks: string; hint: string };
    portraits: Partial<Record<"happy" | "sad" | "worried" | "excited", AssetRef>>;
  };
  unclearScript?: string;
  /** Voiced transport/device failure, distinct from an uncertain answer. */
  unavailableScript?: string;
  /** Supported rhyme collection: each distinct accepted word fills one slot. */
  rhymeSeries?: { target: string; count: number; nextPrompts: string[]; duplicateScript: string; targetRepeatScript?: string; completeScript: string };
  confirmationScript?: string;
  /** Authored, recorded readbacks for uncertain single-word recognition. */
  confirmationReadbacks?: Record<string, string>;
  success?: { image: AssetRef; alt: string; sentence: string };
  /** Curated feedback selected only by a validated server-rubric evidence key. */
  responseReveals?: Record<string, { image: AssetRef; alt: string; sentence: string }>;
  /** Teaching scaffold: allow "hear it first". Default false — a pronunciation
   *  CHECK must not reveal the answer by pronouncing it. */
  allowHear?: boolean;
  /** Oral rehearsal can complete on full attempted coverage; accuracy remains separate. */
  completionPolicy?: "accurate-read" | "practice-coverage";
  autoStop?: boolean;
}

export interface PrintPageDef {
  /** Fixed authored lines: never let a responsive wrap invent a reading-order target. */
  lines: string[][];
  showSpaces?: boolean;
  markerId?: string;
}
export interface ChooseDef {
  /** One shared subject picture for the question, separate from its answer options. */
  stimulus?: { src: AssetRef; alt: string };
  /** Read existing answer clips in visible order after the prompt; selection interrupts. */
  autoReadChoices?: boolean;
  /** Candidate-name audio reveals a visual recognition answer; record it as assistance. */
  replayIsHelp?: boolean;
  /** Direct selection on a native printed page, using the same answer/evidence path. */
  printPage?: PrintPageDef;
  /** Repair one selected word in place after a correct response. Positional,
   * case-only editing preserves the authored sentence and evidence contract. */
  printRepair?: { positionId: string; replacement: string };
  /** Subjective reflection: every choice is valid; never score accuracy. */
  mode?: "reflection";
  type: "choose";
  options: { id: string; label: string; displayLines?: string[]; displayImages?: string[]; wordImage?: string; spoken?: string; image?: AssetRef; audio?: AssetRef; visual?: Record<string,string|number|boolean> }[];
  correctId: string;
  /** Find every named position on a printed page before this activity is complete. */
  collectAll?: { ids: string[]; progressScript: string };
  success?: { image: AssetRef; alt: string; sentence: string };
  acceptedIds?: string[]; // creative choices may have multiple valid answers
  coachWrong?: string;
}

export interface HighlightDef {
  /** Optional authored, case-only corrections at target word positions. */
  repairs?: {index: number; replacement: string}[];
  result?: string;
  success?: {image: AssetRef; alt: string; sentence: string};
  type: "highlight";
  text: string;              // the sentence/passage shown as tappable words
  targets: string[];         // words the learner must find (evidence)
  coachWrong?: string;
}

export interface SequenceDef {
  success?: { image: AssetRef; alt: string; sentence: string };
  resultParts?: { text: string; image?: AssetRef }[];
  result?: string; // authored completed display, e.g. capitalized and punctuated sentence
  /** Opt in for connected text; never automatically voice letter/phoneme arrays. */
  readResult?: boolean;
  type: "sequence";
  items: { id: string; label: string; spoken?: string; image?: AssetRef; audio?: AssetRef }[];
  order: string[];           // item ids in correct order
  coachWrong?: string;
}

export interface MatchDef {
  /** Teaching-only opt-in; assessed recognition may keep candidate names behind help. */
  autoPlayOnSelect?: boolean;
  compactImages?: boolean;
  /** Picture identifiers can stay selectable without meaningless spoken labels. */
  silentLabels?: string[];
  type: "match";
  pairs: { left: string; right: string }[];
  /** Authored pictures stay attached to their matching card; labels remain available for replay. */
  images?: Record<string, { src: AssetRef; alt: string }>;
  spoken?: Record<string, string>;
  /** Match visually; optional name replay is assistance, never independent evidence. */
  replayIsHelp?: boolean;
  /** Listening to these printed candidates supplies help; other cards may be audio stimuli. */
  replayHelpLabels?: string[];
  success?: { image: AssetRef; alt: string; sentence: string };
}

export interface ReadAlongDef {
  /** Authored verse breaks; do not treat breaks as spoken words. */
  preserveLineBreaks?: boolean;
  type: "read-along";
  /** Optional child-controlled story pages, authored alongside the whole passage. */
  pages?: { text: string; image?: AssetRef; visual?: Record<string, string | number | boolean> }[];
  text: string;          // the sentence, karaoke-highlighted word-by-word
  audio: AssetRef;       // sentence clip (lesson-tts writes <sceneId>-sentence.mp3;
                         // lesson-timings.py then keys its word timestamps the same)
}

// Registry growth is budgeted per exemplar (Exemplar C's budget: 0 new types).
export type InteractionDef =
  | TransformDef | SortDef | ListenDef | SpeakDef
  | ChooseDef | HighlightDef | SequenceDef | ReadAlongDef | MatchDef;

// ── narration choreography (animation sync ≠ pedagogy timing) ──────
export interface Cue {
  /** Word in the narration (resolved via Whisper timings; last match wins,
   *  small pre-roll) or an absolute time in seconds. */
  at: string | number;
  do: {
    /** "fire" = trigger the scene's auto interaction (e.g. the transform lands
     *  exactly on the spoken word). Stage effects (glow/spotlight/post-note)
     *  land with the Stage/Board layer. */
    effect: "fire";
    target?: string;
    payload?: unknown;
  };
}

// ── scenes / lesson ────────────────────────────────────────────────
export type ScenePurpose = "hook" | "model" | "guided" | "apply" | "challenge" | "celebrate";

/** A small, visible source page. Words stay native text, separate from artwork. */
export interface ReferencePageDef {
  /** Long paired sources can be opened one at a time without omitting any source words. */
  presentation?: "tabs";
  /** Previously introduced source stays visible/replayable without repeating before every question. */
  autoRead?: boolean;
  title?: string;
  sections: {
    heading: string;
    text?: string;
    entries?: { term: string; detail: string }[];
    image?: { src: AssetRef; alt: string };
    caption?: string;
    page?: number;
  }[];
}

export interface SceneDef {
  /** A structured teaching visual. Takes the stage ahead of fx when present. */
  diagram?: DiagramDef;
  id: string;
  skill?: string;
  evidence?: "assessed" | "practice" | "demonstration";
  context?: string;
  /** Print stays visible; optional model playback is recorded as assistance. */
  contextMode?: "read-first" | "print-first";
  referencePage?: ReferencePageDef;
  feedback?: { correct: string; hint: string; incorrect: string; byChoice?: Record<string,string> };
  visual?: { id: string; props?: Record<string,string|number|boolean>; hideOnSuccess?: boolean };
  purpose: ScenePurpose;
  /** "split" = visual left + lesson text right (default). "full" = one centered page. */
  layout?: "split" | "full";
  prompt: string;                      // short on-screen line (K: explanation is SPOKEN)
  /** Scene illustration (story moment, clue, setting) shown with the prompt —
   *  visualizes what the narration describes. */
  image?: AssetRef;
  /** Meaningful description when the illustration itself is question evidence. */
  imageAlt?: string;
  /** Motion-library stage: when a scene has no picture, its key sentence IS the
   *  visual — animated by a named effect. Mark target words with **stars**. */
  fx?: { text: string; effect: string }; // effect ∈ TextFX SUPPORTED_EFFECTS (lint-checked); catalog = Claude Design Motion Library
  narration?: { audio: AssetRef; script: string };
  cues?: Cue[];
  interaction?: InteractionDef;
  /** Model scenes run their interaction themselves (fired by a cue). */
  auto?: boolean;
  /** "interaction" → Next unlocks when the learner solves it. "none" → never blocks. */
  gate: "interaction" | "none";
  /** Semantic animation intent (tokens in animation.ts; Claude Design's surface). */
  animation?: { entrance?: string; success?: string };
}

export type Archetype =
  | "phonics" | "fluency" | "story-elements" | "inference" | "vocabulary" | "print-concepts";

export interface WordTiming { word: string; start: number; end: number }

/**
 * A teaching diagram: rows of term -> meaning, revealed in step with the voice.
 *
 * The visual stage could only ever be an animated sentence or a picture, so any
 * lesson needing to SHOW a mapping had to flatten it into one line of fx text -
 * which renders as loose words with no pairing. Rows make the structure real.
 */
export interface DiagramDef {
  rows: { term: string; means: string; example?: string }[];
}

export interface LessonDef {
  delivery?: "coached";
  id: string;
  title: string;
  grade: string;
  standard: string;
  archetype: Archetype;
  objective: string;
  concepts: string[];
  scenes: SceneDef[];
  /** Whisper word timestamps per sceneId (generated by scripts/lesson-timings.py). */
  timings?: Record<string, { duration: number; words: WordTiming[] }>;
  /** Lesson-complete moment: spoken recap (lesson-tts writes complete.mp3) +
   *  warm on-screen copy. The bunny dances (levelup reaction). */
  completion?: { script: string; title: string; body: string };
}

// ── telemetry — ONE contract for every interaction ─────────────────
export interface LearningEvent {
  lessonId: string;
  sceneId: string;
  conceptId: string;
  interactionType: string;
  itemId?: string;
  correct?: boolean;
  attempts: number;
  hintUsed?: boolean;
  responseTimeMs?: number;
  speech?: { accuracy?: number; phonemeMin?: number };
  outcome?: "first-try" | "after-help" | "after-error" | "skipped" | "unavailable" | "practice";
  ts: number;
}
