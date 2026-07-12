# Claude Design brief — Stories for me (`/stories-for-me`)

Paste the block below into Claude Design. Grounded in the real feature:
personalized AI stories generated just for THIS kid, about their interests.
The kid browses their own personal story shelf and reads them. Redesign the
shelf + the reader with a "made just for you" feel.

```
Redesign the STORIES FOR ME page for Readee, a K-4 kids' reading app —
a personal shelf of AI-written stories generated just for THIS child, about
the things they love. The kid browses their own shelf and reads them. It must
feel special and personal — "these stories were made just for YOU" — not a
generic library.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — lean on cover
art, icons, imagery and the mascot over text. One kid per account (never show
child pickers). The whole point is that this shelf belongs to THIS kid.

SCREEN 1 — MY STORY SHELF
- A warm, personal header: the Readee BUNNY (in the kid's equipped outfit)
  presents the shelf ("Stories made just for you!"), voiced aloud. Use the
  kid's name/identity so it feels owned.
- The stories as a real SHELF or cozy gallery of chunky book covers — each
  with a personalized illustrated cover, a kid-friendly title, and a subtle
  "made for you" / interest tag (e.g. dinosaurs, space, soccer) so the kid
  sees these match their world. Big, tappable covers.
- A clear, inviting way to REQUEST/GENERATE a new personalized story ("Make
  me a new story!") — framed as magical, with a light note that it's an AI /
  Readee+ feature where relevant. A pleasant "your story is being written"
  waiting state with the bunny (skeleton-style, never a lonely spinner).
- If the shelf is new/empty, a warm designed state inviting the first story —
  never a dashed-grey empty box.

SCREEN 2 — STORY READER
- Cozy, focused reading surface. Big readable body text on a soft card
  (never plain black text on color), generous line spacing, built for early
  readers. Cover illustration + title up top; illustrations between sections
  welcome.
- A "read to me" speaker button for read-aloud, with a clear reading position
  feel (optional gentle word/line highlight). Keep it uncluttered — the story
  is the star. The bunny is a small, non-intrusive corner buddy while reading.
- A satisfying end-of-story moment: the bunny celebrates, carrots awarded,
  and CTAs to "read again", "make another", or "back to my shelf".

REWARD + MOTION
- Springy cover hovers/taps, pages/sections turning with joyful transitions,
  carrots flying to the counter on finishing. The "made just for you"
  generation moment feels a little magical (sparkle, reveal). Framer-Motion-
  style micro-motion, never janky.
- Show the kid's carrots up top so the shelf feels part of the game.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Baloo 2 display, Nunito body. Indigo/violet (#4338ca → #7c3aed), gold
  carrots, watercolor/sky pastel background. Rounded chunky cards, one shadow
  depth, Framer-Motion-style micro-motion.
- Bright, personal, magical, credibly educational — "these are MINE."

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems); the Readee bunny (not a new mascot).
- B2C kid surface — no teacher/classroom anything.
- Desktop AND tablet layouts. Covers and reader text stay big on both.

DELIVERABLE
A polished, responsive Stories For Me in two views: (1) the personal story
shelf with chunky personalized covers, interest tags, and a "make a new
story!" action (plus the being-written waiting state), and (2) the cozy story
reader with big readable text, read-aloud, the corner bunny, and the finish/
carrots moment. Show the shelf and one open story. Make the "made just for
you" ownership feel unmistakable. Include the empty/first-story state.
```
