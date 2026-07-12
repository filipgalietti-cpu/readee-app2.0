# Claude Design brief — Reading Buddy (`/buddy`)

Paste the block below into Claude Design. Grounded in the real feature: a
real-time AI VOICE companion. The kid talks out loud to the Readee bunny —
asks what a word means, gets help sounding out words, hears a story, or just
chats. It's a live mic conversation with clear listening / thinking /
speaking states and a few modes.

```
Redesign the READING BUDDY page for Readee, a K-4 kids' reading app — a live
VOICE companion the child talks to out loud. The Readee bunny is the friend
who listens and talks back in real time: help me read, tell me a story, ask
what a word means, or just chat. It should feel like calling a warm, patient
friend, not using a tool.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet, speaking out loud. Often can't read
well yet — the interface must work almost entirely by voice, color, and the
mascot. Minimal text, huge tap targets. One kid per account.

THE BUNNY IS THE STAR
- The Readee BUNNY (wearing the kid's equipped outfit) is a BIG, friendly,
  live character centered on screen — the thing the child looks at and talks
  to. It's expressive and alive: it breathes/idles, its ears and eyes react,
  its mouth moves when it speaks. This is a companion, not an avatar in a
  corner.

THE CONVERSATION STATE (get this crystal clear — it's the core)
The child must ALWAYS know what's happening with one glance at the bunny:
- LISTENING — the bunny leans in attentively; a soft animated mic/waveform
  ring pulses with the child's voice. "I'm listening…"
- THINKING — a gentle "thinking" beat (the bunny tilts its head, soft dots /
  shimmer). "Hmm, let me think…"
- SPEAKING — the bunny's mouth moves and a soft glow/waveform emanates as it
  talks back. Optionally show the current line as captions for early readers.
- IDLE / READY — calm, waiting, inviting the child to tap and talk.
Use color + motion + the bunny's pose to carry these states, not paragraphs.

THE TALK BUTTON
- One big, unmissable MIC / TALK button anchors the screen — press-and-hold or
  tap-to-toggle. It visibly reacts (grows, ripples, glows) while the child
  speaks. A clear, gentle way to stop/interrupt the bunny too.

MODE PICKER
- A small friendly row of MODES the child can pick, each an illustrated chunky
  card with an icon: "Help me read" · "Tell me a story" · "Ask a word" ·
  "Chat." The active mode is clearly highlighted; switching is one tap. The
  bunny acknowledges the switch ("Okay, let's read together!").

WORD CARDS
- When a word comes up (the child asks what a word means, or is sounding one
  out), a WORD CARD animates in: the word big and clear, optionally broken
  into sounds/syllables, a "hear it" speaker button, and a tiny picture if it
  helps. Cards stack into a small "words we talked about" tray the child can
  revisit. These make the spoken help stick.

REWARD + MOTION
- Warm, springy, alive: the bunny bobs and reacts, the mic ripples, word cards
  pop in, gentle sparkles when the child nails a tricky word. Occasional
  carrots for effort. Never jarring — this is a calm, encouraging space.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Fonts: Baloo 2 display, Nunito body.
- Palette: indigo/violet (#4338ca → #7c3aed), gold carrots, watercolor/sky
  pastel background. Rounded chunky cards, one consistent shadow depth,
  Framer-Motion-style springy micro-motion.
- Bright, cozy, credibly educational — a friendly video-call warmth, not
  babyish.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems/coins); the Readee bunny (not a new mascot).
- B2C kid surface — one kid per account, no teacher/classroom anything.
- Desktop AND tablet layouts. The bunny + mic button stay large and central
  on both; the mode picker reflows without shrinking tap targets.

DELIVERABLE
A polished, responsive Reading Buddy screen: the big live bunny front and
center, the prominent mic/talk button, an unmistakable listening/thinking/
speaking state on the bunny, the 4-mode picker, and animated word cards with
a "words we talked about" tray. Show 3 states: idle/ready ("tap to talk"),
actively LISTENING (mic ripple + attentive bunny), and SPEAKING with a word
card animating in.
```
