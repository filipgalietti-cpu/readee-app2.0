# Readee — Tech Stack

_Source of truth for what we run. Update when a new dependency or
service is added. Pairs with `docs/BUSINESS_MODEL.md` for the cost
breakdown and `CLAUDE.md` for design conventions._

## TL;DR

**Stack:** Next.js 16 (App Router) + TypeScript on Vercel · Supabase
(Postgres + Auth + Storage + Realtime) · Tailwind CSS · Gemini 2.5
(text + image + TTS) for all AI · Stripe for billing · Resend for
email · GitHub Actions for CI · Playwright for E2E.

**Deployed:**
- App: `learn.readee.app` (Vercel)
- Marketing: `readee.app` (separate Next.js project at `~/readee-site-next`)
- Auth custom domain: `auth.readee.app` (Supabase)
- DB host: `db.rwlvjtowmfrrqeqvwolo.supabase.co`

---

## Frontend

| Layer | What we use | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router) | RSC by default, client components only when needed. Uses `proxy.ts` (NOT `middleware.ts` — Next 16 renamed it). |
| Language | **TypeScript** | Strict mode. Auto-generated DB types from Supabase. |
| Styling | **Tailwind CSS v4** | Spacing scale only (no arbitrary values). One shadow style. Indigo/violet brand palette. |
| Component primitives | **shadcn/ui + Radix** | Vendored via `app/components/ui/` — no CLI dependency. Includes Progress, Carousel, Card. |
| Magic UI | **Vendored locally** (no `@magicui` registry) | `app/components/magicui/` has ShineBorder, Particles, RainbowButton, TypingAnimation. |
| Animations | **Framer Motion** | All transitions and reveals. No raw CSS transitions on interactive elements. |
| Charts | **Recharts** (installed but rarely used yet) | Reports page uses simple SVG bars for now. |
| Icons | **Lucide React** | Brand rule: no native emojis, only Lucide icons or custom illustrations. |
| Forms | Native + react state | No form library — flows are simple enough. |
| State | **Zustand** | `lib/stores/` — child-store, sidebar-store, plan-store, view-mode-store. |
| Audio playback | **Howler.js** (legacy) + native HTML5 `<audio>` | Newer code uses native `<audio>`; SpaceInsertion still uses Howl. |

---

## Backend

### Database — Supabase Postgres

- **Project:** `rwlvjtowmfrrqeqvwolo` (us-east-1)
- **Postgres 17.6**
- **Migrations:** `supabase/migrations/NNN_name.sql`. Currently at **migration 060** (personalized stories). Applied via Supabase MCP.
- **Tables (selected):** `profiles`, `children`, `classrooms`, `classroom_memberships`, `assignments`, `assignment_submissions`, `practice_results`, `lessons_progress`, `assessments`, `custom_quizzes`, `custom_questions`, `custom_quiz_questions`, `custom_lessons`, `custom_books`, `differentiated_passages`, `personalized_stories`, `daily_questions`, `learning_paths`, `quiz_qc_reports`, `live_quiz_sessions`, `live_quiz_participants`, `live_quiz_answers`, `ai_usage_log`, `admin_memberships`, `schools`, `districts`, `promo_codes`, `promo_redemptions`, `referrals`, `top_up_purchases`.
- **RLS:** Enabled on every user-data table. Two patterns: parent-of-child via `parent_id = auth.uid()`, teacher-of-classroom via `teacher_id = auth.uid()`, admin via `admin_memberships`.
- **Service role:** `supabaseAdmin()` (`lib/supabase/admin.ts`) — only used server-side for orchestrators. Never exposed client-side.
- **Storage buckets:** `images` (public, custom + grade-organized) and `audio` (public, including phoneme samples + voice samples + per-question audio + voice cloning samples).

### Auth — Supabase Auth

- **Providers:** Email + password, Google OAuth (via `auth.readee.app` custom domain).
- **Trigger:** `handle_new_user` (migration 053) — defaults `role='parent'`, respects `raw_user_meta_data.role` hint from password signup, OAuth callback flips to `'educator'` when `signup_role=educator` is in the redirect URL.
- **Email templates:** Confirm signup + reset password use branded HTML in `docs/email-templates/`. Sender: `Readee <hello@readee.app>` via Resend custom SMTP.
- **HMAC-signed cookie sessions** for classroom-owned students + per-device play-mode lock (separate from Supabase auth — `lib/student-session.ts`).

