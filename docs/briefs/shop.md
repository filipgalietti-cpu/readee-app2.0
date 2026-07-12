# Claude Design brief — Outfit shop (`/shop`)

Paste the block below into Claude Design. Grounded in the real feature: kids
spend carrots on BUNNY OUTFITS (20+ outfits, common/rare rarity, prices in
carrots). A big bunny showcase preview at the top wears the currently-selected
outfit; below is a grid of outfit cards to try on / buy / equip.

```
Redesign the SHOP page for Readee, a K-4 kids' reading app — where the child
spends earned carrots on BUNNY OUTFITS (20+ outfits, common and rare, priced
in carrots). Rebuild it as a delightful DRESS-UP STORE the kid loves to
browse: a big bunny showcase up top and a grid of outfits to try on, buy, and
equip.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — lean on the
bunny preview, outfit art, color, and clear owned/afford states over text.
One kid per account (never show child pickers).

THE SHOWCASE (hero — top of page)
- A BIG, joyful preview of the Readee BUNNY wearing the currently-SELECTED
  outfit, front and center on a little "stage" (spotlight / pedestal / dressing
  -room vibe). The bunny idles happily and reacts when you try a new look on.
- Right there: the outfit's name, its rarity badge (Common / Rare), and the
  primary action — "TRY ON" (preview only), "BUY" (spend carrots), or "EQUIP"
  (already owned) depending on state.
- The child's carrot balance shown proudly nearby, with a clear affordable /
  can't-afford read when an outfit is selected.

THE OUTFIT GRID
- Below the showcase: a grid of chunky rounded OUTFIT CARDS, each showing the
  outfit (ideally previewed on a mini bunny), its name, a rarity badge, and
  its price in carrots — OR an "Owned" / "Equipped" state instead of a price.
- Clear card states: Owned+Equipped (a check/glow, "wearing"), Owned (ready to
  equip), Affordable (price in gold, tappable, inviting), Too-expensive (price
  legible but softened — "keep earning!", never scolding).
- Tapping a card selects it → the big showcase bunny instantly TRIES IT ON
  (optimistic, instant). Rare outfits get a little extra sparkle/shine so they
  feel special and worth saving for.
- A light way to filter/sort (All / Owned / Common / Rare) without clutter.

THE BUY MOMENT
- Buying is a satisfying beat: a friendly confirm, carrots visibly spent
  (counter ticks down), a celebratory unlock (sparkle/confetti, the bunny does
  a happy spin in the new fit), then the card flips to "Owned" and the action
  becomes "Equip." Never punishing; if they can't afford it, a gentle nudge to
  go earn more carrots (link to practice/stories).

REWARD + MOTION
- Springy card hover/tap, the showcase bunny changing outfits with a playful
  pop, rare-item shimmer, carrots ticking down on purchase, confetti on unlock,
  a proud "equipped!" flourish. Joyful, never janky.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Fonts: Baloo 2 display, Nunito body.
- Palette: indigo/violet (#4338ca → #7c3aed), gold carrots, watercolor/sky
  pastel background. Rounded chunky cards, one consistent shadow depth,
  Framer-Motion-style springy micro-motion.
- Bright, delightful, credibly educational — a cheerful dress-up boutique, not
  babyish.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Carrots (not gems/coins); the Readee bunny (not a new mascot) — every outfit
  goes on the SAME bunny, no new characters.
- B2C kid surface — one kid per account, no teacher/classroom anything.
- Desktop AND tablet layouts. The showcase bunny stays big on both; outfit
  cards stay large and thumb-friendly and reflow cleanly.

DELIVERABLE
A polished, responsive outfit shop: the big showcase bunny wearing the selected
outfit with try-on/buy/equip actions and carrot balance, and the grid of
outfit cards with rarity badges, prices, and owned/equipped/affordable states.
Show 3 states: browsing (an affordable outfit selected on the showcase bunny),
the buy/unlock celebration, and an equipped/owned outfit. Include at least one
Rare outfit with its special shimmer.
```
