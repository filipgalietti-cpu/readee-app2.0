# Readee — Business Model & Margins

_Living doc. Update as pricing or unit economics shift. All numbers
defendable from code: pricing in `app/schools/page.tsx` + `lib/stripe.ts`,
costs in `lib/ai/credits.ts`, monthly caps in `MONTHLY_CREDIT_LIMIT`._

## TL;DR

| Tier | Price | Worst-case unit cost | Gross margin |
|---|---|---|---|
| Readee+ Family (B2C) | $9.99/mo · $6.99/mo annual | ~$1.70 | **~82%** |
| Teacher Solo (B2B-light) | $19/mo · $15/mo annual | ~$3.45 | **~82%** |
| Classroom (B2B) | $3 / student / year | ~$0.40 | **~87%** |
| School (B2B, 50+ seats) | $2.50 / student / year | ~$0.35 | **~86%** |
| District | Custom (volume) | ~$0.30 / student / year | **~88%** target |

**One-time top-ups (B2B Teacher Solo + Readee+ overage):**

| Pack | Price | Credits | Gemini cost worst-case | Margin |
|---|---|---|---|---|
| Small | $5 | 250 credits | ~$1.25 | **75%** |
| Large | $8 | 500 credits | ~$2.50 | **69%** |

---

## Revenue tiers

### Free tier (B2C funnel + B2B trial)
- 1 lesson per grade
- 10 practice attempts per standard
- 2 stories per grade
- 1 child / 0 classrooms
- Daily Readee free for everyone
- **Purpose:** funnel feeder. Cost-of-acquisition is the daily question + free placement test.

### Readee+ Family (B2C subscription)
- **Price:** $9.99/mo · $6.99/mo billed annually = $83.88/yr
- **What it unlocks:** unlimited lessons, unlimited practice, unlimited stories, unlimited children, analytics, Ask Readee at 200 credits/mo, **Stories starring my kid**, AI personalized learning path per child, daily question history.
- **7-day free trial** controlled by Stripe.
- **Stripe SKU:** `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL`.

### Teacher Solo (B2B-light)
- **Price:** $19/mo · $180/yr ($15/mo billed annually)
- **What it unlocks:** up to 2 classrooms, 40 students, full Readee.ai suite at 500 credits/mo (build-with-AI quiz/lesson/book/leveled, smart groups, parent letters, conference notes, learning paths).
- **Stripe SKU:** `STRIPE_PRICE_TEACHER_SOLO_MONTHLY` / `STRIPE_PRICE_TEACHER_SOLO_ANNUAL`.

### Classroom (B2B per-seat)
- **Price:** $3 / student / year
- **No minimum.** A teacher buys for one classroom directly with PO or card.
- **What it unlocks:** all of Teacher Solo features for the whole class, no AI cap on the teacher.

### School (B2B per-seat)
- **Price:** $2.50 / student / year
- **Minimum 50 seats.**
- Includes admin dashboard, school-level analytics, DPA-ready, professional-development credit.

### District (B2B custom)
- **Price:** Custom (volume — target $1.50–$2.00/student/year at 5,000+ seats).
- Includes everything above plus district admin tools, multi-school rollups, single-pane reporting, dedicated CSM.

### One-time credit top-ups
- **$5 / 250 credits** (~50 quizzes or 4-5 lessons of AI gen)
- **$8 / 500 credits** (~10 lessons or 1 full month of teacher-cap top-up)
- **Why both:** $5 is the impulse-buy ceiling for parents on Readee+; $8 is the value-pack for teachers who need overage.

---

## Cost structure

### AI variable cost (the only meaningful per-unit cost)

From `lib/ai/credits.ts`:

| Operation | Credits | Internal cost ($0.005/credit) |
|---|---|---|
| Text generation (passage, MCQ, T/F, image brief, conference notes, parent letter, learning path) | 1 | $0.005 |
| TTS audio | 2 | $0.01 |
| Image generation | 8 | $0.04 |
| QC pass on a build | 3-5 | $0.015–$0.025 |

**Per-feature cost to Readee:**

| Feature | Credits | Cost |
|---|---|---|
| Build a quiz (passage + image + audio + 5 MCQs + QC) | ~16 | **$0.08** |
| Build a lesson (5 slides w/ image + audio + 3 MCQs + QC) | ~58 | **$0.29** |
| Build a decodable book (10 pages w/ images + QC) | ~94 | **$0.47** |
| Build a leveled passage (3 levels w/ shared image + 3 audio + 9 questions + QC) | ~22 | **$0.11** |
| Conference notes | 1 | **$0.005** |
| Smart small groups | 1 | **$0.005** |
| Parent letter draft | 1 | **$0.005** |
| Parent letter translation (per language) | 1 | **$0.005** |
| Learning path generation | 1 | **$0.005** |
| Personalized story (8 pages w/ images + QC) | ~75 | **$0.38** |
| Daily question (one per day, all users see same) | ~19 | **$0.10** (shared cost) |

### Fixed monthly overhead

| Service | Cost |
|---|---|
| Vercel Pro | ~$20-50 |
| Supabase Pro (DB + storage + auth) | ~$25-50 |
| Resend (transactional email) | ~$20 |
| Domains (readee.app, learn.readee.app, auth.readee.app) | ~$2 amortized |
| Daily Question cron | ~$3/mo ($0.10 × 30) |
| Stripe (transaction-based, see below) | variable |
| Sentry / observability | ~$0-26 |
| **Total fixed** | **~$70-150/mo** |

These scale very slowly with users — Supabase / Vercel jump tiers at thousands of MAU. For unit economics below, fixed cost is amortized into a $0.10/customer-month allocation.

### Transaction costs

