# Claude Design brief — Review session (`/review`)

Paste the block below into Claude Design. Grounded in the real review: a
spaced-repetition session that resurfaces skills and words the kid got wrong
before, to lock them in. Same runner spirit as Practice, but framed as a
quick, encouraging "warm up your brain" flow — not a fresh quiz.

```
Redesign the REVIEW SESSION for Readee, a K-4 kids' reading app — a short
spaced-repetition session that brings back skills and words the child missed
earlier so they stick. It shares the practice runner's shape (one question at
a time, big answer cards, carrots) but is framed as a friendly "warm up your
brain!" — quick, encouraging, and about second chances, never punishing.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — big tap
targets, lots of audio, imagery and mascot feedback over text. One kid per
account (never show child pickers).

FRAMING (this is what makes review different from practice)
- WARM-UP INTRO: the Readee BUNNY (in the kid's equipped outfit) frames the
  session as a friendly brain warm-up / "let's lock these in!" — explicitly
  about revisiting things we've seen before, so a returning miss reads as
  "you've got another shot," never "you failed this again." Voiced aloud.
  Keep it SHORT — a few quick items, not a long slog.
- Throughout, tone is second-chance and confidence-building. Getting a
  previously-missed item right now is the hero moment ("You got it this time!
  Locked in.") — celebrate the comeback.

SCREEN ANATOMY (one item at a time, full focus)
- Top: a slim progress bar / "X to warm up", a live carrots counter, and a
  small close/exit. Calm and uncluttered.
- The ITEM: an optional illustration, the prompt, and a "read to me" speaker
  (auto-plays for young kids; tap-to-hear for older). Read-aloud always FREE.
- ANSWER AREA supports the same item types as practice — multiple choice
  (2-4 big rounded cards), fill-in-the-blank, sentence builder, matching,
  sound/phoneme tap, word cards. Coherent visual language so all feel like
  one game.
- The bunny reacts in a corner: idle → cheer on correct → gentle "let's try
  once more" on wrong → proud level-up when a previously-missed item is
  finally nailed.

THE FLOW
- Two tries on multiple choice, matching practice: 1st wrong greys that
  choice + a no-spoiler encouraging nudge; 2nd wrong reveals the answer
  kindly. Correct on either try turns the card green with celebration.
- Since these are RE-tries of past misses, lean even harder into
  encouragement — a mastered item can visually "graduate" (moves to a
  "locked in!" state) so the kid sees the pile of tricky things shrinking.
- A per-session "locked in" tally instead of a raw score — progress framed as
  words/skills mastered, not points lost.

REWARD + MOTION
- Carrots fly to the counter on a correct answer; springy question-to-question
  transitions (slide/pop), never janky. Satisfying "graduated / locked in"
  micro-moments when a tricky item is beaten.
- End-of-session CELEBRATION: how many skills/words locked in, carrots
  earned, the bunny celebrating, and a big "Done — great warm-up!" / "Back to
  path" CTA. If nothing is due for review, a warm all-caught-up state with
  the bunny (never a dashed-grey empty box).

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Baloo 2 display, Nunito body. Indigo/violet (#4338ca → #7c3aed), gold
  carrots, watercolor/sky pastel background. Rounded chunky cards, one shadow
  depth, Framer-Motion-style micro-motion.
- Bright, encouraging, second-chance energy, credibly educational.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems); the Readee bunny (not a new mascot).
- B2C kid surface — no teacher/classroom anything.
- Desktop AND tablet layouts. Answer cards must stay big and thumb-friendly.

DELIVERABLE
A polished, responsive review session: the "warm up your brain" bunny intro,
the single-item view with read-aloud + big answer cards, the 2-try grey-out
flow, the bunny reactions, and the "locked in" progress framing. Show 3
states: the warm-up intro, an item mid-review, and the "you got it this
time — locked in!" comeback celebration. Include one non-MCQ item type. Add
the all-caught-up empty state.
```
