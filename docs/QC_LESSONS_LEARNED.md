# QC Lessons Learned

Append-only log of bug classes the QC pipeline didn't catch when they
first occurred, with the resulting auto-detect added afterward. The
goal is that every manual catch becomes an automated check, so the
bot gets smarter every cycle.

How to use this file:

1. When a content bug ships and a human catches it, append a new
   entry below.
2. The entry must include the **detection rule** (how a deterministic
   check would have caught it) and the **mitigation** (what shipped
   to prevent recurrence).
3. The detection rule should land in `lib/ai/qc-*.ts` as a real check
   on the same PR; the link below points at it.
4. Keep entries newest-first.

---

## 2026-05-08 — `lesson.step_audio_mismatch`

**Symptom.** AI-enriched lessons rendered with broken karaoke timing
after step a. Audio replayed the original full-sentence line on every
sub-step while displayParts only showed the truncated portion of that
line. Kids heard "Similes use like or as. Metaphors say it is. Idioms
have hidden meanings." three times in a row, while the screen showed
only "Similes use like or as." → "Metaphors say it is." → "Idioms
have hidden meanings." in sequence.

**Root cause.** `scripts/qc-enrich-lessons.ts` split each thin
audio-backed step into 2–3 sub-steps for K-style staggered reveals
but reused the original `audioFile` path on every sub-step. The
single mp3 still contained the original full line.

**Why the existing gates missed it.** The enricher's quality gates
checked for **structural** correctness (non-empty steps, well-shaped
`highlightWord` / `highlightPills`). Audio↔display semantic alignment
wasn't a structural property — every sub-step had a valid audioFile
and a valid ttsScript, just an inconsistent pair.

**Detection rule (now automated).** In `lib/ai/qc-lesson.ts`,
`checkLessonRichness` now flags any teaching slide where two or more
sub-steps share the same `audioFile`:

```
finding_type: lesson.step_audio_mismatch
severity: fail
condition: slide.steps.length >= 2 AND
           any duplicate audioFile across steps in the slide
```

**Mitigation.**

- `scripts/qc-enrich-audio.ts` — finds-affected-rows recovery script.
  Walks `lessons_db` rows where `source='ai_enrich'`, regenerates
  per-step TTS at `audio/lessons/{stdId}/S{n}{sub}.mp3`, marks each
  step with `audioRegenAt` for idempotency, logs every operation to
  `content_qc_log`.
- `scripts/qc-enrich-lessons.ts` — baked the per-step audio call
  into the enricher itself so future enrichment runs ship rows that
  satisfy the new check on first write. Skip with `--skip-audio`
  when iterating on prompt changes.

**Reference K pattern (the bar this enforces).** RF.K.3b slide 2:

```
step a → audio/lessons/RF.K.3b/S2a.mp3 ("Each vowel makes a short
                                          sound. A is for apple.")
step b → audio/lessons/RF.K.3b/S2b.mp3 ("E is for egg. I is for igloo.")
step c → audio/lessons/RF.K.3b/S2c.mp3 ("O is for octopus. U is for
                                          umbrella.")
```

---

## 2026-05-07 — Wrong-shape `highlightWord` / `highlightPills`

**Symptom.** Enricher emitted structurally valid JSON that the
renderer silently dropped. `highlightWord` came back as an array
instead of a single object; `highlightPills` had `{ text: "Cat" }`
instead of `{ pill: 0, delay: 0 }` (index into displayParts). Lessons
looked rich on inspection but animated nothing on screen.

**Detection rule.** Renderer-shape gate in `enrichSlide()` rejects
before DB write:

- `highlightWord` must be a single object `{ word, delay }`, never
  an array.
- `highlightPills[i]` must be `{ pill: number, delay: number }`, with
  `pill` in range of `displayParts`.
- `highlightPills` requires `displayParts` to index into.

**Mitigation.** Gates inline in `scripts/qc-enrich-lessons.ts`
`enrichSlide()`. System prompt rewritten with explicit renderer
schemas + concrete examples taken from K reference.

**Rule.** QC gates must validate against **renderer expectations**,
not just "non-empty" or "well-formed JSON." Read the actual renderer
interface in `app/components/lesson/LessonSlideshow.tsx` whenever
adding a new step-shape.

---

## 2026-05-07 — Empty-step lessons (the catastrophic incident)

**Symptom.** Enricher's `responseSchema` constrained Gemini's step
output with `properties: {}` (empty object). Gemini faithfully
complied by emitting `[{}, {}, {}]` for every slide. 10 lessons
corrupted in lessons_db; 2 (RI.1.10, RL.1.10) reached prod via the
hourly GitHub Action before a spot-check caught it.

**Detection rule.** Enricher quality gate rejects any step lacking
all three of `ttsScript`, `displayText`, and `audioFile` content.
Sync defense in `scripts/sync-content-from-db.ts` refuses to write
any lesson whose teaching-slide steps array contains empty objects.

**Mitigation.** Two-layer defense:

1. **Enricher gate** (write-side) — rejects empty-step output before
   DB write.
2. **Sync defense** (read-side) — refuses to propagate empty-step
   rows from DB to JSON even if a future bug slips past the enricher
   gate.

**Rule.** The autonomy loop is fast. If a generator is buggy, it's
buggy at scale within 30 minutes. Never rely on a single layer of
validation between AI write and renderer read.

---

## Process notes

- **K is the quality bar.** Filip audited K by hand. Every other
  grade and every AI-generated lesson must match K's animation,
  audio-segmentation, and pedagogical density. The audit checks
  encode K's profile; enrichment uses K as the few-shot reference.
- **Spot-check before scaling.** `--limit=1 --standard=X` followed
  by a SQL `jsonb_pretty(slides->1)` is the only reliable way to
  catch semantic bugs that pass structural gates. Don't trust
  "wrote N rows OK" success messages.
- **Every operation is logged.** `content_qc_log` records before/
  after pairs for every regen, with `agent` + `reason` + `finding_id`
  so the audit trail is reconstructable.
