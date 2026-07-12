# Claude Design brief — Fluency check (`/fluency`)

Paste the block below into Claude Design. Grounded in the real fluency check:
the kid reads a short passage ALOUD while the mic listens, then gets friendly
feedback on words-per-minute and expression. Redesign the read-aloud screen
(passage, record/listening state) and the results view with the bunny.

```
Redesign the FLUENCY CHECK for Readee, a K-4 kids' reading app — the screen
where a child reads a short passage OUT LOUD while the microphone listens,
then gets warm feedback on their reading speed (words per minute) and
expression. It should feel like reading to a friendly bunny who's listening
proudly — not a speaking test being scored against them.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet with a mic. Low reading ability —
the passage must be BIG and easy to read, with lots of reassurance and the
mascot over dense text. One kid per account (never show child pickers).

FLOW (three moments)
- GET READY: a warm intro where the Readee BUNNY (in the kid's equipped
  outfit) says "Read this to me out loud — I'm listening!" Explain simply
  that the mic will listen and it's okay to go at their own pace. A big
  "I'm ready" button that starts listening. Handle mic-permission gracefully
  with kid-friendly language.
- READ ALOUD (the core screen): the PASSAGE displayed large and highly
  readable — generous font size and line spacing, short lines, soft card
  surface (never plain black text on color). A clear, unmistakable LISTENING
  state: an animated "I'm listening" indicator (pulsing mic / soundwave /
  the bunny leaning in with an ear), so a pre-reader knows recording is live.
  Optional gentle word-by-word highlight to help the kid keep their place as
  they read. A big obvious "Done reading" button, plus a calm way to stop or
  restart without fear. Keep controls simple — one primary action at a time.
- RESULTS (friendly, never harsh): the bunny reacts proudly. Show
  words-per-minute and expression as warm, legible visuals — a speed
  meter/gauge and an expression readout framed positively ("Smooth and
  clear!" / "Great pace!"). Celebrate effort and improvement; frame any
  growth area as the fun next goal, never a red fail. A "read it again" retry
  and a "done" CTA. Award carrots for completing the read.

REWARD + MOTION
- The listening indicator animates continuously and calmly while recording.
- Results land with a springy reveal: the speed meter filling, the bunny
  cheering, carrots flying to the counter. Framer-Motion-style micro-motion,
  never janky. Retry feels inviting, not remedial.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Baloo 2 display, Nunito body. Indigo/violet (#4338ca → #7c3aed), gold
  carrots, watercolor/sky pastel background. Rounded chunky cards, one shadow
  depth, Framer-Motion-style micro-motion.
- Bright, warm, encouraging, credibly educational — "read to a friend" vibe.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems); the Readee bunny (not a new mascot).
- B2C kid surface — no teacher/classroom anything.
- Desktop AND tablet layouts. The passage stays big and readable on both.

DELIVERABLE
A polished, responsive fluency check: the "read this to me" bunny intro, the
big readable passage with a clear animated LISTENING state and a "Done
reading" button, and the friendly results view (speed meter + expression
readout + proud bunny + carrots + retry). Show 3 states: get-ready, actively
listening (mid-read), and the warm results reveal. Keep every state framed as
proud effort, never a harsh score.
```
