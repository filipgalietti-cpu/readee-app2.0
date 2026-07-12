# Claude Design brief — Word bank (`/word-bank`)

Paste the block below into Claude Design. Grounded in the real feature: the
kid's collection of words they've tapped/learned (e.g. from Reading Buddy).
Redesign it as a fun, growing word collection the kid is proud of — word
cards, definitions, hear-it-again audio, and a "words I've collected" counter.

```
Redesign the WORD BANK for Readee, a K-4 kids' reading app — the personal
collection of words a child has tapped and learned as they read (e.g. from
Reading Buddy). It should feel like a treasured, growing COLLECTION the kid
is proud of — like a sticker book or trophy shelf of words — not a vocab
list.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — lean on word
cards, audio, icons and the mascot over dense definitions. One kid per
account (never show child pickers). The joy is watching the collection grow.

SCREEN ANATOMY
- A warm header where the Readee BUNNY (in the kid's equipped outfit)
  celebrates the collection, plus a prominent "WORDS I'VE COLLECTED" COUNTER —
  a big, satisfying number the kid feels proud of (and that visibly ticks up
  when new words are added). Consider a light milestone feel (collections at
  10, 25, 50 words earn a badge/carrots).
- The words as a grid/shelf of chunky WORD CARDS. Each card shows the word
  big and readable, a "hear it again" speaker button (audio pronunciation),
  and a short kid-friendly definition — flip or expand a card to see more
  (definition, maybe an example sentence or the story it came from). Cards
  are collectible-looking and satisfying.
- Light ways to browse the collection — newest first, by first letter, or a
  simple search — so a big bank stays fun to poke through. Keep controls
  minimal and kid-simple.
- An empty/new state that invites the first word warmly with the bunny
  ("Tap words while you read to collect them here!") — never a dashed-grey
  empty box.

INTERACTIONS
- Tapping the speaker on a card plays the word's pronunciation (always free).
- Tapping/flipping a card reveals its definition and detail with a springy
  motion.
- New words arriving animate IN — a card flying onto the shelf with a little
  celebration, the counter ticking up — so growth is visible and rewarding.

REWARD + MOTION
- Counter tick-ups, cards popping onto the shelf, milestone badge/carrot
  moments, springy card flips. Framer-Motion-style micro-motion, never janky.
- Show carrots up top so the bank feels part of the game; award carrots at
  collection milestones.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Baloo 2 display, Nunito body. Indigo/violet (#4338ca → #7c3aed), gold
  carrots, watercolor/sky pastel background. Rounded chunky cards, one shadow
  depth, Framer-Motion-style micro-motion.
- Bright, proud, collectible, credibly educational — a treasured word shelf.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems); the Readee bunny (not a new mascot).
- B2C kid surface — no teacher/classroom anything.
- Desktop AND tablet layouts. Word cards stay big and tappable on both.

DELIVERABLE
A polished, responsive Word Bank: the bunny header with the big "words I've
collected" counter, the shelf of chunky word cards (word + hear-it-again
speaker + definition on flip/expand), light browse/search controls, and a
milestone/badge moment. Show 3 states: the collection grid, a single card
expanded to its definition, and a new-word-arriving celebration. Include the
warm empty state for a kid with no words yet.
```
