# Claude Design brief — Practice runner (`/practice`)

Paste the block below into Claude Design. Grounded in the real runner:
2-try MCQ with wrong-choice grey-out, first-try-only scoring, per-question
3-line voiced feedback, hint costs fewer carrots, read-aloud is free, plus
several interactive question types beyond MCQ.

```
Redesign the PRACTICE RUNNER for Readee, a K-4 kids' reading app — the
full-screen quiz session where a child answers questions one at a time and
earns carrots. It should feel like a friendly game show, not a worksheet.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — big tap
targets, lots of audio, imagery and mascot feedback over text. One kid per
account.

SCREEN ANATOMY (one question at a time, full focus)
- Top: a slim progress bar / "Question 3 of 10", a live carrots counter, and
  a small close/exit. Keep it calm and uncluttered.
- The QUESTION: an illustration (most questions have an image), the prompt
  text, and an audio "read to me" speaker button. Audio auto-plays for K/1;
  for grades 2-4 it's a tap-to-hear button. Read-aloud is always FREE.
- The ANSWER AREA depends on question type (support all of these):
  · Multiple choice — 2-4 big rounded answer cards (text and/or image)
  · Fill in the blank / missing word
  · Sentence builder — tap word tiles into order
  · Category sort — drag/tap items into buckets
  · Tap-to-pair / matching — connect left items to right items
  · Sound/phoneme tap — tap the letter that makes a sound
  Design a coherent visual language so all types feel like the same game.
- A friendly READEE BUNNY mascot in a corner that reacts (idle → cheer on
  correct → gentle "oops" on wrong → level-up on a streak), wearing the kid's
  equipped outfit.

THE ANSWER FLOW (this is the important part — get it right)
- Kids get TWO tries on a multiple-choice question.
  · 1st wrong pick: that choice GREYS OUT + a short encouraging nudge appears
    that does NOT reveal the answer ("Not quite — listen again and try!").
    The kid picks again from the remaining choices.
  · 2nd wrong: the correct answer is revealed with a kind explanation.
  · Correct (either try): the right card turns green with a celebration.
- Only the FIRST try counts for the score/carrots — trying twice is safe and
  encouraged, never punished.
- Each question has THREE short spoken feedback lines: praise (correct),
  the no-spoiler nudge (1st wrong), and the reveal (2nd wrong). All are voiced
  — design a clear place for this feedback to appear/animate in (a speech
  bubble from the bunny works well).
- A HINT button is available; using it earns FEWER carrots (half). The
  read-aloud button costs nothing. Make the carrot trade-off legible but not
  scary.

REWARD + MOTION
- Carrots fly into the counter on a correct first try; satisfying pop/confetti
  micro-moments. A per-session streak indicator ("3 in a row!").
- Springy, joyful transitions between questions (slide/pop), never janky.
- End-of-session CELEBRATION screen: carrots earned, score, streak, the bunny
  celebrating, and a big "Keep going" / "Back to path" CTA.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Baloo 2 display, Nunito body. Indigo/violet (#4338ca → #7c3aed), gold
  carrots, watercolor/sky pastel background. Rounded chunky cards, one shadow
  depth, Framer-Motion-style micro-motion.
- Bright, encouraging, credibly educational.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems); the Readee bunny (not a new mascot).
- B2C kid surface — no teacher/classroom anything.
- Desktop AND tablet layouts. Answer cards must stay big and thumb-friendly.

DELIVERABLE
A polished, responsive practice-runner: the question view with image + prompt
+ read-aloud, big answer cards, the 2-try grey-out flow, the bunny + voiced
feedback bubble, hint/read-aloud buttons with the carrot trade-off, the
carrots/streak HUD, and the end-of-session celebration. Show 3 states: a
fresh multiple-choice question, the "1st try wrong" state (one choice greyed
+ nudge), and the correct/celebration state. Include one non-MCQ type (e.g.
sentence builder or matching) so the system covers more than multiple choice.
```
