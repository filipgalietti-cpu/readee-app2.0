# Claude Design brief — More hub (`/more`)

Paste the block below into Claude Design. Grounded in the real page: a hub
that links the secondary features (Ask Readee, Fluency Check, Word Bank,
Placement Test, Analytics, Community Library). It's currently a plain tile
grid — redesign a light, cohesive tile hub that matches the kid home.

```
Redesign the MORE hub for Readee, a K-4 kids' reading app — a light landing
page of big iconographic tiles that link to the app's secondary features:
Ask Readee, Fluency Check, Word Bank, Placement Test, Analytics, and
Community Library. Today it's a plain tile grid. Rebuild it as a cheerful,
cohesive "what else can I do?" hub that feels like the same world as the kid
home screen.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — lean on big
distinct icons, color and the mascot over text. One kid per account (never
show child pickers). Some of these tiles a parent will tap too (Analytics),
but the surface stays kid-friendly.

SCREEN ANATOMY
- A warm, light header where the Readee BUNNY (in the kid's equipped outfit)
  waves and invites the kid to explore more ("More fun stuff!"), voiced.
  Keep it airy — this is a hub, not a dense dashboard.
- The FEATURES as big, chunky, iconographic TILES, each with its own accent
  color and a distinct illustrated icon so they read at a glance:
  · Ask Readee — an AI reading helper (tag it "AI")
  · Fluency Check — read aloud to the mic
  · Word Bank — the words I've collected
  · Placement Test — find my just-right level
  · Analytics — my reading progress (parent-facing)
  · Community Library — shared stories to explore
- Some tiles carry a small TAG chip — "AI" (Ask Readee) or "Readee+"
  (premium features) — styled as a friendly badge, legible but not scary.
- Tiles are large and thumb-friendly with a clear label and one-line kid
  subtitle. Tapping a tile routes to that feature.

LAYOUT
- A relaxed grid (not cramped) — generous spacing, one consistent tile size
  language, gentle rhythm. Group or order so the most fun/kid-facing tiles
  lead and the parent-facing one (Analytics) reads a touch calmer.
- Show the kid's carrots/streak up top so the hub feels connected to the game.
- Every tile needs a designed look even if a feature is locked — a soft
  lock/Readee+ state, never a dashed-grey empty box.

REWARD + MOTION
- Springy tile hover/tap (pop + slight lift), the bunny idle-bobbing, tag
  chips with a subtle shimmer on premium. Framer-Motion-style micro-motion,
  never janky. Keep it light — this page is a launcher, motion is garnish.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Baloo 2 display, Nunito body. Indigo/violet (#4338ca → #7c3aed), gold
  carrots, watercolor/sky pastel background. Rounded chunky cards, one shadow
  depth, Framer-Motion-style micro-motion.
- Bright, cheerful, uncluttered, credibly educational — a friendly launcher.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems); the Readee bunny (not a new mascot).
- B2C kid surface — no teacher/classroom anything.
- Desktop AND tablet layouts. Tiles stay big and tappable; grid reflows
  gracefully without stretching edge-to-edge on wide screens.

DELIVERABLE
A polished, responsive More hub: the light bunny header + carrots/streak
strip, and the grid of six big iconographic tiles (Ask Readee, Fluency Check,
Word Bank, Placement Test, Analytics, Community Library) with distinct icons
and accent colors, plus "AI" and "Readee+" tag chips where they belong. Show
the full grid, and show one tile in a locked/Readee+ state.
```
