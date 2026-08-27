# Readee 🐰
### A K–4 reading program, built by educators

**Next.js 16 · React 19 · TypeScript · Supabase · Tailwind v4 · Stripe**

Readee helps children in **kindergarten through 4th grade** learn to read. Every lesson is aligned to **Common Core ELA** and grounded in the **Science of Reading**: a placement test meets each child at their level, a structured Journey walks them through it, an AI tutor (Luna) listens to them read aloud, and a daily reading habit keeps them coming back. Co-founded by Filip (engineering/product) and Jennifer Klingerman, a certified reading specialist.

- **App:** [learn.readee.app](https://learn.readee.app) · **Marketing:** [readee.app](https://readee.app)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, `proxy.ts`) |
| Frontend | React 19, Tailwind CSS v4, Framer Motion, Radix / shadcn, Recharts |
| State | Zustand |
| Backend / Auth | Supabase (Postgres + RLS, Storage, Auth) |
| Payments | Stripe (Checkout, Webhooks, Customer Portal) |
| Email | Resend (lifecycle + weekly digest) |
| TTS | Google Gemini (Autonoe voice) |
| Image gen | Google Gemini image API (`gemini-3-pro-image`) |
| Speech grading | Azure Speech (Luna reads-aloud pronunciation scoring) |
| Deploy | Vercel |

---

## Core Product

### Reading Journey (`/journey`) — the spine
A vertical, game-like path through K–4. Lessons are grouped into **units** by domain — "Story Treasures" (Literature), "Fact Finders" (Informational), "Sound Workshop" (Foundational), "Word Magic" (Language). The path starts at the grade the child **placed into**, tracks the single **current** lesson, and gates the rest behind progress and plan. Unit chests + a grade trophy reward completion. The Journey is the **single source of truth** for "what's next" — the dashboard mirrors it via `lib/journey/next-lesson.ts`.

### Lessons (`/learn`)
The lesson itself: a **karaoke read-along slideshow** (word-level TTS highlighting) followed by a **practice quiz** on the same standard. This is what the Journey opens.

### Practice (`/practice`, `/practice-hub`)
Standalone standards practice with six custom interactive question types beyond multiple choice:
- **Missing Word** · **Sentence Build** · **Category Sort** · **Tap to Pair** · **Sound Machine** (phoneme ID) · **Space Insertion**

Every question has read-aloud audio (prompt + hint), a custom "the correct answer is…" clip on a miss, and its own illustration.

### Luna — AI reading tutor (`/luna`)
Kids read decodable passages **out loud**; the browser streams mic audio **directly to Azure Speech** — a short-lived token minted by `/api/luna/speech-token`, so raw child audio never touches our servers — for real-time pronunciation scoring. Luna targets each child's **weakest phonics pattern** (`lib/luna/target-pattern.ts`), generates a fresh decodable passage on any topic ("Surprise me" is free), and closes the loop with word lessons, sight-word drills, and human-recorded phonemes. **Luna Story Studio** lets kids write and publish their own stories — every one runs the [Content Safety](#content-safety) pipeline before it can appear. Luna routes: `speech-token`, `grade`, `passage`, `story`, `session-complete`, `speak`.

### Daily Readee (`/daily`)
A fresh, short **"on this day" read every morning** — the free habit anchor. An archive calendar marks each day the child has read (green outline + check).

### Decodable Stories (`/stories`)
25 original decodable stories (5 per grade) with cover art, read-aloud audio, and comprehension questions.

### Placement Test (`/assessment`)
Adaptive diagnostic that places a child K→4 on first sign-up (weighted scoring, no in-test feedback). Reading level is **placement-owned** — a grade change recommends a retake, never silently resets.

### Parent Dashboard (`/dashboard`)
Momentum ("your child is getting better"), a "Today's plan," the journey card, streaks/carrots, and weekly activity. All lesson state derives from the Journey helper, so every surface agrees.

### Exams
Unit exams and grade **final / graduation** quizzes gate progression between units and grades. Per the plan, exams are Readee+ (the placement test stays free).

### Gamification & economy
The reward layer that keeps kids coming back:
- **Carrots** — earned for correct answers and finished lessons; the single in-app currency.
- **Reader levels** — a lifetime-carrot ladder (`READER_LEVELS`) with level-up celebrations.
- **Streaks** — daily-activity streaks with fire animations.
- **Leaderboard** — real **same-grade peers** (first name + avatar), not fake bots.
- **Mystery box** — one free open per day (carrots for extra opens within the window).
- **Shop** — avatars, outfits, reactions, and watercolor backgrounds, all **earnable with carrots** (no pay-to-win skins).
- **Journey rewards** — unit treasure chests + a grade trophy, credited once (idempotent).

### Community & Discover
- **Discover** (`/discover`) — a curated library of reads by category.
- **Community** (`/community`, also public for SEO) — shared and **kid-written** stories, plus a "Just for [Child]" shelf. Everything kid-authored passes Content Safety before it appears.

---

## Content Safety

Readee is used by young children, so safety is layered and defense-in-depth, not a single check:

- **Prompt + output guards** (`lib/ai/safety.ts`) — every AI call runs `assertSafePrompt` on kid/parent input and `assertSafeOutput` on generated text against an **obfuscation-hardened banlist** (`containsUnsafeContent`). Unsafe in or out is blocked. Image generation carries an `IMAGE_SAFETY_PREFIX`.
- **Kid-created content pipeline** — a Story Studio submission runs `reviewCommunityStory` (`lib/community/review-agent.ts`): (1) a fast banlist recheck = instant hard reject, (2) an **LLM compliance judge** (`judgeCommunityCompliance`) that approves or rejects, and (3) anything the judge can't rule on (AI error) is **left pending for a human**, never auto-published. A cron drains the queue (`runCommunityReviewQueue`); humans override at `/admin/community`.
- **Same judges as the catalog** — kid content is held to the same QC bar as first-party lessons (Fulcrum's Judge stage).
- **COPPA posture** — B2C (one parent : one child), parental consent, one-click data deletion + CSV export, replay-off privacy defaults, `security.txt`, and live Privacy Policy + Terms.

---

## Learner Model

One per-child profile powers all adaptivity (`lib/adaptive/learner-model.ts`, `getLearnerModel`). It maps each standard to a **skill axis** (`standardToAxis`, `ccssDomain`) and tracks mastery with an **SM-2 spaced-repetition** spine in `child_skill_memory`. This is Fulcrum's **Adapt** stage — it drives Sharpen Up (spaced review), Luna's phonics targeting, and the weak-skill picks on the dashboard.

---

## Email & Lifecycle (Resend)

Behavioral + transactional email, all in one branded shell:
- **Lifecycle** (`lib/email/lifecycle.ts`): `welcome` (immediate on signup), `first_lesson_nudge` (~day 3), `trial_ending` (day 6 — the load-bearing conversion nudge), `re_engage` (7+ days inactive), fired by a daily cron and deduped in `lifecycle_email_sends`.
- **Weekly progress digest** (`lib/email/parent-digest.ts`) — Mondays, per-child stats.
- **Transactional** — cancellation, account-deletion, and a **What's New** broadcast (`scripts/send-whats-new.ts`) for content drops.

---

## Analytics & Ops

- **PostHog** — product analytics (host-split: landing = acquisition, app = activation/retention).
- **Sentry** — error monitoring (org `readee-5u`).
- **Cost metering** — Luna's Azure speech usage is metered (`speech_token_mints`) across surfaces; a monthly "Luna sessions" report breaks usage down per surface.

---

## Subscription — freemium with a reverse trial

**Readee+** is the premium tier: **$9.99/month or $6.99/month billed annually.**

Every new account gets **full Readee+ access for 7 days with no credit card** (a "reverse trial"), then drops to the free tier. `lib/plan/access.ts` folds the trial into an *effective plan* so existing gates unlock automatically during the trial.

| | Free | Readee+ |
|---|---|---|
| Lessons | first **unit** per grade | all K–4 |
| Practice | 10 / standard | unlimited |
| Stories | 2 / grade | all 25 |
| Luna | 3 free tries | unlimited + Story Studio |
| Daily Readee · community | ✅ | ✅ |
| Analytics · Sharpen Up · exams | — | ✅ |
| Readers per account | 1 | up to 2 |

Gates are enforced **server-side** where it matters: `/learn` and `/practice` are server components that redirect before render; the reader cap is a Postgres trigger; Luna generation is metered in the API. Plan lives in `profiles.plan` (`'free'` | `'premium'`), flipped by the Stripe webhook.

---

## Content

- **201 lessons** across K–4 (`app/data/sample-lessons.json`)
- **911 practice questions** (`app/data/*-standards-questions.json`, built from `scripts/master_manifest.json`)
- **25 decodable stories**, **45 phoneme audio files**, thousands of question images + audio clips
- Assets live in Supabase Storage under `images/{grade}/{standard}/` and `audio/{grade}/{standard}/`

### Fulcrum — the content & learning engine

Readee's content and adaptivity run on **Fulcrum**, an AI learning engine built as a four-stage loop:

**Generate → Judge → Adapt → Grade**

- **Generate** — models (Fable, Gemini) write lessons, decodable passages, and standards-aligned questions to a strict spec.
- **Judge** — a separate model grades every piece against `docs/CONTENT_SPEC.md`; failures are regenerated, not shipped ("Gemini generates, Claude judges").
- **Adapt** — content targets each child's placed level and weakest phonics patterns (Luna, Sharpen Up) through a per-child learner model.
- **Grade** — the app scores answers and, in Luna, real read-aloud pronunciation (Azure speech), feeding results back into Adapt.

Fulcrum is intentionally subject-agnostic: the same generate → judge → adapt → grade loop is designed to power learning content well beyond reading.

---

## Architecture

```
app/
  (protected)/        Auth-guarded surfaces: journey, learn, practice, luna,
                      daily, stories, dashboard, settings, upgrade, account…
  today/[slug]/       Public Daily Readee reader (SEO + logged-in)
  api/                Route handlers: webhooks/stripe, luna/*, daily/complete,
                      lifecycle, checkout, …
  data/               Lesson + question JSON (source of truth for the catalog)
lib/
  journey/            next-lesson.ts — the shared "what's next" logic
  plan/               access (reverse trial), limits, free-lessons (unit gate)
  luna/               target-pattern + speech grading helpers
  email/              lifecycle + weekly digest (Resend)
  assessment/         placement engine
  stores/             Zustand (plan, child, sidebar)
  supabase/           client + admin helpers
proxy.ts              Next.js 16 middleware — auth + premium-route gates
supabase/migrations/  Postgres schema + RLS (120+ migrations)
scripts/              Content pipeline: generate, upload, QC, audit
```

---

## Quick Start

```bash
git clone https://github.com/filipgalietti-cpu/readee-app2.0.git
cd readee-app2.0
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=...
RESEND_API_KEY=...
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=...
```

For Stripe webhooks locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

---

## Conventions

- **App Router** — server components by default; client only when needed. Data in server components / route handlers over client `useEffect` where possible.
- **No native emojis** in customer-facing UI (Lucide icons or custom art only). **No em-dashes** in customer copy.
- **shadcn/ui** for base components; **Framer Motion** for transitions; **`next/image`** for images; **skeleton loaders**, never spinners.
- **TypeScript strict**, Zod validation at boundaries. Never expose the service-role key client-side; admin ops go through `lib/supabase/admin.ts`.
- Spacing on the Tailwind scale; one shadow style; regular + semibold weights only.
