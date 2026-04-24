# Readee — Claude Code Context

## What is Readee?
A K–4 reading intervention platform aligned to Common Core ELA and Science of Reading methodology.
Target users: early readers, children with learning challenges, families seeking above-grade-level performance.
Tagline: **"Unlock Reading with Readee"**
Brand positioning: **"Built by Educators, for Education"**

Co-founders: Filip (engineering, product) and Jennifer Klingerman (certified reading specialist, 3rd grade teacher — content, QA, design).

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS |
| Database / Auth | Supabase |
| Payments | Stripe |
| Animation | Framer Motion |
| Charts | Recharts |
| UI Components | Radix UI + shadcn/ui |
| Deployment | Vercel |
| TTS | Gemini TTS (Autonoe voice) |
| Image Gen | Vertex AI Imagen |

---

## Design System

**Palette:** Indigo/purple primary. Watercolor/sky aesthetic.
**Mascot:** Readee bunny.
**Tone:** Playful, encouraging, game-like — but credibly educational.

### Rules
- Spacing: Tailwind default scale only (4, 8, 12, 16, 24, 32, 48px). No arbitrary values.
- Shadows: One consistent shadow style across the app. Do not mix depths.
- Typography: One font family, regular + semibold weights only.
- Animations: Framer Motion for all transitions and reveals. Keep them purposeful.
- Empty states: Every empty list/tab needs a designed state — use the bunny mascot.
- Loading: Skeleton loaders, not spinners.
- Errors: Every data fetch must have an explicit error state — no blank screens.
- Toasts: shadcn/ui toasts for all success/error feedback. Consistent placement.

### Design Rules (strictly enforced)
- **No native emojis** — use Lucide icons or custom images only. Swept and enforced Apr 2026.
- Quotes: `"` for dialogue/passages, `'` only for contractions, `**word**` for emphasis
- Image style: "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors"

---

## Asset Pipeline

### Supabase Storage URL Format
- Images: `https://...supabase.co/.../images/{grade}/{standard}/{id}.png`
- Audio: `https://...supabase.co/.../audio/{grade}/{standard}/{id}.mp3`
- Hint audio: `.../{id}-hint.mp3`
- Incorrect answer audio: `.../{id}-incorrect.mp3`
- Phonemes: `audio/phonemes/{id}.mp3`
- Grade folders: `kindergarten`, `1st-grade`, `2nd-grade`, `3rd-grade`, `4th-grade`

### Generation Scripts (in `/scripts`)
- `generate-images.js` — Vertex AI Imagen 4.0 batch generator. Reads CSV (Folder, Filename, Prompt). 1s delay, MAX_REQUESTS=500. Progress tracked in `image-progress.json`.
- `generate-audio.js` — Gemini TTS batch generator (Autonoe voice). Sequential only (concurrency fails). 3-retry with forced token refresh on 401.
- `upload-images-to-supabase.js` / `upload-audio.js` — Supabase Storage uploaders with x-upsert.
- `master_manifest.json` — 896 questions, source of truth for all question data.
- `build-master-manifest.js` — rebuilds manifest → `app/data/*-standards-questions.json`

---

## App Architecture

### Core Methodology (3 steps per lesson)
1. **Lesson** — Karaoke-style interactive slideshow with sub-chunk TTS audio cues
2. **Practice** — Standards-aligned questions with green/red feedback
3. **Excel** — Mastery/extension activities

### Curriculum
- Grades: K–4 (57 total lessons)
- 911 standards practice questions across K–4
- Diagnostic assessment questions
- Audio: Gemini TTS, Autonoe voice, stored in Supabase Storage

### Subscription Model
- Free tier + **Readee+** at $9.99/month (or $6.99/month billed annually)
- Stripe handles all subscriptions — web-only (no Apple IAP)
- Free trial: 7 days — controlled via Stripe, not custom logic
- `profiles.plan` column in Supabase is the source of truth (`'free'` or `'premium'`)
- Stripe webhook sets `plan = 'premium'` on subscribe, `plan = 'free'` on cancel/delete

### Free Tier Limits (defined in lib/plan/limits.ts)
- Lessons: 1 per grade (lesson index 0 only)
- Practice: 10 attempts per standard (tracked via practice_results)
- Stories: 2 per grade

### Gating Architecture (fully built, Stripe not yet wired)
All gating is complete. When Stripe is added, only the webhook needs to update `profiles.plan`.

| Route | Gate Type | Free User Result |
|---|---|---|
| /analytics | Proxy redirect | /upgrade?reason=analytics |
| /learn (lesson 2+) | Client redirect | /upgrade?reason=lesson |
| /lesson (L2+) | Client redirect | /upgrade?reason=lesson |
| /practice (>10 attempts) | Client redirect | /upgrade?reason=practice |
| /stories (story 3+/grade) | Client redirect | /upgrade?reason=story |
| /journey | In-page locks | Lock icon + paywall onClick |

- Upgrade page lives at `/upgrade` — accepts `?reason=` param for contextual hero copy
- `lib/plan/check-access.ts` — server-side `getUserPlan()` helper
- `lib/plan/limits.ts` — central free tier limits, always reference this, never hardcode

### Gamification
- XP system
- Streaks
- Customizable backgrounds
- DiceBear-based avatar customizer

---

## Key Pages & Components

