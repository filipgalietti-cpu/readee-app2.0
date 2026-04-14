# Readee 2.0 🐰
### Common Core Aligned Literacy Platform
**Built with Next.js 16, React 19, TypeScript, Supabase, and Tailwind CSS**

Readee is a full-stack reading comprehension app for children in **kindergarten through 4th grade**. Every lesson maps to **Common Core ELA standards**, using structured learn/practice/read sections and interactive question types to build real reading skills — not just quiz scores.

---

## Tech Stack
* **Framework:** Next.js 16 (App Router)
* **Frontend:** React 19, Tailwind CSS v4, Framer Motion
* **Backend/Auth:** Supabase (PostgreSQL, Storage, Auth)
* **Payments:** Stripe (Checkout, Webhooks, Customer Portal)
* **Language:** TypeScript (strict)
* **AI Services:** Google Gemini TTS (audio), Google Imagen 4.0 (illustrations)
* **Middleware:** Custom auth guards & proxy logic

---

## Core Features

### Learning Path (`/path`)
Vertical "snake path" progression across 5 reading levels (K–4th). Nodes unlock dynamically based on mastery scores. Each level contains 7–13 structured lessons.

### Lessons (`/lesson/[id]`)
Three-section format per lesson: **Learn** (introduction + guided examples), **Practice** (interactive questions), **Read** (comprehension passage). 42+ lessons across the full curriculum.

### Interactive Question Types
Six custom interactive formats beyond standard multiple choice:
* **Missing Word** — tap the correct word to complete a sentence
* **Sentence Build** — drag words into the correct order
* **Category Sort** — sort items into labeled buckets
* **Tap to Pair** — match related items
* **Sound Machine** — phoneme identification with audio playback
* **Space Insertion** — tap between words to add missing spaces

### Placement Test (`/assessment`)
Full diagnostic placement test that determines a child's reading level on first signup. 59 questions across K–4th grade using all 6 interactive types with audio narration and illustrations. No right/wrong feedback during the test — answers are recorded silently. Weighted scoring gives partial credit for category sort and word builder questions. Animated "calculating" transition before revealing results.

**Results Page** (`/assessment-results`) — parent-facing dashboard with:
* Reading level meter showing placement across K–4th grade
* Animated score counters and skill breakdown bars
* Three skill categories: Phonics & Word Skills, Reading Comprehension, Vocabulary & Grammar
* Collapsible question-by-question detail view
* Plain-English reading level descriptions
* Retake option

Placement logic: 80%+ = on grade, 50–79% = one below, <50% = two below.

### Audio Narration
Every question has TTS audio (Gemini, Autonoe voice) — both the question prompt and the hint. Children can listen independently without needing a parent to read. Phoneme audio covers all 45 sounds (26 letters + digraphs/vowel variants) with isolated sound production.

### Custom Incorrect Answer Feedback
Per-question audio that says the correct answer after a wrong attempt (e.g., "The correct answer is C, a red ball.") — chained after a prefix sound for a natural two-part sequence.

### Illustrations
896 custom illustrations generated with Google Imagen 4.0. Bright 2D cartoon style with bold outlines and vibrant colors. One unique image per question.

### Parent Dashboard (`/dashboard`)
Overview of each child's progress: lessons completed, day streak, reading level, and per-standard breakdowns. Sidebar with reading path, weekly activity, and recent sessions.

### Subscription & Payments (Stripe)
Readee uses a freemium model with **Readee+** as the premium tier ($9.99/month or $6.99/month billed annually).

**Free tier limits:** 1 lesson per grade, 2 stories per grade, 10 practice questions per standard, 1 child profile, no analytics.

