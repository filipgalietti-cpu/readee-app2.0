# Claude Design brief — Ask Readee AI library (`/dashboard/ask-readee`)

Paste the block below into Claude Design. Grounded in the real feature: a
Readee+ (credit-limited) parent tool — the parent describes what their kid
needs, Readee generates a custom lesson/story/practice set, and every past
generation lives in a personal "my AI library."

```
Redesign the ASK READEE page for Readee, a K-4 kids' reading app — the
parent's AI content studio. The parent describes what their child needs in
plain words, Readee generates a custom lesson, story, or practice set for
them, and everything they've made lives in a personal library. This is a
Readee+ feature and generations are credit-limited. Calm, capable, magical-
but-trustworthy — a parent tool, not a kid game screen.

WHO IT'S FOR
A parent (of ONE child) who wants something tailored — "my kid keeps mixing
up b and d," "a story about dinosaurs at her level." On laptop or tablet.
One child per account — never child pickers; generations target their one
child automatically.

SCREEN ANATOMY (two connected surfaces: the REQUEST and the LIBRARY)
- THE REQUEST (hero): a friendly, roomy prompt box — "What should we make
  for [child] today?" — with the bunny appearing lightly. Below it:
  · A CONTENT-TYPE choice: Lesson / Story / Practice (clear segmented
    control or three cards, one Lucide icon each).
  · A few EXAMPLE STARTER CHIPS the parent can tap to fill the box
    ("Practice short vowels," "A story about space," "Sight-word review").
  · A visible CREDITS meter — "8 of 10 creations left this month" — honest
    and non-scary, with a quiet note about how credits refresh. A primary
    "Create" CTA.
- THE GENERATING STATE: a warm, confident progress moment (skeleton +
  gentle motion, the bunny "thinking"), never a bare spinner. Reassuring
  microcopy ("Building [child]'s lesson...").
- THE RESULT: a preview card of what was made (title, type, level, a
  thumbnail/illustration) with clear actions — Open / Assign to [child] /
  Regenerate / Save. Show it dropping into the library.
- MY AI LIBRARY: a tidy grid/list of past generations. Each card = title,
  type badge (lesson/story/practice), created date, small preview, and
  quick actions (open, re-run, delete). Light filter by type. Design a
  warm EMPTY state (bunny + "Your creations will live here") for a
  first-time parent — never a dashed-grey box.

KEY INTERACTIONS
- Type + chips prefill the prompt; Create kicks off generation with a
  smooth Framer-Motion-style transition into the generating state, then the
  result, then into the library.
- Credits decrement visibly on a successful create; at zero, a calm "You're
  out of creations this month" with when-it-refreshes info (and, for a free
  user who lands here, a gentle Readee+ nudge — this is a premium feature).
- Library cards open the generated content; Regenerate spends a credit.
- Every action confirms with a toast; delete confirms first.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Fonts: Baloo 2 for headers/prompt, Nunito for body/labels.
- Palette: indigo/violet (#4338ca → #7c3aed), gold for the credits/premium
  accents, soft pastel + white surfaces. A touch of "AI magic" via subtle
  gradient/shimmer on the create moment — tasteful, restrained, grown-up.
- Rounded cards, ONE consistent shadow depth, purposeful motion. Bunny
  appears lightly (prompt header, generating state, empty state).
- Capable and trustworthy — a parent should feel this makes real, quality,
  educator-grade content.

HARD CONSTRAINTS
- NO native emoji — Lucide-style icons only.
- NO plain black text on colored surfaces (body = zinc-800 on pale
  surfaces).
- B2C — ONE child per account; never teacher/classroom/multi-child pickers.
- Desktop AND tablet layouts (design both) — request + library stack
  cleanly; library grid reflows on tablet.

DELIVERABLE
A polished, responsive Ask Readee studio: the request hero (prompt + type
choice + starter chips + credits meter + Create), the generating state, a
result preview card, and the "my AI library" grid with type badges and quick
actions. Show three states: an empty-library first-timer, an active
generation in progress, and a populated library with several past creations.
```