- **Dashboard** — sidebar navigation, consolidated nav
- **Reading Journey** — vertical timeline (Becker CPA-style), section grouping, progress rail with status nodes, Framer Motion animations
- **Lesson Slideshow** — karaoke TTS slides, animated reveals, per-slide visual differentiation
- **Practice Tab** — standards questions, green/red feedback UI
- **Settings** — account, subscription, avatar
- **Landing Page** — above fold: headline + subheadline + one CTA. Jennifer's credentials visible. Screenshot/demo of app. Mobile-first.
- **Upgrade Page** — `/upgrade` with `?reason=` contextual copy, monthly/annual toggle, Jennifer trust signal, promo code redemption
- **Stories Library** — 25 original decodable stories (5 per grade K-4), sentence-per-line reader, 3 comprehension Qs each
- **Placement Test** — adaptive 20-question assessment (K-easy → 4th-hard), weighted scoring, 3-wrong early stop
- **About Page** — founder story, 3-step method, Readee Classroom teaser

---

## Content & Data

### Lesson Data
- `app/data/sample-lessons.json` — 201 lessons covering K-4 (38 K + 45 G1 + 43 G2 + 41 G3 + 34 G4), all wired to MCQs as of Apr 21 2026
- `app/data/*-standards-questions.json` — 911 practice questions across K-4 (rebuilt from master manifest)
- `lib/data/lessons.json` — lesson metadata by grade level
- `scripts/stories-bank.json` — 25 stories with cover images, text, and comprehension questions

### Audio Assets
- 1,792 question audio files (question + hint per question)
- 763 incorrect answer audio files ("The correct answer is...")
- 45 phoneme audio files (isolated speech sounds for letter/phonics questions)
- 125 story audio files
- All generated via Gemini TTS (Autonoe voice), stored in Supabase Storage

### Image Assets
- 896 question images (Imagen 4.0), stored in Supabase Storage
- 25 story cover images
- 5 grade badge icons (`public/images/ui/grades/`)
- All follow "bright 2D cartoon" style

---

## Supabase Schema

### Key Tables
- `profiles` — id, email, role, plan (`'free'`/`'premium'`), onboarding_complete, tos_accepted_at, tos_version
- `children` — child profiles linked to parent, reading_level, streak_days, carrots, avatar config
- `practice_results` — standard_id, child_id, questions_correct, questions_attempted
- `lessons_progress` — lesson_id, child_id, section (`'learn'`/`'practice'`), score
- `promo_codes` — code, max_uses, current_uses, expires_at
- `promo_redemptions` — user_id, promo_code_id, redeemed_at

### Conventions
- Use Supabase Auth for all user management
- Storage buckets: `images` and `audio`, organized by `{grade}/{standard}/`
- Never expose service role key on client side
- Admin operations use `supabaseAdmin()` from `lib/supabase/admin.ts`

---

## Stripe Conventions
- All subscription logic server-side (API routes or server actions)
- Webhook handler validates Stripe signature before processing
- Free trial controlled via Stripe, not database flags

---

## Code Conventions
- Use App Router patterns (server components by default, client only when needed)
- Fetch data in server components or route handlers — not client useEffect where avoidable
- shadcn/ui for all base UI — do not rebuild what shadcn already provides
- Framer Motion for all animations — no raw CSS transitions on interactive elements
- `next/image` for every image — no raw `<img>` tags
- Optimistic UI on user actions — update state instantly, sync in background
- Keyboard navigation must work on all interactive elements

---

## What NOT to Do
- Do not add new dependencies without asking — the stack is intentionally locked
- Do not use arbitrary Tailwind values (e.g. `mt-[13px]`) — use the scale
- Do not put subscription logic in client components
- Do not skip empty states or error states — they are required
- Do not mix font weights beyond regular and semibold

---

## Business
- **Entity**: Readee Learning LLC (New Jersey), EIN obtained
- **Email**: hello@readee.app (forwarding via Porkbun)
- **Domain**: readee.app (landing page), learn.readee.app (app)

---

## Next.js 16 Notes
- Uses `proxy.ts` instead of `middleware.ts` — Next.js 16 renamed the concept
- Protected routes use `app/(protected)/layout.tsx` for server-side auth check + TosGate
- Sidebar: `AppSidebar` + `SidebarShell` wrapping all protected pages

---

## Current Pre-Launch Blockers (reference for prioritization)
1. Stripe — wire checkout + webhook to existing gating (gating fully built, webhook just needs to flip profiles.plan)
2. K lesson audit — 31 of 36 lessons still need ear-check after timing upgrade
3. Grades 1-4 lesson content — only stubs exist in sample-lessons.json
4. Audio pipeline — regenerate deleted Kindergarten lesson audio, generate 4th grade audio
5. Landing page — build and ship
6. Social media — Instagram and TikTok
7. COPPA review
8. Google OAuth: flip from Testing → Production
9. Privacy Policy and Terms of Service pages live

## Completed
- Paywall gating system — proxy, client redirects, free tier limits, upgrade page
- Upgrade page at /upgrade with contextual ?reason= copy, monthly/annual toggle
- Incorrect answer audio — 763 files generated and uploaded to Supabase
- All native emojis replaced with Lucide icons
- Readee Learning LLC formed (NJ)
- 896 question images + 1,792 audio files generated and uploaded
- 25 stories with images and TTS
- Adaptive placement test
- Journey page + Practice Hub
- 45 phoneme audio files
