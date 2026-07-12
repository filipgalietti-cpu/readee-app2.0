# Claude Design brief — Stories library + reader (`/stories`)

Paste the block below into Claude Design. Grounded in the real data: 25
original decodable stories (5 per grade K-4), each with a cover image, a
sentence-per-line reader with a "listen again" audio button, and 3
comprehension questions at the end. Free tier unlocks 2 stories per grade;
the rest are Readee+ locked.

```
Redesign the STORIES page for Readee, a K-4 kids' reading app — a library of
25 original decodable stories (5 per grade, K-4) the child browses, picks,
and reads. Two surfaces to design: the LIBRARY GRID (browse + pick) and the
READER (read a story end-to-end). It should feel like a cozy bookshelf in a
game, not a file list.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — lean on big
cover art, color, and the mascot over text. One kid per account (never show
child pickers).

LIBRARY GRID — the bookshelf
- Stories are grouped into GRADE SECTIONS (Kindergarten → 4th Grade). Each
  section gets a bold friendly band header with a grade badge, a short
  subtitle, and a "X of 5 read" progress pill. Default-open the child's own
  grade; other grades read as "peek ahead / catch up."
- Each story is a big rounded COVER CARD: large cover illustration, the title,
  and a small progress state — Not started / Reading (a slim bar) / Finished
  (a gold check or star). Finished stories feel earned, not just marked.
- Free tier: the first 2 stories per grade are open; stories 3-5 show a
  Readee+ LOCK — a soft gold shimmer over the cover + a small lock badge.
  Tapping a locked card opens the upgrade prompt (Readee+ gate).
- The kid's Readee BUNNY mascot (in its equipped outfit) greets from the top
  of the page — a "pick a story!" moment — and fills any empty section.
- Show streak + carrots up top so the library feels part of the game.

READER — reading one story
- Full-focus reading view. Top: story title, a back-to-library arrow, and a
  slim "line X of N" progress rail. Calm and uncluttered.
- The story is presented ONE SENTENCE PER LINE (decodable text, generous
  size, great line spacing). The current line is highlighted/enlarged; past
  lines dim gently so the child always knows where they are.
- A prominent "LISTEN AGAIN" audio button reads the current line aloud
  (karaoke-style word highlight as it plays). Audio is always FREE. For K/1
  it can auto-play per line; grades 2-4 tap to hear.
- A big friendly NEXT control advances a line/page; the cover art or a small
  scene illustration anchors the page so it doesn't feel like a wall of text.
- The bunny sits in a corner reacting warmly as the child reads on.

STORY END — 3 comprehension questions
- After the last line, a gentle "Great reading!" beat, then 3 comprehension
  questions in the same friendly answer-card style as the rest of the app
  (big rounded tappable cards, voiced prompt, warm correct/try-again
  feedback). Correct answers earn carrots that fly to the counter.
- Finish screen: carrots earned, a "story finished" badge on the cover, the
  bunny celebrating, and CTAs to "Read another" / "Back to library."

REWARD + MOTION
- Springy card hover/tap, cover pop when a story is opened, page turns that
  feel like a real book (soft slide/flip), carrots flying on a correct answer,
  a satisfying "finished" stamp on the cover.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Fonts: Baloo 2 display, Nunito body.
- Palette: indigo/violet (#4338ca → #7c3aed), gold carrots, watercolor/sky
  pastel backgrounds. Rounded chunky cards, one consistent shadow depth,
  Framer-Motion-style springy micro-motion.
- Bright, cozy, credibly educational — a warm reading nook, not babyish.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems/coins); the Readee bunny (not a new mascot).
- B2C kid surface — one kid per account, no teacher/classroom anything.
- Desktop AND tablet layouts. Cover cards stay big and thumb-friendly; the
  reader text stays large and readable in a comfortable column.

DELIVERABLE
A polished, responsive Stories experience: the grade-sectioned library grid
with big cover cards, progress states, and Readee+ locks on stories 3-5; and
the reader view with sentence-per-line text, the LISTEN AGAIN button, the
bunny, and the 3-question comprehension ending. Show 3 states: the library
mid-progress (some read, some locked), the reader on an active line with audio
playing, and the story-finished celebration.
```