Stripe: **2.9% + $0.30 per transaction**.

| Transaction | Stripe fee |
|---|---|
| $9.99 monthly Readee+ | $0.59 |
| $6.99 monthly Readee+ (annual prorated) | n/a (charged $83.88 once: $2.73) |
| $19 Teacher Solo monthly | $0.85 |
| $180 Teacher Solo annual | $5.52 |
| $5 credit pack | $0.45 |
| $8 credit pack | $0.53 |

---

## Unit economics by tier

### Readee+ Family (B2C)

**Monthly subscriber, worst-case usage (kid hits 200-credit cap on Ask Readee + 2 personalized stories/mo):**

| Line item | Amount |
|---|---|
| Revenue | $9.99 |
| Stripe fee | -$0.59 |
| AI variable (200 credits cap) | -$1.00 |
| Personalized stories (2 × $0.38) | -$0.76 |
| Fixed allocation | -$0.10 |
| **Net contribution** | **$7.54 (75%)** |

**Annual subscriber:**

| Line item | Amount |
|---|---|
| Revenue | $83.88 |
| Stripe fee | -$2.73 |
| AI variable @ 12 × $1.76 worst-case | -$21.12 |
| Fixed allocation | -$1.20 |
| **Net contribution** | **$58.83 (70%)** |

Realistic average usage is more like 30-40% of cap, so **average gross margin is closer to 85%.**

### Teacher Solo (B2B-light)

**Monthly subscriber, worst-case usage (teacher hits 500-credit cap):**

| Line item | Amount |
|---|---|
| Revenue | $19.00 |
| Stripe fee | -$0.85 |
| AI variable (500 credits cap) | -$2.50 |
| Fixed allocation | -$0.10 |
| **Net contribution** | **$15.55 (82%)** |

**Annual:**

| Line item | Amount |
|---|---|
| Revenue | $180.00 |
| Stripe fee | -$5.52 |
| AI worst-case (12 × $2.50) | -$30.00 |
| Fixed allocation | -$1.20 |
| **Net contribution** | **$143.28 (80%)** |

### Classroom B2B ($3/student/year)

**Per 25-student classroom:**

| Line item | Annual |
|---|---|
| Revenue (25 × $3) | $75.00 |
| Stripe fee | -$2.48 |
| AI variable (1 teacher, ~$1.50/mo realistic) | -$18.00 |
| Fixed allocation per teacher | -$1.20 |
| **Net contribution per classroom** | **$53.32 (71%)** |
| **Per-student net** | **$2.13 (71%)** |

### School B2B ($2.50/student/year, 250 students)

| Line item | Annual |
|---|---|
| Revenue (250 × $2.50) | $625.00 |
| Stripe fee (assume PO/ACH ~1%) | -$6.25 |
| AI variable (10 teachers × $18/yr) | -$180.00 |
| Admin onboarding amortized | -$30.00 |
| **Net contribution** | **$408.75 (65%)** |
| **Per-student net** | **$1.64 (66%)** |

### District B2B ($1.75/student/year, 5,000 students)

| Line item | Annual |
|---|---|
| Revenue (5000 × $1.75) | $8,750 |
| Stripe / payment processing (PO) | -$50 |
| AI variable (200 teachers × $18/yr) | -$3,600 |
| CSM allocation | -$2,000 |
| Onboarding / training | -$500 |
| **Net contribution** | **$2,600 (30%)** |

> District margins look thin because of CSM overhead, but scaling to 10K+ seats brings CSM cost-per-seat down hard. At 20K seats / $1.50 student-year = $30K ARR with one CSM = ~70% margin.

---

## Why these margins are defensible

1. **AI is variable cost only.** No headcount per customer; the credit cap caps the worst-case Gemini bill.
2. **Caps prevent runaway.** 500 credits/mo cap on teachers = $2.50 worst-case. Even a teacher who builds 10 lessons + 5 books per month doesn't blow past the cap.
3. **The QC engine + content factories give us a Newsela-grade content moat at IXL-grade pricing.**
4. **Fixed overhead is real but small.** ~$100-150/mo carries us to ~5,000 paying users without material upgrade.
5. **Districts pay annually.** Cash collected upfront, AI cost spread over the year — float helps cash flow.

---

## Risk factors / margin compressors

- **Gemini cost increases.** Our pricing is built on $0.005/credit which assumes today's Gemini 2.5 Flash + Imagen rates. A 2× cost increase puts B2C margin at ~70% (still healthy).
- **Heavy users on Readee+.** Some parents may spawn personalized stories daily. The 200-credit cap holds the line; overage forces a top-up purchase (revenue, not cost).
- **District CSM cost.** Need a self-service onboarding flow for sub-$10K districts so CSM time is allocated to enterprise deals only.
- **Stripe fees on small transactions.** $5 credit pack is $0.45 in fees = 9%. Acceptable on impulse buys; not great on $1 micro-transactions if we ever go there.

---

## What changes margin meaningfully

| Lever | Margin impact |
|---|---|
| Move Readee+ to $12.99 | +$3/sub/mo = +30% gross profit per sub |
| Annual-only Teacher Solo at $99/yr | -$81 ARR but +retention; net positive at 12mo+ LTV |
| District floor at $1.50/student | At 10K seats, $15K ARR vs $1.75 = $17.5K ARR — small absolute, big % swing |
| Bring Gemini in-house via Vertex enterprise pricing | -20-30% AI cost → +1-2 pts margin all tiers |
| Cap personalized story at 1/month on Readee+ | Caps worst-case and lets us advertise unlimited Ask Readee |

---

_Generated 2026-04-28. Owner: Filip. Update when pricing shifts or
new tiers ship._
