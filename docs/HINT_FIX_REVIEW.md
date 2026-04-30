# Duplicate-Choice Fix Review — 7 questions

_Each row: current state → proposed fix → audio strategy. Mark each
with ✅ approve / ❌ different / ✏️ tweak before I touch the manifest._

## Audio note (read first)

The current question audio file recites the prompt AND all four choices
out loud ("...Which sentence is correct? I like pizza? I LIKE PIZZA?
I Like Pizza? I like pizza? What do you think?"). For visual-only
questions (capitalization, punctuation), reading the choices aloud
is useless — they all sound the same. Filip's preference (Apr 27):
**audio reads the question prompt only, kid looks at the choices**.

So for these, I'd regenerate the audio file to be **prompt-only** —
narrator reads "Which sentence has correct capitalization?" and stops.
The kid reads the four written choices visually.

For genuinely sound-different questions (phoneme blending, letter
names), narrator reads the full prompt + choices as before.

---

## 1. `K.L.2-Q1` — Kindergarten — Sentence capitalization

**Prompt:** Which sentence has CORRECT capitalization?

**Current choices:** `["I like pizza", "I LIKE PIZZA", "I Like Pizza", "I like pizza"]` ⚠️ duplicate "I like pizza"

**Correct:** `"I like pizza"`

**Wait — bug deeper than the duplicate.** The "correct" answer is `"I like pizza"` — but a sentence should start with a capital I. So the *current* correct answer is also wrong. The right correct answer should be `"I like pizza."` (capital I, lowercase rest, period at end) and the duplicate should be `"i like pizza"` (lowercase i, the obvious wrong).

**Proposed fix:**
- Choices: `["i like pizza", "I LIKE PIZZA", "I Like Pizza", "I like pizza."]`
- Correct: `"I like pizza."` (changed)
- Hint: "A sentence starts with one capital letter and ends with a period."

**Audio:** Prompt-only (choices look-different, sound-same).

---

## 2. `K.L.2-Q4` — Kindergarten — Name capitalization

**Prompt:** Which name is written CORRECTLY?

**Current choices:** `["SAm", "SaM", "Sam", "Sam"]` ⚠️ duplicate "Sam"

**Correct:** `"Sam"`

**Proposed fix:**
- Choices: `["SAm", "SaM", "sam", "Sam"]`
- Correct: `"Sam"` (no change)
- Hint: "A name starts with one capital letter."

**Audio:** Prompt-only.

---

## 3. `K.L.2-Q5` — Kindergarten — Sentence with punctuation

**Prompt:** Which sentence is CORRECT?

**Current choices:** `["The Dog is big.", "The dog is big", "The dog is big", "The dog is big."]` ⚠️ duplicate "The dog is big" (no period)

**Correct:** `"The dog is big."`

**Proposed fix:**
- Choices: `["The Dog is big.", "the dog is big.", "The dog is big", "The dog is big."]`
- Correct: `"The dog is big."` (no change)
- Hint: "Look at the first letter and the end of the sentence."

**Audio:** Prompt-only.

---

## 4. `RF.1.1a-Q3` — 1st Grade — Sentence formation

**Prompt:** Which is a correct sentence?

**Current choices:** `["The dog ran fast", "The dog ran fast.", "The dog ran fast.", "The Dog Ran Fast"]` ⚠️ duplicate "The dog ran fast."

**Correct:** `"The dog ran fast."`

**Proposed fix:**
- Choices: `["The dog ran fast", "the dog ran fast.", "The Dog Ran Fast", "The dog ran fast."]`
- Correct: `"The dog ran fast."` (no change)
- Hint: "A correct sentence has a capital first letter and ends with a period."

**Audio:** Prompt-only.

---

## 5. `RF.K.1d-Q1` — Kindergarten — Letter case

**Prompt:** Which is the UPPERCASE (capital) version of the letter **a**?

**Current choices:** `["A", "B", "A", "D"]` ⚠️ duplicate "A"

**Correct:** `"A"`

**Proposed fix:**
- Choices: `["a", "A", "b", "B"]` (mix cases — kid has to identify the capital A specifically, not just any uppercase letter)
- Correct: `"A"` (no change)
- Hint: "Capital A is bigger and has a flat top."

**Audio:** Full regen — narrator says "lowercase a, capital A, lowercase b, capital B" — these DO sound different and the audio actually helps.

---

## 6. `RF.K.1d-Q2` — Kindergarten — Letter case

**Prompt:** Which is the LOWERCASE (small) version of the letter **G**?

**Current choices:** `["G", "J", "G", "Q"]` ⚠️ duplicate "G"

**Correct:** `"G"` ⚠️ Bug: correct should be lowercase "g", not capital "G".

**Proposed fix:**
- Choices: `["G", "g", "j", "q"]`
- Correct: `"g"` (changed — was wrong)
- Hint: "Lowercase g has a tail that hangs down below the line."

**Audio:** Full regen. Narrator: "capital G, lowercase g, lowercase j, lowercase q."

---

## 7. `RF.1.2b-Q3` — 1st Grade — Phoneme blending

**Prompt:** Blend these sounds: /s/ /t/ /o/ /p/. What word?

**Current choices:** `["Stomp", "Step", "Stop", "Stop"]` ⚠️ duplicate "Stop"

**Correct:** `"Stop"`

**Proposed fix:**
- Choices: `["Stomp", "Step", "Spot", "Stop"]` (Spot = same letters rearranged, good distractor)
- Correct: `"Stop"` (no change)
- Hint: "Say each sound slowly, then slide them together."

**Audio:** Full regen. These are genuinely different-sounding words, narration helps.

---

## Summary

| # | ID | Grade | Audio strategy | Correct changes |
|---|---|---|---|---|
| 1 | K.L.2-Q1 | K | prompt-only | yes (added period) |
| 2 | K.L.2-Q4 | K | prompt-only | no |
| 3 | K.L.2-Q5 | K | prompt-only | no |
| 4 | RF.1.1a-Q3 | 1st | prompt-only | no |
| 5 | RF.K.1d-Q1 | K | full regen | no |
| 6 | RF.K.1d-Q2 | K | full regen | yes (was uppercase, should be lowercase) |
| 7 | RF.1.2b-Q3 | 1st | full regen | no |

**Total audio regen:** 7 files (~$0.01).
**Manifest fixes:** 7 questions, hand-edited.
**Two correctness bugs caught:** Q1 (period missing on correct) + Q6 (correct was the wrong case entirely).

Mark up this file with ✅ / ❌ / ✏️ next to each row, and I'll execute.