### Server actions

- All `app/(protected)/**/actions.ts` files are server actions.
- Auth pattern: `requireProfile()` from `lib/auth/helpers.ts` reads the Supabase user + their profile row.
- AI actions wrap orchestrators in `lib/ai/build-*.ts` and add a profile.role check.

---

## AI — Google Gemini

### Models in use

| Model ID | Used for |
|---|---|
| `gemini-2.5-flash` | Text generation: passage, MCQ, T/F, matching pairs, image briefs, conference notes, parent letters + translation, learning paths, smart groups, personalized stories, QC judges. |
| `gemini-2.5-flash-image` | Image generation (was `gemini-2.5-flash-image-preview` until the alias retired). |
| `gemini-2.5-flash-preview-tts` | Text-to-speech (Autonoe = default voice "Sage"; 6 friendly voice names mapped to Gemini prebuilt voices in `lib/ai/voices.ts`). |

### SDK

- `@google/genai` v1.50+ for everything. Single `getClient()` helper in `lib/ai/readee-ai.ts`.
- **API key:** `GEMINI_API_KEY` (env var). Set in `.env.local` and Vercel.

### Credit / cost system

- Per-call costs in `lib/ai/credits.ts`: text=1, TTS=2, image=8 credits. 1 credit ≈ $0.005 internal cost.
- **Monthly caps:** Teachers 500 credits/mo, parents (Ask Readee) 200 credits/mo. Top-up packs at $5/250cr and $8/500cr.
- **Rate limits:** `checkRateLimit()` enforces hourly + monthly. Logs to `ai_usage_log`. Top-ups settle per-batch via `settleBatchAgainstTopUp()`.

### QC engine

- `lib/ai/qc.ts` — runs after every Build with AI:
  - **Deterministic checks:** word count band, banned words, MCQ correct-in-choices, no duplicate choices, no "all/none of the above".
  - **LLM judge:** passage coherence + per-question answer-support + image scene match + safety (vision LLM).
- Reports persisted to `quiz_qc_reports`. Admin queue at `/admin/qc`.

### Voice samples + phoneme audio

- Voice samples uploaded to `audio/voice-samples/{id}.wav` (6 voices).
- Phoneme audio at `audio/phonemes/{id}.mp3` (45 phonemes — used in K phonics questions and the decodable book blender).
- Generation scripts: `scripts/generate-voice-samples.js`, `scripts/generate-phoneme-audio.js`.

---

## Payments — Stripe

- **Mode:** Test (live mode deferred until polish bar met per Apr 27 decision).
- **SKUs (env vars):**
  - `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` — Readee+ Family
  - `STRIPE_PRICE_TEACHER_SOLO_MONTHLY` / `STRIPE_PRICE_TEACHER_SOLO_ANNUAL`
  - `STRIPE_PRICE_CREDITS_250` / `STRIPE_PRICE_CREDITS_500`
- **Webhook:** `/api/stripe/webhook` — flips `profiles.plan` on subscribe/cancel. Mirrors top-up purchase rows.
- **Checkout:** `/upgrade` for B2C, `/billing` portal for managing subscriptions, classroom credit-packs from `TopUpCreditsButton`.
- **B2B classroom/school/district:** quote-based, manual invoicing for now. Self-serve flow on roadmap.

---

## Email — Resend

- Custom SMTP plugged into Supabase Auth (sender: `Readee <hello@readee.app>`).
- **API key:** `RESEND_API_KEY`.
- **Use cases:**
  - Auth emails (signup confirmation + reset password) via Supabase SMTP route.
  - Parent weekly digest (`/api/cron/parent-digest`, Vercel cron Mon 8am ET).
  - Future: parent letter sending via translated content.

### DNS at Porkbun (for Resend)

- SPF (TXT, root): `v=spf1 include:amazonses.com ~all` on `send.readee.app` (Resend uses AWS SES under the hood).
- DKIM (TXT, `resend._domainkey.readee.app`): published.
- MX on `send.readee.app` → `feedback-smtp.us-east-1.amazonses.com` priority 10.
- DMARC + BIMI on the cleanup-to-launch list.

