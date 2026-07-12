# Claude Design brief — Carrot rewards (`/carrot-rewards`)

Paste the block below into Claude Design. Grounded in the real feature: the
carrots hub — how many carrots the kid has, how they earned them, and what
they can spend them on (links to the shop). Carrots are Readee's ONLY
currency. Redesign a satisfying carrots home with the balance front-and-center
and recent earnings.

```
Redesign the CARROT REWARDS hub for Readee, a K-4 kids' reading app — the
home for the kid's carrots (the app's currency). It shows how many carrots
they have, how they earned them recently, and what they can spend them on
(links to the shop). It should feel like a rewarding, "look how much I've
earned!" bank — proud and motivating.

WHO IT'S FOR
One child, 5-10 yrs, on a laptop/tablet. Low reading ability — lean on the
big balance number, icons, imagery and the mascot over text. One kid per
account (never show child pickers). Carrots are the reward loop that keeps
the kid coming back.

SCREEN ANATOMY
- THE BALANCE, front-and-center: a big, satisfying CARROT COUNT as the hero
  of the page — large gold carrot iconography, the number impossible to miss.
  The Readee BUNNY (in the kid's equipped outfit) celebrates the stash beside
  it, voiced ("You've got 240 carrots!"). This is the emotional payoff of the
  whole game — make it feel like treasure.
- RECENT EARNINGS: a friendly, scannable list/feed of how carrots were
  recently earned — each row with an icon, a kid-friendly label (finished a
  lesson, nailed practice, read a story, daily streak), and the "+N carrots"
  gained. Recent, celebratory, easy to skim — not a dense ledger.
- WAYS TO EARN: a light "how to get more carrots!" section — a few
  encouraging cards nudging the kid toward more reading/practice, each linking
  to that activity. Motivating, never guilt-y.
- SPEND: a clear, inviting "Spend your carrots" area that links to the SHOP
  (outfits/backgrounds for the bunny). Tease a couple of items the kid could
  afford or is close to, so the balance feels spendable and exciting.

REWARD + MOTION
- The balance counts up / shimmers on load; carrots have a satisfying golden
  bounce. Recent-earning rows slide in. Framer-Motion-style micro-motion,
  never janky. If the kid just earned carrots elsewhere, they can "land" here
  with a celebratory pop.
- Keep the streak visible so the daily-carrots loop is legible.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Baloo 2 display, Nunito body. Indigo/violet (#4338ca → #7c3aed), gold
  carrots as the star accent, watercolor/sky pastel background. Rounded
  chunky cards, one shadow depth, Framer-Motion-style micro-motion.
- Bright, rewarding, proud, credibly educational — a treasure-stash feel.

HARD CONSTRAINTS
- NO native emoji (Lucide-style icons / illustrated art only).
- NO plain black text on colored surfaces.
- Currency is CARROTS only (never gems/coins/points); the Readee bunny (not a
  new mascot).
- B2C kid surface — no teacher/classroom anything.
- Desktop AND tablet layouts. The balance hero stays dominant on both.

DELIVERABLE
A polished, responsive Carrot Rewards hub: the big carrot-balance hero with
the celebrating bunny, a scannable recent-earnings feed with "+N carrots"
rows, a light "ways to earn more" section, and a "spend your carrots" area
linking to the shop with a couple of teased items. Show the loaded state with
a healthy balance and recent earnings, plus a fresh/low-balance state that
still feels encouraging (bunny nudging the kid toward their first carrots).
```
