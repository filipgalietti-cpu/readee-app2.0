# CONTENT_SPEC — the quality bar every Readee asset must meet

This is the single source of truth that every generator prompt and every
audit check must cite. If the audit and a generator disagree, both are
wrong against this doc — not against each other.

Owner: Filip. Last revised: 2026-05-13.

---

## Why this doc exists

Quality was scattered across generator prompts, audit judges, and the
hand-built K canon. Different parts of the pipeline encoded different
opinions, so the audit fought the generator and both fought the
content already in production. This doc collapses those into one.

There is no human reviewer in the loop. The spec + the deterministic
checks + the multi-judge committee + kid feedback are the only
quality gates. They have to be right.

---

## 1. Lessons

A lesson is a slideshow that teaches one CCSS standard. Same shape K-4.

### 1.1 Length & structure

- **3–8 slides per lesson** is the target. Anything past 8 should be a
  second lesson on the same standard.
- Slide types: `intro` → `teach` (1+) → `example` (1+) → `tip` (optional) → `mcq` (1+).
- The final 1–3 slides are `type: "mcq"` and reference practice questions
  by `mcqId`. MCQ slides have no `steps` array — they're a pointer.

### 1.2 Slide content rules

Each non-mcq slide has:

- `heading` — short title (≤ 6 words).
- `imageFile` + `imagePrompt` (see §3).
- `steps[]` — sub-steps that drive the karaoke narration.

A slide may use **one** rich step with internal `displayParts` staggering
**or** multiple sub-steps. Both are K-canon-compliant. The hard rule is
that the slide must have at least one of the animation primitives
(`displayParts`, `highlightPills`, `highlightWord`, `displayDiagram`,
`afterPhonemes`, `sfxClaps`, `displayTableRow`) — text without animation
is not acceptable.

### 1.3 Step content rules

Each step has:

- `sub` — letter, sequential (`a`, `b`, `c`, …).
- `audioFile` — path under `audio/lessons/{standard}/S{N}{sub}.mp3`.
  **Every step has its own audio file**, never shared across sub-steps.
  Sharing audio across sub-steps re-introduces karaoke timing desync.
- `ttsScript` — what the TTS will say. Plain English, no markdown, no
  emoji. Must match the step's audio file content.
- One or more animation primitives keyed to the audio timing:
  - `displayParts`: array of `{ text, delay }` revealing text in sync
    with the audio.
  - `highlightWord`: a word from the `ttsScript` to highlight in the
    rendered text. Must literally appear in the `ttsScript`.
  - `highlightPills`: pill highlights for short keywords.
  - `displayDiagram`: letter-by-letter or digraph reveal (phonics only).
    Each `letter.text` is ONE letter or a digraph/trigraph. Never a
    whole word.
  - `afterPhonemes`: phoneme audio queue (RF.K.x / RF.1.x only).
  - `sfxClaps`: clap sfx timings (typically on the closing step).

### 1.4 Animation-must-time-with-audio

Every animation primitive's `delay` field must fit inside the actual
audio duration. Reveals that fire after the audio ends look broken.
The audit measures audio file duration and rejects steps whose
animations extend past it.

### 1.5 Animation-must-relate-to-the-words

- `highlightWord.word` must literally appear in the step's `ttsScript`.
- Every `displayParts[].text` must be a contiguous slice of `ttsScript`
  (after stripping punctuation and case-folding). Animations that
  reveal text the TTS doesn't say are forbidden — that's the "weird"
  feeling Filip flagged.

### 1.6 TTS rules (grade-conditional)

- **K & G1**: TTS is **required** on every step. No silent steps.
- **G2–G4**: TTS is **optional** per step but required on every
  `teach`-type slide (kids who can't read still need to hear the
  instruction). Tip/example slides may render silent if the visual
  is self-explanatory.

### 1.7 TTS content rules

- `ttsScript` must read naturally. No bracketed stage directions, no
  asterisks, no parenthetical phonetic guides.
- After audio generation, a transcript round-trip must match the
  `ttsScript` (case-insensitive, punctuation-tolerant) to within an
  edit distance of ~5%. Larger drift = the TTS hallucinated.
- No banned vocabulary (see `lib/ai/qc.ts → containsBannedWord`).
- For phonics lessons (`RF.K.x` / `RF.1.x` / `RF.2.3` family), the
  TTS may include slash-delimited phoneme cues (`/k/ /a/ /t/`); these
  are rendered as discrete sounds by the renderer.

---

## 2. Questions

Every practice question targets exactly one CCSS standard and uses the
question type that best tests that skill. Type mismatches were the #1
real bug we shipped against; this section is strict.

### 2.1 Question types and when to use each

