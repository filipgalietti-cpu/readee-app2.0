# Claude Design brief — Discovery library (`/discover`)

Paste the block below into Claude Design. Grounded in the real Discover
library: AI-written kid articles across 7 categories (science, history,
nature, inventions, sports, stories, math-in-real-life). The kid browses a
category grid, picks an article, and reads it. Redesign BOTH the browse grid
and the article reader.

```
Redesign the DISCOVERY LIBRARY for Readee, a K-4 kids' reading app — a
browsable library of AI-written kid articles the child explores for fun.
There are 7 categories (science, history, nature, inventions, sports,
stories, math-in-real-life). The kid browses categories, picks an article,
and reads it. It should feel like a wonder-filled "what do you want to learn
about today?" world, not a plain list.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — lean on big
category art, icons, imagery and the mascot over text. One kid per account
(never show child pickers).

SCREEN 1 — BROWSE / CATEGORY GRID
- A warm header where the Readee BUNNY (in the kid's equipped outfit) invites
  the kid to explore ("What do you want to discover today?"), voiced aloud.
- The 7 CATEGORIES as big, chunky, iconographic tiles — each with its own
  accent color and a distinct illustrated icon (science, history, nature,
  inventions, sports, stories, math-in-real-life) so they read at a glance
  without heavy reading. Tapping a category opens its articles.
- Within a category (or as featured rows on the landing grid), ARTICLE CARDS:
  a cover illustration, a short kid-friendly title, and a light "reading
  time" / difficulty pip. A "new" or "for you" flag is welcome. Keep cards
  big and thumb-friendly.
- A gentle way to see fresh/recommended articles up top so there's always an
  obvious thing to tap. Every category needs a designed state even when
  sparse — never a dashed-grey empty box; the bunny fills quiet spaces.

SCREEN 2 — ARTICLE READER
- Calm, focused reading surface. Big readable body text on a soft card
  (never plain black text on color) with generous line spacing — built for
  early readers. A cover illustration and the title up top.
- A "read to me" speaker button so the article can be read aloud; a clear
  reading position feel. Consider light word/line emphasis as it reads, but
  keep it uncluttered — the text is the star.
- The bunny is present but small and non-intrusive while reading (a corner
  buddy), popping up warmly at the end ("Nice reading! +carrots").
- Finishing an article awards carrots — a satisfying end-of-article moment
  with a "read another" / "back to discover" CTA.

REWARD + MOTION
- Springy tile and card hovers/taps, category color washes, carrots flying to
  the counter on finishing an article. Framer-Motion-style micro-motion
  throughout, never janky.
- Show the kid's carrots up top so Discover feels connected to the game.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Baloo 2 display, Nunito body. Indigo/violet (#4338ca → #7c3aed), gold
  carrots, watercolor/sky pastel background. Rounded chunky cards, one shadow
  depth, Framer-Motion-style micro-motion.
- Bright, curious, credibly educational — a "world to explore" feel.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems); the Readee bunny (not a new mascot).
- B2C kid surface — no teacher/classroom anything.
- Desktop AND tablet layouts. Tiles and article cards stay big and tappable.

DELIVERABLE
A polished, responsive Discover library in two views: (1) the browse grid
with the 7 colored category tiles + article cards + a featured/recommended
row, and (2) the article reader with big readable text, read-aloud, the
corner bunny, and the finish/carrots moment. Show the browse grid and one
open article. Make the 7 categories visually distinct at a glance.
```