**Stripe integration:**
* **Checkout** (`/api/checkout`) — creates a Stripe Checkout Session with a 7-day free trial
* **Webhooks** (`/api/webhooks/stripe`) — handles `subscription.created`, `subscription.updated`, and `subscription.deleted` events to flip `profiles.plan` between `'free'` and `'premium'`
* **Customer Portal** (`/api/billing/portal`) — lets users manage or cancel their subscription
* **Upgrade page** (`/upgrade`) — conversion-focused page with monthly/annual toggle, contextual hero copy via `?reason=` param, promo code redemption, Jennifer's credentials as trust signal, and FAQ accordion
* **Paywall gating** — proxy-level redirects for premium routes, client-side plan checks via Zustand store, all gates redirect to `/upgrade?reason=X`
* Plan state stored in `profiles.plan` column (`'free'` | `'premium'`), with `stripe_customer_id` and `stripe_subscription_id` for Stripe linkage

### Child Profiles & Avatar System
One child profile per account. Avatar system with default + shop avatars (fox, owl, unicorn, dragon, etc.). Equipped items persist in the database.

### Decodable Library & Reader
Stories unlocked via progress milestones. Page-by-page rendering with audio highlighting and grade-level metadata.

---

## Content Pipeline

### Master Manifest
`scripts/master_manifest.json` — 896 questions across 5 grades, the single source of truth. All app data files (`app/data/*-standards-questions.json`) are rebuilt from this manifest.

### Asset Generation
* **Images:** `scripts/generate-images.js` — Imagen 4.0 batch generator (1s delay, MAX_REQUESTS=500)
* **Audio:** `scripts/generate-audio.js` — Gemini TTS batch generator (sequential only, 3-retry, 15min token refresh on 401)
* **Phonemes:** `scripts/generate-phoneme-audio.js` — 45 isolated sounds (3s delay, skips existing)

### Asset Storage (Supabase)
* Images: `images/{grade}/{standard}/{id}.png`
* Audio: `audio/{grade}/{standard}/{id}.mp3`
* Hints: `audio/{grade}/{standard}/{id}-hint.mp3`
* Phonemes: `audio/phonemes/{id}.mp3`
* Grade folders: `kindergarten`, `1st-grade`, `2nd-grade`, `3rd-grade`, `4th-grade`

### Audit Tools
* `/question-audit` — holistic question review (image, audio, text, answers)
* `/assessment-audit` — QA tool for all 59 placement test questions
* `/phoneme-audit` — play, rate, and export CSV for all 45 phoneme sounds
* `/interactive-audit` — verify all interactive question types
* `/k-audit` — kindergarten-specific lesson audit

---

## Architecture

```
app/                    Next.js App Router
  (protected)/          Auth-guarded routes (dashboard, lessons, upgrade, etc.)
  _components/          Shared components (NavAuth, Sidebar, CelebrationOverlay)
  api/                  API routes (checkout, webhooks, billing, promo, admin)
  data/                 Grade-level question JSON files
  components/lesson/    Lesson slideshow + interactive renderers

lib/                    Core logic
  assessment/           Placement assessment engine
  data/                 lessons.json (curriculum structure)
  db/                   Database types
  motion/               Framer Motion animation variants
  plan/                 Free/premium limits, server-side plan check
  stores/               Zustand stores (sidebar, plan, child)
  supabase/             Supabase client helpers
  utils/                Avatar resolution, validators

scripts/                Content pipeline (generate, upload, audit, fix)
supabase/migrations/    Database schema (20+ migrations)
```

---

## Quick Start

```bash
git clone https://github.com/filipgalietti-cpu/readee-app2.0.git
cd readee-app2.0
npm install
```

Copy `.env.local.example` to `.env.local` and fill in your Supabase and Stripe credentials:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

```bash
npm run dev
```

For Stripe webhooks in development, run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` in a separate terminal.

Visit `http://localhost:3000/test-connection` to verify your database setup.

---

## Quality Standards
* **Text:** `"` for dialogue/passages, `'` only for contractions, `**word**` for emphasis
* **Images:** "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors"
* **Audio:** Sequential generation only (concurrency causes failures), 3-retry with forced token refresh
* **TypeScript:** Strict mode, Zod schema validation at system boundaries
