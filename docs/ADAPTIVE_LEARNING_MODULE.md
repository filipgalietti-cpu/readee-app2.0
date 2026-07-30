# Readee Adaptive Learning Engine — "Readee Adapts"

A start-to-finish design for an AI adaptive-learning module that quietly
adjusts each lesson to the child in real time — challenging without
coddling — and makes that intelligence VISIBLE to parents as the core
selling point.

> **The one-line pitch (for parents):** *"Like a personal reading tutor
> who adjusts every lesson to your child — catching what they miss before
> it becomes a gap, and pushing them ahead the moment they're ready.
> Never too easy, never too hard."*

---

## 1. Why this sells

The #1 parent anxiety is binary and constant: *"Is my kid falling behind —
or bored and unchallenged?"* A one-size lesson can't answer it. A **human
tutor** can, which is why parents pay $60–100/hr for one. Readee Adapts
delivers the *legible feeling* of that tutor at software scale:

- **It's the subscription justification.** Personalization = tutor-quality = worth $9.99/mo.
- **It's visible.** Parents don't just trust it works — they *see* it working every week (see §6). That's the difference between a feature and a selling point.
- **It's a moat.** The value is in the captured signal + the engine tuned on it. A competitor can copy a lesson; they can't copy a year of your kid's learning fingerprint.
- **It targets the real fear.** "Readee noticed Maya was breezing through vowel teams and moved her ahead; she hit a wall on inferencing, so it re-taught it two ways — now she's got it." That sentence sells the plan.

---

## 2. Pedagogical spine (this is what keeps it from coddling)

Three research-backed principles, encoded as rules:

1. **Zone of Proximal Development (Vygotsky).** Keep every child in the band that is *challenging but achievable* — supported, not rescued.
2. **Mastery learning (Bloom).** You don't advance until you can *do* the skill. Struggle is met with another real rep, not a skip.
3. **Productive struggle.** A wrong answer is a teaching moment, not a failure to paper over. We scaffold and re-teach; we do **not** reveal the answer or wave them through.

**The anti-coddling contract (hard rules):**
- Never reveal the answer to end a struggle.
- Never let a child "pass" without demonstrating the skill (mastery gate).
- Dropping difficulty is a *temporary* scaffold that always **climbs back**.
- Praise effort + strategy ("you reread it — that's what good readers do"), not just correctness.
- The child never sees "you're struggling." Adjustments are **invisible** to the kid; only outcomes (a re-teach, another try) show.

---

## 3. What Readee already has (grounded — don't rebuild)

From the codebase research:

**Signals captured today**
- `practice_answers` — per-question `was_correct`, `type`, `standard_id` (the raw event stream).
- `child_skill_memory` — a live **SM-2 mastery model** per child×standard (ease, interval, `next_due`, `consecutive_correct`), auto-updated by a Postgres trigger on every `practice_results` insert. *This is our best existing adaptive control surface.*
- `assessments` — placement results; computes a **5-dimension profile** (phonics / vocabulary / literal / inferential / fluency) — but there's **no column to store it** (gap).
- `kid_feedback` — thumbs signal (content reception, not mastery).

**Adaptive machinery today**
- `lib/ai/build-path.ts` — learning path, but **static** (built once, linear cursor, never re-plans).
- SM-2 `/review` — **dynamic but between-session** (day granularity).
- `lib/adaptive/weak-spots.ts` — struggle detection, but **retrospective 30-day batch**, surfaced as a dashboard tile.
- `lib/ai/build-leveled.ts` — easy/on-level/advanced passage variants exist, but nothing **auto-serves** the right one.
- The fork coach loop (`InteractiveExample.tsx`) — has the UI hooks (`onWrong`, hint, retry) but **no escalation** and **records nothing**.

**The gap (what we build):** there is **no real-time, in-session engine**. Everything adaptive is between-session or retrospective. And the richest live signals — fork misses, attempts, hints used, response latency — are **thrown away** (ephemeral UI state).

---

## 4. Architecture — three layers

```
  SENSE                    DECIDE                        ACT
  (capture signal)   →     (struggle/stretch state)  →   (quiet intervention)
  answer funnels           the Controller                the Intervention Ladder
```

### Layer 1 — SENSE (instrument the thrown-away signal)
Add a single `onSignal(event)` callback prop to the three existing answer funnels — no rewrites:
- `handleForkWrong` / `InteractiveExample.pick` (LessonSlideshow) → `{fork_miss, isFirst, missCount}`
- `handleAnswer` (in-lesson MCQ, learn/page) → `{correct, choice, hintUsed, latencyMs}`
- `selectAnswer` (standalone, practice-store) → same
Persist to a new `learning_events` table (child_id, standard_id, kind, correct, attempts, hint_used, latency_ms, ts). This becomes the fuel — and a moat asset.

### Layer 2 — DECIDE (the Controller — a small state machine)
A per-session hook `useAdaptiveController()` reads a **rolling window** of the event stream (reuse `weak-spots.ts` thresholds, but on the last N items, not 30 days) and classifies state:

| State | Trigger | Meaning |
|---|---|---|
| **FLOW** | ~70–90% right, steady | in the ZPD — hold |
| **BREEZING** | all right, fast, no hints | too easy — push up |
| **STRUGGLING** | 2–3 misses / hints / slow | needs support |
| **FRUSTRATED** | still failing after support | needs a reset |

Seeded at session start by `child_skill_memory` (mastery) + the placement `dimension_profile` (which of the 5 axes is weak), so it adapts from turn one, not from cold.

