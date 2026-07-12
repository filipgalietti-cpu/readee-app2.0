# Claude Design brief — Placement results (`/assessment-results`)

Paste the block below into Claude Design. Grounded in the real reveal after
the placement test: it shows the child's found reading level (a level meter),
a per-skill breakdown, and a big "start your path" CTA. This is a proud,
celebratory moment — the bunny is thrilled.

```
Redesign the PLACEMENT RESULTS page for Readee, a K-4 kids' reading app — the
big celebratory reveal right after a child finishes the placement test. It
tells the kid their just-right reading level, shows what they're already
great at, and launches them onto their reading path. This is a PROUD moment,
not a report card.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet, plus a parent likely watching over
the shoulder. Low reading ability — lean on the level meter, icons, the
mascot and audio over text. One kid per account (never show child pickers).

SCREEN ANATOMY (a reveal, then the payoff)
- THE REVEAL: a celebratory hero. The Readee BUNNY (in the kid's equipped
  outfit) cheers — confetti, a proud pose. A big warm headline naming the
  found reading level in kid-friendly language ("You're a Level 2 reader!" /
  the grade band), voiced aloud so pre-readers hear the good news.
- LEVEL METER: the star of the page. A satisfying meter/gauge/ladder that
  fills up to where the kid landed, so "how far I've come" is instantly
  legible without reading. Animate it filling on load.
- SKILL BREAKDOWN: a short, upbeat set of skill cards (e.g. phonics, sight
  words, comprehension, vocabulary) — each with an icon and a friendly
  "you're great at this!" / "we'll grow this together" tone. Never framed as
  failures or red marks; strengths celebrated, growth areas framed as the
  fun stuff coming next. Keep it skimmable — a few cards, not a data dump.
- CTA: one big, unmistakable "Start your path!" button that drops the kid
  into their Journey at the right spot. This is the single primary action.

REWARD + MOTION
- Big arrival celebration: confetti burst, the bunny leveling-up/cheering,
  the level meter filling with a springy ease, skill cards popping in one by
  one. Carrots can rain in as a "you earned these for finishing!" moment.
- Everything springy and Framer-Motion joyful, never janky. The reveal should
  feel earned — a beat of anticipation, then the payoff.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Baloo 2 display, Nunito body. Indigo/violet (#4338ca → #7c3aed), gold
  carrots, watercolor/sky pastel background. Rounded chunky cards, one shadow
  depth, Framer-Motion-style micro-motion.
- Bright, proud, celebratory, credibly educational — a trophy moment.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems); the Readee bunny (not a new mascot).
- B2C kid surface — no teacher/classroom anything.
- Desktop AND tablet layouts.

DELIVERABLE
A polished, responsive results reveal: the celebrating bunny hero, the
animated level meter as the centerpiece, an upbeat skill-strength breakdown,
and one big "Start your path!" CTA. Show the arrival state (mid-celebration,
meter filling, confetti) and the settled state (everything landed, CTA
inviting). Keep every skill framed as pride or fun-ahead — nothing that reads
as a bad grade.
```