---

## Hosting & infrastructure

- **App:** Vercel (Next.js project `learn-readee-app`).
  - Crons: `vercel.json` cron entries for `/api/cron/parent-digest` (Mon 13:00 UTC) and `/api/cron/daily-question` (every day 9:00 UTC = 5am ET).
  - Cron auth: `CRON_SECRET` env var, bearer header.
- **Marketing site:** Vercel project `readee-site-next` (separate repo `filipgalietti-cpu/readee-site-next`).
- **DB / Auth / Storage / Realtime:** Supabase Pro tier.
- **DNS:** Porkbun for `readee.app`.
- **Monitoring:** `trackError()` in `lib/observability/track.ts` — wraps Sentry calls if configured.
- **Analytics:** Vercel Analytics + Speed Insights (free tier).

---

## Testing

| Layer | Tool | Where |
|---|---|---|
| Unit / integration | **Vitest** | `npm test` runs `vitest run`. |
| E2E smoke | **Playwright** | `tests/smoke/*.spec.ts`, 28 tests across 4 files. Runs against prod by default; `npm run test:smoke:local` to point at localhost. |
| CI | **GitHub Actions** | `.github/workflows/smoke.yml` runs Playwright on every push to main + every 6 hours on cron. |
| Manual QA runbook | `docs/WIZARD_SCENARIOS.md` | 9 self-test scenarios, ~30 min in incognito. |

---

## Code organization

| Path | What lives there |
|---|---|
| `app/(public)/` | Pre-auth pages (login, signup, reset-password). |
| `app/(protected)/` | Authed app — dashboard, classroom, account, etc. |
| `app/(student)/` | Kid play-mode + live quiz student view. |
| `app/today/` | Public daily question (no auth). |
| `app/api/` | API routes — Stripe webhook, cron entries, OAuth callback, lesson .pptx download. |
| `app/_components/` | Shared components used across route groups. |
| `app/components/ui/` | shadcn primitives. |
| `app/components/magicui/` | Vendored Magic UI (ShineBorder etc.). |
| `lib/` | Non-React code: AI orchestrators, Supabase clients, helpers, types, schemas. |
| `lib/ai/` | Every AI orchestrator. `build-*.ts` for content factories. `qc.ts` for the judge. |
| `lib/stores/` | Zustand stores. |
| `lib/supabase/` | `client.ts` (browser), `server.ts` (RSC), `admin.ts` (service role). |
| `supabase/migrations/` | Numbered SQL files. Apply via MCP. |
| `scripts/` | One-off + ongoing scripts: content generation, QC backfill, audio generation, manifest builders. |
| `docs/` | Strategic + operational docs (this one, BUSINESS_MODEL, WIZARD_SCENARIOS, CLEANUP_TO_LAUNCH, etc.). |
| `tests/smoke/` | Playwright suite. |

---

## Key environment variables

### Required for app to run
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

### Required for crons
- `CRON_SECRET`
- `DAILY_QUESTION_TEACHER_ID` (Filip's profile id)

### Required for billing (set in Vercel prod when going live)
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_*` (six SKUs above)

### Required for email
- `RESEND_API_KEY`

### Optional / observability
- `SENTRY_DSN`
- `NEXT_PUBLIC_POSTHOG_KEY`

---

## What we DON'T use (intentional)

- **No GraphQL.** Server actions + RPC.
- **No tRPC / oRPC.** Server actions handle the typed-RPC use case.
- **No Redux.** Zustand for client state, Supabase for server state.
- **No Tanstack Query.** Server components + revalidation.
- **No Prisma / Drizzle.** Supabase client is fine.
- **No custom auth.** Supabase Auth + RLS.
- **No Kubernetes.** Vercel + Supabase do the work.
- **No Docker for dev.** `npm run dev` is fine.
- **No microservices.** Single Next.js app with route handlers.

This is a deliberately simple stack. Every dependency was added because we needed it, not because it's trendy.

---

_Generated 2026-04-28. Pairs with `docs/BUSINESS_MODEL.md` for unit
economics. Update when a service or major dep changes._