### Layer 3 — ACT (the Intervention Ladder — escalate support, not ease)
On STRUGGLING, walk *up* the ladder — each rung adds support while keeping the challenge:
1. **Progressive hint** — a *better* hint (strategy, not answer). Fork already has one hint; make it 2–3 escalating.
2. **Re-teach micro-slide** — inject a 1-slide modeled example mid-flow (make `teachingSlides` stateful; the synthetic practice-intro injection is the existing precedent).
3. **Another rep, same level** — mastery: a fresh question on the same skill (reuse `buildSharpenDeck`). You don't move on until it clicks.
4. **Scaffold** — break the item into smaller steps (e.g. segment the word before blending).
5. **Only now — drop a level** — serve the `build-leveled` *easy* variant + re-teach, then **climb back** to on-level (never leave them down there).

On BREEZING, walk the *other* way:
6. **Skip mastered reps** — `child_skill_memory.consecutive_correct >= 3` → don't bore them.
7. **Stretch item** — inject a grade+1 question.
8. **Advance the path** — pull the next path item early; surface the *advanced* leveled passage.

### The between-session loop (close it)
- Every session's outcomes feed `child_skill_memory` (already wired) **and** trigger a **dynamic re-plan** of `learning_paths` (new: rebuild/reorder when a standard is struggled, instead of just advancing the cursor).
- Store the placement `dimension_profile` (add the column) and feed it into `build-path.ts` so the path targets the weak *axis*, not just coarse weak strands.

---

## 5. The kid experience (invisible adaptivity)

The child never sees a dial. They just experience a lesson that *happens* to fit:
- Miss the vowel-team fork twice → the bunny coach gives a sharper hint, then a quick "let's see one more together" re-teach, then a fresh word. They get it, feel smart, move on.
- Ace every question fast → the boring reps vanish, a spicier word appears, they level up sooner.
No "you failed," no "remedial" label. Just a lesson that feels made for them — because it was.

---

## 6. The parent-facing surface — where the selling point lives

This is the make-or-break. The engine is worthless as a *selling point* if parents can't see it. Two surfaces:

**A. "Readee Adapts" card on the parent dashboard** (always-on proof)
- A simple live readout per child: *"Currently working in the just-right zone. Moved ahead in phonics this week; getting extra support on inferencing."*
- Powered by the `learning_events` + `child_skill_memory` + `dimension_profile` — no new AI cost.

**B. Weekly Adaptive Insight** (the viral, retention moment)
- An AI-narrated 3-sentence story of the week (cheap — ~$0.005/child, reuses the conference-notes generator pattern):
  > *"Maya breezed through vowel teams, so Readee moved her up a level. She hit a wall on 'reading between the lines,' so Readee slowed down and re-taught it two ways — by Thursday she was nailing it. Next week: a stretch into longer stories."*
- Delivered in the existing weekly parent digest (Vercel Cron) — turns a data email into a *"my kid has a tutor"* email.

That sentence, landing in a parent's inbox every week, **is** the selling point.

---

## 7. Build plan — start to finish

| Phase | What | Effort | Depends on |
|---|---|---|---|
| **0. Instrument** | `learning_events` table + `onSignal` on the 3 answer funnels; store placement `dimension_profile` | S–M | — |
| **1. Controller** | `useAdaptiveController` state machine (in-memory), seeded by mastery + dimension profile | M | 0 |
| **2. Intervention ladder** | progressive hints + extra-rep (reuse `buildSharpenDeck`) — the low-effort rungs first | M | 1 |
| **3. Mid-lesson branching** | stateful `teachingSlides` + inject re-teach micro-slide + auto-serve leveled variant | M–L | 1 |
| **4. Between-session loop** | dynamic path re-plan; dimension_profile → `build-path` | M | 0,1 |
| **5. Parent surface** | "Readee Adapts" card + weekly Adaptive Insight (AI-narrated) | S–M | 0 |
| **6. Mastery gate** | don't advance a standard until `consecutive_correct` threshold; celebrate strategy | S | 1,2 |

**Ship order for fastest selling-point:** Phase 0 → 2 (real in-session adjustment on the cheap rungs) → **5** (make it visible to parents). That trio alone is demoable and sellable. Phases 3/4/6 deepen the moat.

---

## 8. Cost, risk, guardrails

- **Cost:** near-zero AI. Controller + interventions are deterministic logic over existing data. Only the weekly Insight uses an LLM (~$0.005/child/week, Gemini). Extra reps/leveled variants reuse content already generated.
- **Risk — over-intervening:** cap interventions per session (e.g. ≤2 re-teaches) so it doesn't feel like a slog. The Controller must also *back off* — if support isn't working after a reset, end the session gracefully with encouragement, not an infinite loop.
- **Risk — coddling drift:** the anti-coddling contract (§2) is enforced in code: no answer-reveal path, mastery gate on progression, level-drops auto-expire.
- **Risk — creepy/opaque to parents:** the Insight must be honest and specific, never fabricated. It narrates *real* events from `learning_events`.

---

## 9. Naming (parents respond to a name)
- **"Readee Adapts"** — plain, describes the benefit.
- **"Just-Right Mode"** — the Goldilocks framing (never too easy/hard) parents intuitively get.
- **"Reading Coach"** — leans on the tutor analogy.
Recommend **"Just-Right"** as the kid/parent-facing name for the *state* ("Maya's in her just-right zone"), with "Readee Adapts" as the feature name.

---

## 10. The north star
A parent opens Readee, sees *"Maya's in her just-right zone — moved ahead in phonics, getting extra support on inference,"* and thinks: **"This is watching my kid the way a great tutor would."** That feeling — legible, personal, always-on — is the product Readee is actually selling. The lessons are the substrate; the adaptivity is the pitch.
