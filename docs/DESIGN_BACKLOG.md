# Readee — Claude Design Backlog

Every kid/parent-facing page that should go through a Claude Design pass so
the whole app feels like one cohesive game. Ordered by how often a kid hits
the screen. Internal tools (`/owner/*`, `/admin/*`, `*-audit`) and the
deprecated `/classroom/*` B2B surfaces are intentionally excluded.

Design system to hold every redesign to: **Baloo 2** display + **Nunito**
body (app-wide), indigo/violet palette (`#4338ca → #7c3aed`), gold carrots,
the Readee **bunny** mascot, one shadow depth, rounded-2xl/3xl cards, Framer
Motion, **no black text on colored surfaces**, **no dashed-grey empty boxes**,
**no native emojis** (Lucide/custom art only), carrots as the currency.

**Paste-ready Claude Design briefs for every page below live in
`docs/briefs/<slug>.md`.** Open the brief, paste it into Claude Design, then
send me the share link to wire the result in.

## ✅ Done
- [x] **Dashboard / Kid Home** — "Adventure home"
- [x] **Practice Hub** (`/practice-hub`) — "Adventure Board"
- [x] **Lesson** (`/learn`) — canon lesson design
- [x] **Journey** (`/journey`) — Duolingo-style reading map

## 🎯 Kid core loop — next up (highest traffic)
- [ ] **Practice runner** (`/practice`) — the question-answering screen (2-try MCQ + feedback shipped; brief written — see `docs/briefs/practice-runner.md`)
- [ ] **Stories** (`/stories`) + story reader
- [ ] **Reading Buddy** (`/buddy`)
- [ ] **Levels** (`/levels`) — the level ladder
- [ ] **Shop** (`/shop`) — bunny outfits
- [ ] **Leaderboard** (`/leaderboard`)

## 🧩 Kid secondary
- [ ] **Assessment / placement test** (`/assessment`) + **results** (`/assessment-results`)
- [ ] **Discover** (`/discover`) + article reader
- [ ] **Review** (`/review`) — spaced repetition
- [ ] **Fluency check** (`/fluency`)
- [ ] **Stories for me** (`/stories-for-me`) — personalized AI stories
- [ ] **More hub** (`/more`) — light polish pass
- [ ] **Word Bank** (`/word-bank`), **Carrot Rewards** (`/carrot-rewards`)

## 👪 Parent surfaces
- [ ] **Settings** (`/settings`) + **Account** (`/account`)
- [ ] **Analytics** (`/analytics`) — parent progress dashboard
- [ ] **Upgrade / paywall** (`/upgrade`)
- [ ] **Ask Readee** (`/dashboard/ask-readee`) + **Homework Scan** (`/dashboard/homework-scan`)

## 🌐 Public / marketing (lower priority — most lives in the separate `readee-site-next` repo)
- [ ] In-app: `/about`, `/today`, `/community`, `/discover`, `/upgrade`, legal pages

---
_Suggested order:_ Journey → Practice runner → Stories → Levels/Shop/Leaderboard → Reading Buddy.
