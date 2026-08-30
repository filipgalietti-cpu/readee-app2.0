# Lesson Engine — Architecture Audit & Course Correction

_Response to the "Lesson System 2.0 — Course Correction" directive (Aug 2026). Verdict accepted:
silent-E drifted from "prove reusable primitives" into a bespoke mini-game. The test that matters —
**"could we ship a second lesson tomorrow without a new React component?"** — currently fails.
This doc: (1) audit, (2) diagnosis, (3) target architecture, (4) extraction plan, (5) exemplar-B
proof plan, (6) Claude Design brief. No further silent-E-specific code until this is approved._

---

## 1 · Current-state audit

| File | Classification | Notes |
|---|---|---|
| `lib/lesson-engine/types.ts` | Engine, **contaminated** | Generic `LessonV2/Scene/Interaction/LearningEvent` — but grew lesson-shaped warts: `emojiBase/emojiResult/imageBase/imageResult`, `triggerWord`, `successAudio`, `layout` on Scene. |
| `lib/lesson-engine/phonics.ts` | ✅ Reusable engine util | Macron/breve (ā/ă) helpers. Keep. |
| `app/components/lesson-v2/interactions/WordSorter.tsx` | ✅ Reusable interaction | Fully generic (buckets, items, coach). The model citizen. |
| `app/components/lesson-v2/interactions/TapToHear.tsx` | ✅ Reusable interaction | Generic words/audio/images listen-tiles. |
| `app/components/lesson-v2/interactions/ReadAloud.tsx` | ✅ Reusable interaction | Generic speak-check; browser-SR placeholder, Azure slot. |
| `app/components/lesson-v2/interactions/WordTransformer.tsx` | ⚠️ Half engine / half silent-E | Transform mechanic generic (base/add/result/options, tap+drag). BUT: "silent"/"says its name!" labels, phonics notation application, sparkle/glow/flip Framer values all hard-coded in the renderer → **interaction knows the subject** (violates the core rule). |
| `app/components/lesson-v2/LessonRunnerV2.tsx` | ⚠️ Mixed | Scene runtime + shell mounting reusable; but interaction dispatch = hand ternary (no registry); interaction CSS inline; gating rules ad-hoc (`kind !== "tap-to-hear"`). |
| `app/components/lesson-v2/greybox-audio.ts` | ❌ Parallel infrastructure | Duplicates existing `lib/audio/audio-manager.ts` (Howler). Re-solved autoplay/stop/sync from scratch; `timeupdate` (~4Hz) trigger = coarse timing. |
| `app/data/lessons-v2/silent-e.ts` | ✅ Lesson data (right shape) | Mostly config. Hand-maintained audio paths + trigger words; labels should live here (they don't yet). |
| `app/data/lessons-v2/silent-e-timings.json` | ✅ Generated asset | Whisper word timestamps. Pipeline output, correct. |
| `scripts/gen-silent-e-tts.ts` | ⚠️ Recipe, not factory | Right pipeline (Vertex Autonoe→ffmpeg→mp3), hardcoded import of silent-e. |
| `scripts/gen-silent-e-timings.py` | ⚠️ Recipe, not factory | Whisper word_timestamps; hardcoded paths. |
| `scripts/gen-silent-e-images.ts` | ⚠️ Recipe, not factory | GoogleGenAI `gemini-2.5-flash-image` house-style; hardcoded word list. |
| `app/demo/silent-e/page.tsx` | Demo route | Fine. |
| `app/components/lesson/LessonShellDesktop.tsx` | Legacy modification | `<footer>`→`<div>` so demo chrome can't hide Next. Benign, keep. |
| `docs/LESSON_SILENT_E_SCRIPT.md`, `docs/CC_COVERAGE_K.md` | ✅ Pedagogy/spec docs | Layer-1 artifacts; unaffected. |

## 2 · Scalability diagnosis (why silent-E keeps eating time)

1. **No interaction registry.** Dispatch is a hand-written ternary in the runner; each interaction has bespoke props threaded by hand. Every new interaction or lesson = editing the runner.
2. **Animation is welded inside components.** Framer values (sparkle count, glow shadows, flip springs) are hand-coded per renderer. Nothing extractable, nothing Claude Design can own, every polish request = engineering.
3. **Parallel audio layer.** `greybox-audio` re-implemented what `audioManager` already does well; and its 4Hz `timeupdate` trigger caused the entire "timing feels off" bug class. Precision needs an rAF clock against `audio.currentTime`.
4. **Renderers know the subject.** Teach-labels and vowel notation live in `WordTransformer` instead of lesson data — so the same mechanic can't serve another concept without code edits.
5. **Scripts are hardwired** to one lesson (direct imports), so each new lesson would fork three scripts.
6. Process: three shell rewrites (grey-box → split → real shell) from not anchoring on the production template on day one.

**Consequence:** lesson #2 today = new code in ≥4 places. Target: lesson #2 = data + assets only.

## 3 · Target architecture

### Folder structure
```
lib/lesson-engine/
  types.ts        // Lesson · Scene · InteractionDef · Cue · LearningEvent · AssetRef
  registry.tsx    // InteractionRegistry: InteractionDef["type"] → renderer component
  runtime.ts      // scene state machine: enter → await-learner → resolve → advance
  cues.ts         // narration cue engine (rAF clock vs audio.currentTime; word-timestamp resolution)
  animation.ts    // semantic primitives: entrance/attention/transform/feedback (named tokens)
  events.ts       // emitLearningEvent() → learner model (child_skill_memory path) + PostHog
app/components/lesson-v2/
  LessonRunner.tsx  // mounts real LessonShellDesktop; slots; Next gating from runtime
  Stage.tsx         // LEFT panel — stage objects; executes cues (highlight/morph/swap/sparkle)
  Board.tsx         // RIGHT panel — notes accumulate via post-note cues (teacher's whiteboard)
  interactions/     // choose · transform · sort · listen · speak  (+ highlight · sequence for B)
app/data/lessons-v2/
  <lessonId>.ts             // pure data
  <lessonId>-timings.json   // generated
scripts/
  lesson-tts.ts      --lesson=<id>   // narration + per-word clips
  lesson-timings.py  --lesson=<id>   // Whisper word timestamps
  lesson-images.ts   --lesson=<id>   // house-style art from the lesson's asset manifest
```

### Core interfaces
```ts
// ── assets ──
export type AssetRef = string; // app-relative URL; generated by the pipelines

// ── interactions (mechanics know NO subject; all meaning arrives as data) ──
export type InteractionDef =
  | { type: "choose";    prompt?: string; options: { id: string; label: string; image?: AssetRef; audio?: AssetRef }[]; correctId: string; coachWrong?: string }
  | { type: "transform"; start: string[]; add: string; result: string; changeIndex: number;
      options?: string[]; labels?: { added?: string; changed?: string };       // ← "silent" / "says its name!" live in DATA
      marks?: { changedBefore?: string; changedAfter?: string };               // ← "ă" / "ā" in DATA
      imageBefore?: AssetRef; imageAfter?: AssetRef; successAudio?: AssetRef; coachWrong?: string }
  | { type: "sort";      buckets: string[]; items: { label: string; bucket: string; audio?: AssetRef }[]; coachWrong?: string }
  | { type: "listen";    items: { label: string; audio?: AssetRef; image?: AssetRef }[] }
  | { type: "speak";     text: string; engine?: "azure" | "browser" }
  | { type: "highlight"; text: string; targets: string[]; coachWrong?: string }          // exemplar B
  | { type: "sequence";  items: string[]; correctOrder: number[]; coachWrong?: string }; // exemplar B (port SentenceBuild)

// ── narration choreography (animation sync ≠ pedagogy timing) ──
export interface Cue {
  at: string | number;                    // word in the narration (Whisper-resolved) or seconds
  do: { target: string;                   // stage object id: "word", "tile:E", "image", "board"
        effect: "glow" | "spotlight" | "underline" | "shake" | "morph" | "swap-image"
              | "sparkle" | "pop" | "post-note";
        payload?: unknown };
}

export interface SceneDef {
  id: string;
  purpose: "hook" | "model" | "guided" | "apply" | "challenge" | "celebrate";
  layout?: "split" | "full";
  prompt: string;                         // short on-screen line (K: explanation is SPOKEN)
  narration?: { audio: AssetRef; script: string };
  cues?: Cue[];                           // fire DURING narration (choreography only)
  interaction?: InteractionDef;
  gate: "interaction" | "none";           // Next unlocks on learner action, or immediately
  animation?: { entrance?: string; success?: string };  // semantic tokens (animation.ts)
}

export interface LessonDef {
  id: string; title: string; grade: string; standard: string;
  archetype: "phonics" | "fluency" | "story-elements" | "inference" | "vocabulary" | "print-concepts";
  objective: string; concepts: string[];
  scenes: SceneDef[];
}

// ── one telemetry contract for everything ──
export interface LearningEvent {
  lessonId: string; sceneId: string; conceptId: string; interactionType: string;
  itemId?: string; correct?: boolean; attempts: number; hintUsed?: boolean;
  responseTimeMs?: number; speech?: { accuracy?: number; phonemeMin?: number }; ts: number;
}
```

### Rules baked in
- **Input-driven progression, always.** `gate` decides Next; no pedagogy on timers. Cues sync animation to narration — that is choreography, not progression (keep the Whisper cue engine; it is a strength, not a violation).
- **Registry only grows when an exemplar demands it** (5 entries now, +2 for exemplar B). No speculative interactions.
- **Prefer configuration over branching** — no `if (lessonId === …)` anywhere.
- **Animation tokens** are the Claude Design surface; components request `success: "correctBurst"`, never raw Framer values.

## 4 · Extraction plan (from today's code)

1. **Registry first**: create `registry.tsx`; register `sort` (WordSorter as-is), `listen` (TapToHear), `speak` (ReadAloud). Replace the runner's ternary. (~an hour of moves)
2. **De-subject the transformer**: labels/marks/images → `InteractionDef` data; move sparkle/glow/flip into `animation.ts` as `correctBurst`/`glow`/`swapImage`. Rename → `transform`.
3. **Kill `greybox-audio`** → use existing `audioManager`; build `cues.ts` with an rAF clock (fixes the timing-feel class permanently).
4. **Genericize pipelines** → `lesson-tts.ts / lesson-timings.py / lesson-images.ts --lesson=<id>` reading the lesson file + an asset manifest.
5. **Rewrite `silent-e.ts` as pure data** against the new types — the engine's first proof. Zero silent-E-specific React remains.

## 5 · Exemplar B plan — Story Elements (proves the engine)

**Lesson:** RL.K.3 "Characters, Settings, and Events" (grounded in existing K content).
**Composition (all data):** listen-story (Stage shows story art, `listen`) → tap-the-character (`choose` w/ image options) → find-the-evidence (`highlight` on a sentence) → order beginning/middle/end (`sequence`) → character-vs-setting (`sort`) → optional retell (`speak`).
**New engine code required — the whole test:**
- `highlight` interaction (net-new, small: tappable words/spans in a passage)
- `sequence` interaction (port of existing practice `SentenceBuild` into the registry)
- **Nothing else.** Runtime, Stage/Board, cues, audio, events, pipelines: unchanged.
If exemplar B needs more than those two registry entries, the architecture failed — stop and fix the engine, not the lesson.

**Exemplar C (Meaning & Inference)** then composes `choose` (prediction) + `highlight` (evidence hunt) + `speak`/`choose` (justification) — target: **zero** new engine code.

## 6 · Claude Design brief — the interaction/motion SYSTEM (not silent-E visuals)

> **Brief:** Design Readee's reusable learning-interaction design system, demonstrated on three scenes
> (a word **transform**, a **sort**, a passage **highlight**). Deliver states + motion as a system:
> 1. **Object states** for every manipulable: idle / inviting / touched / dragging / snapped / wrong / correct.
> 2. **Snap & drag feel**: target affordances, magnetic snap distance, drop rejection.
> 3. **Feedback reactions**: correctBurst, retryNudge (gentle, non-punitive), smallCelebration, masteryCelebration.
> 4. **The Board** (right panel): how accumulated rule-notes look (K-legible cards, vowel marks ă/ā), how a note "arrives."
> 5. **Scene transitions** between learning scenes (not slide cuts).
> 6. **Motion tokens**: named primitives (pop, glow, spotlight, morph, swap, sparkle…) each with duration/easing/scale values we encode once in `animation.ts`.
> Constraints: Readee indigo system, Baloo 2/Nunito, no native emoji, reduced-motion variants, tablet-first hit targets (≥44px), K attention spans (nothing longer than ~600ms per accent).
> Out of scope: lesson pedagogy, correct answers, silent-E-specific art direction.

## Success metric (adopted)

> **How fast can lesson #2 and #3 ship, feeling fundamentally different, with near-zero new application code?**
> Exemplar B's budget: 2 registry entries. Exemplar C's budget: 0.

Silent-E is the proving ground, not the product. The engine is the product.
