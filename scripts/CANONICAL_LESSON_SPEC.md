# Canonical Lesson Spec — "the perfect one"

Derived from **L.4.4b** (frozen at `scripts/canonical-lesson.reference.json`), the
only lesson that passed all 25 rubric rules on **both** surfaces
(audio 0 fails · timing 100% · layout clean desktop + mobile).

This is the machine-checkable contract. Phase 1's `lint-lesson.ts` enforces
every **[INV-n]** invariant below; each maps to a rubric rule. A lesson that
satisfies all invariants **cannot** hit the bugs we've been chasing.

---

## Slide sequence (the canonical shape)

```
intro → teach (1–2) → example → tip → interactive → practice-intro → mcq (×N)
```

- **[INV-1]** Slide types appear in exactly this order (rubric #1). `teach` may repeat 1–2×. `example` and `practice-intro` may be omitted ONLY for pure phonics-drill standards (RF.*) that have no passage — flagged, not failed.
- **[INV-2]** Exactly one `interactive` fork, before the MCQs.
- **[INV-3]** ≥1 `mcq` slide, each `mcqId` resolves to a real question in the bank (rubric #24; this is the dead-link check).

## Headings
- **[INV-4]** Every teaching slide has a `heading` of **2–4 words** (rubric #2). Example heading ∈ {"Let's Try One", "Let's Try One Together!"}; practice-intro heading ∈ {"Time to Practice!"}.

## The critical layout invariant (prevents the mobile-blank bug)
- **[INV-5]** Every teaching slide **must END on a VISUAL step** (a step with `displayText`, `displayParts`, `displayTableRow`, `displayDiagram`, or `displayAlphabetGrid`) — NOT an audio-only step. (rubric #25.)
  - Exception: `example` may end audio-only because it accumulates its Q→A worksheet on mobile.
  - This is the exact rule L.4.4b satisfies (tip ends on `displayText` "Roots unlocked!") and the failing lessons violate (tip ends audio-only → mobile shows blank).
- **[INV-6]** Every `highlightWord` on a step must appear in that step's on-screen text (`displayText`/`displayParts`) — no highlighting a word that isn't shown (rubric #25/#15).

## On-screen text terseness (screen ANCHORS audio, never transcribes)
- **[INV-7]** `displayText` ≤ **5 words** for anchors; a passage/story step ≤ **16 words / 2 sentences** (rubric #3, #4).
- **[INV-8]** Each `displayParts[].text` ≤ **5 words**; a Q→A pair = exactly 2 parts, part[0] ends with "?" (rubric #4, #9).
- **[INV-9]** No full spoken sentence printed verbatim as a pill (heuristic: a `displayText` that equals/│⊇ the step's `ttsScript` and is >5 words) (rubric #3).

## Per-slide-type step patterns (from L.4.4b)
- **[INV-10] intro** — short anchor pills introducing key terms; ends on `displayParts` or `displayText` (rubric #7).
- **[INV-11] teach** — EITHER one concept per step as a short anchor, OR a `displayTableRow` set for structured items (roots, prefixes, features). A structured SET (≥3 related label→value rows) MUST use `displayTableRow`, not prose pills (rubric #8, #13).
- **[INV-12] example ("Let's Try One")** — framing (audio-only ok) → focal content (`displayText` word/passage) → Q→A pairs as `displayParts` with `highlightWord` → optional closing. Models the skill on concrete text before the fork (rubric #9).
- **[INV-13] tip** — one memorable trick; **last step visual** (see INV-5). Short anchor or a flowing "equation" `displayParts` (rubric #10).
- **[INV-14] practice-intro** — "Your turn!" framing + a couple anchor pills as `displayParts`; ends visual (rubric #11).
- **[INV-15] interactive** — one audio-only step (the spoken question) + an `interactive` payload: `kind` ∈ {tap, match}. tap = `choices[]` + `correct`; match = `leftItems/rightItems/correctPairs` (≥3 pairs), columns deranged (no straight-across giveaway). Fork tests the EXACT standard skill (rubric FORK, #20). No `imageFile` (bunny coach fills the panel).

## Assets
- **[INV-16]** Every teaching step with `ttsScript` has an `audioFile`, and that clip is NOT in `scripts/audio-audit.json` fails (rubric #18).
- **[INV-17]** Every teaching slide except `interactive` has an `imageFile`; the image has no baked-in text and matches content (rubric #19 — the ONE part needing vision, run only on changed images).
- **[INV-18]** Every step's timing is Whisper-derived (present in `scripts/slide-timings.json`), not a heuristic placeholder (rubric #16).

## Pedagogy
- **[INV-19]** No teaching word repeats across slides (teach word ≠ example word ≠ fork word) (rubric #21).
- **[INV-20]** Fork/MCQ distractors are same-category and plausible; Q2 never contains Q1's answer (rubric #22).
- **[INV-21]** Every slide earns its screen time — no step whose only content is filler with no visual and no teaching value (rubric #24).

---

## Rubric coverage by checker
- **Deterministic (linter, FREE):** INV 1–16, 18, 19, 20, 21 → rubric #1–4, 7–16, 18, 21, 22, 24 + the layout-structural parts of #25.
- **Vision (eyes, targeted only when visuals change):** INV-17 → rubric #19 (image slop) + the pixel-level parts of #25 (dead space / clipping / black-text).
- **Already have results (lookup):** audio #18 (`audio-audit.json`), timing #16 (`slide-timings.json`).

**Net:** ~20 of 25 rules enforced for $0 by the linter. Vision reserved for #19 + pixel-#25, on changed lessons only.
