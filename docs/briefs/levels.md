# Claude Design brief — Reader-level ladder (`/levels`)

Paste the block below into Claude Design. Grounded in the real system: kids
climb NAMED reader levels (Word Sprout → Page Turner → Story Hunter → … up to
level 1000) by earning LIFETIME carrots. Certain levels are milestones that
unlock a bunny outfit reward.

```
Redesign the LEVELS page for Readee, a K-4 kids' reading app — the reader-LEVEL
ladder the child climbs by earning lifetime carrots. Levels are NAMED and
themed (Word Sprout → Page Turner → Story Hunter → … all the way to 1000).
Rebuild it as a rewarding vertical CLIMB — a ladder / mountain trail the kid
genuinely wants to ascend to see what's next.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — lean on level
art, color, the mascot, and clear "how close am I" over text. One kid per
account (never show child pickers).

THE CORE IDEA — a vertical climb
- Levels stack UP the screen as a winding ladder / mountain path. The child
  scrolls DOWN to see how far they've climbed and UP to see the peak ahead —
  the ascent should feel long and aspirational (it goes to 1000), not a flat
  list.
- Each level is a themed STEP/NODE with its name (Word Sprout, Page Turner,
  Story Hunter…), its carrot threshold, and clear art. Named tiers get their
  own color families so the climb visibly changes as you rise (sprout greens →
  adventure violets → summit golds).
- The kid's Readee BUNNY mascot (in its equipped outfit) stands ON the current
  level — "you are here" — with a gentle idle bob, gazing upward at the climb.

CURRENT LEVEL + PROGRESS (the hero)
- Up top or pinned: a big CURRENT-LEVEL card — level name, number, the bunny,
  and a satisfying PROGRESS RING/BAR to the next level ("140 / 200 carrots to
  Story Hunter"). This is the emotional center: "you're SO close."
- Lifetime carrots total shown proudly — this is the currency that drives the
  climb (distinct from spendable carrots; make the "lifetime earned" framing
  clear but not confusing).

THE CLIMB AHEAD + MILESTONE REWARDS
- Below/above the current level, show the NEXT few levels so the next reward
  is always visible and tempting. Levels already climbed read as conquered
  (filled, a check/glow); upcoming levels read as "keep going."
- MILESTONE levels unlock a BUNNY OUTFIT — mark these clearly on the ladder
  (a treasure/gift node showing the outfit reward preview). Unlocked
  milestones celebrate; upcoming ones dangle the reward as motivation.
- A far-off SUMMIT (level 1000) visible as the ultimate goal at the top.

REWARD + MOTION
- Climbing feels great: level-up pop + confetti, the bunny hopping to the next
  step, the progress ring filling with a spring, carrots flying in, a shimmer
  on the next milestone reward. Springy, joyful, never janky.
- Show streak + carrots up top so the ladder feels connected to the rest of
  the game.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Fonts: Baloo 2 display, Nunito body.
- Palette: indigo/violet (#4338ca → #7c3aed), gold carrots, watercolor/sky
  pastel background the ladder climbs through. Rounded chunky nodes/cards, one
  consistent shadow depth, Framer-Motion-style springy micro-motion.
- Bright, aspirational, credibly educational — an adventurous ascent, not
  babyish.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems/coins); the Readee bunny (not a new mascot).
- B2C kid surface — one kid per account, no teacher/classroom anything.
- Desktop AND tablet layouts. It's a vertical scroller — keep the climb in a
  comfortable tall column with generous side breathing room; don't stretch it
  edge-to-edge on wide screens.

DELIVERABLE
A polished, responsive Levels ladder: the winding vertical climb of named,
themed levels, the hero current-level card with the bunny and progress ring to
the next level, conquered vs upcoming level states, milestone outfit-reward
nodes, the distant summit, and a top streak/carrots strip. Show two states: a
kid mid-climb (a few levels earned, close to the next milestone) and a
brand-new kid on level 1 (Word Sprout) looking up at the whole mountain.
```
