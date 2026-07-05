# Launch GTM & Marketing Checklist

The go-to-market / marketing / trust layer. Complements the existing
launch docs — this file deliberately does NOT re-cover them:
- Legal / COPPA / DMCA / trademark → `LAUNCH_LEGAL_CHECKLIST.md`
- Stripe live-mode → `STRIPE_GO_LIVE.md`
- Env vars / cron / SKUs → `LAUNCH_OPS_RUNBOOK.md`
- Content quality → `CLEANUP_TO_LAUNCH.md`, `PUNCH_LIST.md`

> Guiding idea: for a Science-of-Reading product, **Jennifer (credentialed
> reading specialist) on camera is worth more than any ad.** Most of the
> "trust" and half the "assets" work is really "point a camera at Jennifer."

---

## 🎬 A. Demo & visual assets (Screen Studio)
- [ ] **Hero product walkthrough** — 60–90s Screen Studio recording for the landing hero + socials. Lead with the karaoke lesson + bunny coach (the magic moment).
- [ ] **Lesson-in-action clip** — kid-POV run of one lesson: teach → "Your Turn" fork → practice. This *is* the pitch.
- [ ] **Feature micro-demos** — placement test, parent dashboard, Readee.ai builder (the B2B/teacher wedge).
- [ ] **Jennifer credibility video** — reading specialist explaining the Science of Reading method.
- [ ] **Landing hero loop** — autoplay-muted GIF/webm.
- [ ] **Screenshot set** — landing, socials, directories (light + dark, phone + iPad).
- [ ] **OG / Twitter cards** (also `PUNCH_LIST` #11) + polished favicon / PWA tiles.

## 📱 B. Social presence
- [ ] Claim handles: **IG, TikTok, YouTube, Facebook, Pinterest**, + LinkedIn (district angle).
- [ ] Link-in-bio → a `/start` page.
- [ ] Queue **5–10 launch posts** before go-live.
- [ ] Content pillars: phonics/decodable tips · **Science-of-Reading explainers (Jennifer)** · "what to do when your kid struggles."

## 🛡️ C. Trust & credibility
- [ ] **Common Sense Media review** — submit early; parents + schools trust the badge.
- [ ] **Beta testimonials** from 3–5 real families/teachers (see F).
- [ ] **Student Privacy Pledge** badge once signed (also in legal doc).
- [ ] Jennifer's credentials + photo prominent everywhere.

## 🚀 D. Launch distribution
- [ ] **Product Hunt** — assets, hunter, first-comment ready.
- [ ] **Facebook groups** (homeschool moms, K teachers) — where the buyers actually are.
- [ ] **Reddit** (carefully): r/homeschool, r/Teachers, r/ScienceOfReading, parenting subs.
- [ ] Edtech directories + surface the **PWA "Add to Home Screen"** flow (your app-store substitute).

## 📊 E. Analytics & conversion
- [ ] **Funnel tracking**: signup → placement test → first lesson → paid. (Have Vercel Analytics; **PostHog** adds funnels + session replay.)
- [ ] **Sentry** error monitoring (also referenced in the legal doc).
- [ ] Landing conversion events wired.

## 🧪 F. Pre-launch testing
- [ ] **Real family beta** — 5–10 kids using it for a week.
- [ ] **Teacher pilot** — 1–2 classrooms on Readee Classroom.
- [ ] ⚠️ **iPad QA pass** — the iPad is the real kid device; we've focused on phone. Dedicated tablet pass before launch.
- [ ] Cross-browser (Safari especially).

## 🏦 G. Support & business ops
- [ ] **Help/FAQ page** + monitored support inbox (hello@ forwards today).
- [ ] **Insurance** (general liability + tech E&O) — founder-only (legal doc).
- [ ] **Readee® trademark** — founder-only (legal doc).
- [ ] Business bank + Stripe payouts wired; refund/cancel policy visible.

---

### Highest-leverage, lowest-effort first
1. Screen Studio hero + lesson-in-action clips (unblocks landing + all socials).
2. One Jennifer video (unblocks most of trust + credibility).
3. iPad QA pass (real risk, cheap to check).
4. Claim social handles (cheap, time-sensitive).
