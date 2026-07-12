# Claude Design brief — Journey (the "duolingo map")

Paste the block below into Claude Design. Grounded in the real `/journey`
data model: the kid's curriculum is **grade → domain → lessons**, each
lesson has a status (completed / current / locked / premium), computed from
practice_results + lessons_progress.

```
Redesign the "Journey" page for Readee, a K-4 kids' reading app — the full
reading path a child follows. Today it's a nested accordion / vertical
timeline (Grade → Domain → Lessons). Rebuild it as a Duolingo-style WINDING
MAP: a joyful, scrollable adventure trail of lesson nodes the kid climbs.
This is the big sibling of the mini path-teaser on the home screen — they
must feel like the same world.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — lean on
icons, node shapes, color and the mascot over text. One kid per account
(never show child pickers).

THE CORE IDEA — a vertical winding path
- Lessons are round NODES on a path that snakes down the screen (gentle
  left-right serpentine, like Duolingo's trail). The kid scrolls down to see
  what's ahead and up to see what they've conquered.
- Grouped into UNITS = the curriculum domains (Reading Literature, Reading
  Informational Text, Foundational Skills, Language). Each unit gets a bold
  colored "unit banner" header the path flows out of (unit name + a short
  friendly subtitle + how many lessons done), Duolingo-style. Give each unit
  its own accent color so sections read at a glance.
- The kid's Readee BUNNY mascot (wearing its equipped outfit) sits ON the
  current node — "you are here." A subtle idle bob.

NODE STATES (drive off real status)
- Completed: filled gold/violet with a check, a satisfying "done" look. Maybe
  a small star for high scores.
- Current: the biggest node, pulsing glow, with a "START" / "CONTINUE"
  call-out bubble pointing to it. Unmistakably the next thing to tap.
- Locked: greyed, flat, a small lock icon — clearly "not yet."
- Premium-locked: lock + a subtle gold shimmer; tapping opens the upgrade
  prompt (this is a Readee+ gate).
- Tapping an available node → drops the kid straight into that lesson.

PROGRESS + REWARD
- A slim progress rail or "X of N lessons" per unit, and an overall
  "you've completed N lessons" celebration moment at the top.
- Occasional REWARD nodes on the path between lessons (a treasure chest for
  finishing a unit — carrots/outfit reward). Milestone/checkpoint nodes at
  unit boundaries.
- Show the kid's streak + carrots up top so the map feels connected to the
  rest of the game.

GRADES
- Default to the child's current grade's path. Provide a light way to peek
  other grades (K-4) — a small grade switcher — without cluttering the map.
  Above-level grades read as "keep going to unlock."

VISUAL SYSTEM (match the rest of the redesigned app — this is not a rebrand)
- Fonts: Baloo 2 for display/headers, Nunito for body.
- Palette: indigo/violet primary (#4338ca → #7c3aed), soft watercolor/sky
  pastel background the path sits on. Gold for carrots/rewards.
- Rounded, chunky, soft-shadow nodes and banners; one consistent shadow
  depth. Springy Framer-Motion-style micro-motion (node pop on complete,
  bunny bob, current-node pulse, confetti at a unit checkpoint).
- Bright, cheerful, credibly educational — playful, not babyish.

HARD CONSTRAINTS
- NO native emoji — Lucide-style icons or illustrated art only.
- NO plain black text on colored surfaces.
- Carrots (not gems/coins); the Readee bunny (not a new mascot).
- B2C kid surface — no teacher/classroom anything.
- Desktop AND tablet layouts (design both). It's a vertical scroller, so the
  path should feel good in a tall column with generous side breathing room —
  don't stretch it edge-to-edge on wide screens.

DELIVERABLE
A polished, responsive Journey map: winding node path, colored unit banners,
the bunny on the current node with a START bubble, completed/locked/premium
node states, reward/checkpoint nodes, and a top progress + streak/carrots
strip. Show two states: a kid mid-journey (some units done, one in progress)
and a brand-new kid at the very start of Unit 1.
```
