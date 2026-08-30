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
  type: "sort";
  buckets: string[];
  items: { label: string; bucket: string; audio?: AssetRef; image?: AssetRef }[];
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
  type: "speak";
  text: string;
  /** Teaching scaffold: allow "hear it first". Default false — a pronunciation
   *  CHECK must not reveal the answer by pronouncing it. */
  allowHear?: boolean;
}

export interface ChooseDef {
  type: "choose";
  options: { id: string; label: string; image?: AssetRef; audio?: AssetRef }[];
  correctId: string;
  coachWrong?: string;
}

export interface HighlightDef {
  type: "highlight";
  text: string;              // the sentence/passage shown as tappable words
  targets: string[];         // words the learner must find (evidence)
  coachWrong?: string;
}

export interface SequenceDef {
  type: "sequence";
  items: { id: string; label: string; image?: AssetRef; audio?: AssetRef }[];
  order: string[];           // item ids in correct order
  coachWrong?: string;
}

export interface ReadAlongDef {
  type: "read-along";
  text: string;          // the sentence, karaoke-highlighted word-by-word
  audio: AssetRef;       // sentence clip (lesson-tts writes <sceneId>-sentence.mp3;
                         // lesson-timings.py then keys its word timestamps the same)
}

// Registry growth is budgeted per exemplar (Exemplar C's budget: 0 new types).
export type InteractionDef =
  | TransformDef | SortDef | ListenDef | SpeakDef
  | ChooseDef | HighlightDef | SequenceDef | ReadAlongDef;

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

export interface SceneDef {
  id: string;
  purpose: ScenePurpose;
  /** "split" = visual left + lesson text right (default). "full" = one centered page. */
  layout?: "split" | "full";
  prompt: string;                      // short on-screen line (K: explanation is SPOKEN)
  /** Scene illustration (story moment, clue, setting) shown with the prompt —
   *  visualizes what the narration describes. */
  image?: AssetRef;
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

export interface LessonDef {
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
  ts: number;
}