| Type | Use when | Example standards |
| --- | --- | --- |
| `multiple_choice` | One correct answer among 3–4 distractors. Default for comprehension, vocabulary-in-context, fact-recall. | RL.x.1, RI.x.4, L.x.4 |
| `missing_word` | A sentence with one blank; pick the word that fits. Best for vocabulary, syntax, context-clues. | L.x.4, L.x.5 |
| `sentence_build` | Drag words into the right order to form a sentence. Best for syntax, sentence-construction, grammar. **Never** use for skills that don't involve sentence assembly. | L.x.1, L.x.2 |
| `category_sort` | Drag items into the correct group. Best for word relationships, classification. | L.K.5, L.x.5 |
| `tap_to_pair` | Match items in column A to column B. Best for synonyms, antonyms, cause/effect. | L.x.5, RL.x.3 |
| `sound_machine` | Pick the sound a letter / digraph makes. Phonics only. | RF.K.x, RF.1.x |
| `space_insertion` | Add spaces between run-on words. Print awareness only. | RF.K.1 family |

**Decision rule:** if the prompt literally says *"sort these into..."* the
type is `category_sort`. *"Put the words in order"* → `sentence_build`.
*"Fill in the blank"* → `missing_word`. *"What word do you read first"*
→ `multiple_choice`. The `judgeBetterFormat` audit enforces this.

### 2.2 MCQ rules

- Exactly **4** choices. Never 2, never 3, never 5.
- All 4 choices are unique (exact trim, case-preserving). Case-insensitive
  dedupe would false-positive on conventions questions (RF.1.1a, L.1.2)
  where similar-looking choices that differ only in capitalization or
  punctuation are the point of the question.
- Exactly **1** correct answer; the `correct` field must match one of
  the `choices` strings byte-for-byte.
- Distractors must be plausible. No "obviously wrong" filler like
  random unrelated nouns.
- No self-leak: the correct answer must not appear in the prompt
  (`judgeNoSelfLeak`).

### 2.3 Image rules

Some questions have an associated image, some don't:

- Image **required**: vocabulary-in-picture, sequencing, "which one
  is X", matching-the-picture-to-text.
- Image **forbidden**: questions where the kid must read the text alone
  (e.g., "Put these words in order to form a sentence" — the image
  would give the answer away).
- When present, the image must follow §3 style rules and contain no
  text/letters/numerals (the question text already provides those).

### 2.4 Question TTS rules

**MCQ TTS (when audio is present):** reads the prompt, pauses, then
reads each of the 4 choices in turn with a brief gap. Format:

```
"<prompt>. Choice A: <a>. Choice B: <b>. Choice C: <c>. Choice D: <d>."
```

For G2–G4, the audio omits the choices by design (kids should be
reading them); only the prompt is narrated. This is captured in
`defaultPerQuestionTts` in the TTS generator.

**Other question types:** the audio reads a brief stage-setting line
then the prompt. Example for `missing_word`:

```
"Fill in the blank with the word that fits best. <prompt>"
```

For `sentence_build`:

```
"Put these words in the right order to build a sentence. <prompt>"
```

For `category_sort`:

```
"Sort these words into the correct group. <prompt>"
```

**TTS required/optional, same as lessons:**
- K & G1: **required** on every question.
- G2–G4: **optional**. The renderer disables the audio button when
  `audio_url` is null and grade ≥ G2.

### 2.5 Standard alignment

`judgeShouldBeAsked` must rate the question `valid` against its
standard. The judge gets the CCSS standard description text and 3
hand-audited K-canon reference questions for that domain as the
calibration anchor. Verdict `invalid` = `q.should_be_asked` fail =
auto-quarantine.

---

## 3. Images

Every image (lesson slide images + question images) follows the same
style so the app feels consistent.

### 3.1 Style boilerplate

Every `imagePrompt` must end with this exact suffix:

```
Clean pastel background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.
```

The first sentence of the prompt describes the subject. Examples in
the K canon are the reference for "what good looks like."

### 3.2 Hard rules

- No text, letters, numerals, or word-bubbles in the image. The
  vision model is asked to verify this on every generated asset
  (`q.image_quality` judge).
- No real human faces; cartoon characters only. No celebrities.
- No real-world logos, brands, or copyrighted characters.
- Embedded vision check: the rendered image must score ≥ 0.30 cosine
  similarity against a CLIP-embedded version of the prompt. Lower =
  the model produced something unrelated.

### 3.3 "Not weird" check

The `q.image_quality` AI judge flags glitched anatomy, distorted
shapes, melted textures, or anything that fails a "would Jen show
this to a 5-year-old" smell test. Two-model committee from Phase 2:
Gemini + Claude both must say acceptable.

