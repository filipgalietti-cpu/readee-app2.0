# Claude Design brief — Placement test (`/assessment`)

Paste the block below into Claude Design. Grounded in the real placement
test: an adaptive 20-question run that climbs from Kindergarten-easy up to
4th-grade-hard, stops early after 3 wrong, and finds the child's just-right
reading level. It must NEVER feel like a scary exam.

```
Redesign the PLACEMENT TEST for Readee, a K-4 kids' reading app — the
adaptive quiz a child takes once to find their just-right reading level.
20 questions that start Kindergarten-easy and climb toward 4th-grade-hard,
with a gentle early stop after 3 wrong answers. It should feel like a warm
game the bunny plays WITH the kid — never a test, never scary.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — lean on
audio, big tap targets, imagery and the mascot over text. One kid per
account (never show child pickers). Many kids arrive nervous — the whole
job of this screen is to make it feel safe and fun.

FLOW (three moments)
- WARM INTRO: a friendly full-screen welcome. The Readee BUNNY (in the kid's
  equipped outfit) waves and says "Let's find your just-right level!" Frame
  it as a fun adventure, not a test — reassure that it's totally okay to not
  know some, and that questions may get trickier as we climb. One big "Let's
  go!" start button. Auto-voiced so pre-readers can follow.
- QUESTION FLOW: one question at a time, full focus. Each question shows an
  optional illustration, the prompt, and a "read to me" speaker (auto-plays
  for young kids). Big rounded ANSWER CARDS (2-4, text and/or image). Tapping
  an answer gives a warm, low-stakes confirm and springs to the next question
  — do NOT show harsh right/wrong grading mid-test; keep it encouraging and
  forward-moving so the kid never feels like they're "failing." A soft
  "nice!" / "good try!" is fine; a red X is not.
- The bunny sits in a corner cheering the kid on throughout — calm, warm,
  proud, never disappointed.

PROGRESS INDICATOR (make climbing feel good, not stressful)
- Show progress as a gentle CLIMB, not a clinical "Q 7 of 20" bar. A little
  path/mountain/ladder the bunny ascends as questions go by works well — the
  kid sees they're making their way up as things get a touch harder. Keep any
  count subtle and friendly.
- Because the test can stop early (3 wrong = we've found the level), never
  imply the kid "ran out" or lost — an early finish should feel like "great,
  we found your spot!" Nothing on screen should telegraph the wrong-answer
  count or make a kid dread a third miss.

REWARD + MOTION
- Springy, joyful transitions between questions (slide/pop), never janky.
- Small warm micro-moments on each answer (a sparkle, the bunny nod), the
  climb advancing. Save the big celebration for the results screen — here,
  keep it steady and safe.
- The final question hands off smoothly to the results reveal.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Baloo 2 display, Nunito body. Indigo/violet (#4338ca → #7c3aed), gold
  carrots, watercolor/sky pastel background. Rounded chunky cards, one shadow
  depth, Framer-Motion-style micro-motion.
- Bright, warm, reassuring, credibly educational — calm confidence over
  quiz-show intensity.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems); the Readee bunny (not a new mascot).
- B2C kid surface — no teacher/classroom anything.
- Desktop AND tablet layouts. Answer cards must stay big and thumb-friendly.

DELIVERABLE
A polished, responsive placement test: the warm bunny intro, the single-
question view with image + prompt + read-aloud + big answer cards, and the
gentle "climb" progress indicator. Show 3 states: the intro screen, a fresh
question mid-climb (early/easy), and a trickier question higher up (with the
bunny still encouraging). Keep every state feeling safe and un-test-like.
```
