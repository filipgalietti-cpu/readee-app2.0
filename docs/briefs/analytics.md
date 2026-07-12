# Claude Design brief — Progress dashboard (`/analytics`)

Paste the block below into Claude Design. Grounded in the real feature:
`/analytics` is a Readee+ premium parent dashboard reading from
practice_results + lessons_progress + the child's streak/level — lessons
completed, skills mastered vs weak, time spent, streak history, reading
level. Charts via Recharts.

```
Redesign the parent PROGRESS DASHBOARD for Readee, a K-4 kids' reading app —
the "how is my child doing?" screen. This is a Readee+ premium feature. It
must answer the parent's real question in about 15 seconds, then reward a
longer look. Reassuring and plain-language, NOT a data dump.

WHO IT'S FOR
A parent (of ONE child) on a laptop or tablet, glancing in after a session
or over coffee. Not a data analyst — wants to feel "my kid is making
progress and here's what to nudge." One child per account — never child
pickers.

SCREEN ANATOMY (top = the answer, below = the evidence)
- A warm header naming the child ("Maya's progress") with a plain-language
  HEADLINE INSIGHT the parent reads first — e.g. "Maya is reading above
  grade level and on a 6-day streak." Written like an encouraging teacher,
  not a metric.
- A tidy row of at-a-glance STAT TILES: lessons completed, current reading
  level/grade, time spent this week, current streak. Big friendly numbers,
  small trend hint (up this week), an icon each.
- TWO clean charts, no more (keep it legible):
  · Progress over time — an area/line chart of lessons completed or minutes
    read per week. Smooth, gentle, encouraging shape.
  · Skills snapshot — MASTERED vs STILL GROWING (never "weak"/"failing").
    A calm bar or grouped view of standards/skill areas, mastered in
    violet/gold, still-growing in a soft neutral.
- A STREAK / consistency strip — a simple week-by-week or calendar-style
  view of days practiced, so consistency reads at a glance.
- One or two PLAIN-LANGUAGE INSIGHT cards ("Maya has mastered short vowels —
  a great next step is blends") with a gentle CTA into a matching
  lesson/practice. Framed as helpful next steps, never as the child failing.

KEY INTERACTIONS
- Charts animate in with subtle Framer-Motion-style motion; friendly
  tooltips on hover/tap that speak plainly ("3 lessons this week").
- Insight-card CTAs deep-link into the relevant lesson or practice.
- An empty/early state (brand-new child, little data yet): the bunny + a
  reassuring "Progress will appear here after Maya's first few lessons" —
  never a blank chart or a dashed-grey box.

VISUAL SYSTEM (match the redesigned app — not a rebrand)
- Fonts: Baloo 2 for headers/big numbers, Nunito for body/labels.
- Palette: indigo/violet (#4338ca → #7c3aed) for primary data, gold for
  highlights/streak, soft pastel + white surfaces. Charts use the violet→
  gold family — cohesive, never a rainbow. Accessible contrast.
- Rounded cards, ONE consistent shadow depth, calm and roomy. Restrained,
  grown-up feel; the bunny appears lightly (header or empty state only).
- Reassuring and credibly educational — this should build parent trust.

HARD CONSTRAINTS
- NO native emoji — Lucide-style icons only.
- NO plain black text on colored surfaces (labels = zinc-800 on pale
  surfaces; no black axis text on violet).
- B2C — ONE child per account; never teacher/classroom/multi-child pickers.
- Desktop AND tablet layouts (design both) — charts reflow, tiles wrap, no
  horizontal scroll on tablet.

DELIVERABLE
A polished, responsive progress dashboard: headline insight, a stat-tile
row, two clean charts (progress-over-time + skills mastered vs growing), a
streak/consistency strip, and one or two plain-language insight cards with
next-step CTAs. Show two states: a child with a few weeks of data (the full
dashboard) and the near-empty early state with the reassuring bunny.
```