---

## 4. Stories

Stories are the most scalable asset because a story is just `prompt
→ TTS → 3 follow-up questions`. We can generate infinite stories with
near-zero failure surface if the prompt + questions follow the spec.

### 4.1 Story shape

- `title` — short, kid-friendly.
- `grade_level` — K through 4.
- `body` — 4–10 short sentences, decodable for the target grade.
- `cover_image` — single illustration, §3 style.
- `audio_url` — full-body TTS narration. **Required for all grades**
  (stories are read-aloud by default, even at G4 — that's the format).
- `questions[]` — exactly **3** comprehension questions:
  - 1 × literal recall (RL.x.1)
  - 1 × inference (RL.x.3 or RL.x.4)
  - 1 × theme/lesson (RL.x.2)
- Each question is a `multiple_choice` with the standard MCQ rules
  from §2.

### 4.2 Decodability by grade

- K: only Dolch pre-primer + primer words.
- G1: K vocabulary + first-grade Dolch.
- G2: G1 vocabulary + second-grade Dolch.
- G3 & G4: open vocabulary, but no words above the grade's
  Lexile band (140–820L for G2, 230–950L for G3, 470–1010L for G4).

### 4.3 Quality enforcement

- TTS round-trip transcript match (same as §1.7).
- Comprehension questions must each pass `q.should_be_asked` against
  the story body (not just the standard).
- Story body must pass a flesch-kincaid reading-level check for the
  target grade (deterministic, no AI judge needed).

---

## 5. The pipeline rules

The pipeline runs nightly, asynchronously, forever. These rules keep
quality from drifting as volume scales.

### 5.1 Best-of-N generation

Every generator slot produces **3 candidate assets**. All 3 go through
the audit. The highest-scoring candidate publishes; the other 2 are
discarded. Cost is ~3× per slot but quality bar rises substantially.

### 5.2 Multi-judge committee on soft checks

Any judge that can't be deterministic (`slide.judge`,
`q.should_be_asked`, `q.image_quality`, `step.audio_quality`,
`q.audio_quality`) runs through **2 different models** (Gemini 2.5
Flash + Claude Haiku 4.5). Both must agree on `pass`/`warn` for the
content to publish. Disagreement → `warn` (publishes but flagged) or
`fail` if both disagree negatively → quarantine.

### 5.3 Calibration anchor on every soft judge

Every soft judge gets, in its prompt:
1. The CCSS standard text.
2. Three hand-audited K-canon reference assets for the same domain.

These come from `lib/qc/calibration.ts` (already built). No soft
judge runs without an anchor — that was the #1 false-positive source
in today's audit pass.

### 5.4 Kid feedback as the post-publish review

The thumbs primitive (`Phase 2 — Kid feedback loops` shipped) is the
only post-publish QA. Rules:
- 3 thumbs-down on the same piece within 7 days → auto-archive.
- Thumbs-down rate per generator prompt feeds back as a quality
  signal to the caps engine.
- Aggregated weekly into a `/owner` panel: "what the kid base is
  telling us."

### 5.5 Caps engine drives ramp

Two signals feed `content_production_caps`:
- `first_pass_pass_rate` — % of new generations that pass audit on
  first try. Threshold: ≥ 80% for 7 consecutive days → caps step up.
- `kid_thumbs_down_rate` — % of published content that hit the 3-
  thumbs-down trigger. Threshold: ≤ 5% for 7 days → caps step up.
  Above 10% → caps step DOWN.

No human knob. The engine adjusts itself.

### 5.6 Pre-publish gate

A piece publishes only if:
1. Every deterministic check passes (this doc's hard rules).
2. The multi-judge committee returns `pass` or `warn` (never `fail`).
3. Required assets (audio for K/G1, image when type demands it) are
   present and asset checks pass.

Otherwise → `published_state='hidden'` and enters the heal queue. If
the heal cron can't fix it in 14 days, the triage cron archives it.

### 5.7 Lineage + rollback

Every published piece carries `lineage_id` + `version`. When kid
feedback or a later audit pass quarantines a piece, the row stays
(archived) so the generator's failure surface is visible in the
prompt-tuning dashboard. We don't delete; we archive.

---

## 6. What this doc explicitly does NOT cover

- Teacher-side content. This product is B2C only (see
  `feedback_b2c_only.md`).
- Multi-child parent accounts. 1 parent : 1 child (see
  `feedback_no_multi_child.md`).
- Premium gating. Plan limits live in `lib/plan/limits.ts`.

---

## 7. Change history

- 2026-05-13 — Filip dictated the spec; Claude formalized this doc.
  First version is the baseline; subsequent edits should bump the
  version stamp at the top and append a one-liner here.
