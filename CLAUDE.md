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

### Gradients (canonical — do not invent new ones)
There are exactly two Readee gradients. Copy these strings verbatim; never
write a new violet/indigo pair. An audit on Sep 1 2026 found **35 different
recipes for what was meant to be one brand gradient**, 13 of which were flat
(`from-violet-500 to-violet-500` renders a solid fill). That happens when each
screen re-derives the gradient instead of copying the canon.

| Role | Class | Use for |
|---|---|---|
| **Action** | `bg-gradient-to-r from-violet-600 to-violet-500` | buttons, CTAs, progress fills, avatar chips, filled badges |
| Action hover | `hover:from-violet-700 hover:to-violet-600` | pairs with the above |
| **Surface soft** | `bg-gradient-to-br from-violet-50 to-indigo-50` | tinted cards, callouts, empty-state panels |
| **Surface medium** | `bg-gradient-to-br from-violet-100 to-indigo-100` | the same, one step stronger |

- The action gradient is **same-hue on purpose**. It reads as a soft sheen, not
  a colour shift. Cross-hue indigo-to-violet is the pattern that makes an app
  look AI-generated; violet carries the brand, indigo lives in the soft tints.
- Direction (`-r` / `-br` / `-b`) may vary to suit the element. The colour
  stops may not.
- **Never write `from-X to-X` with the same colour at both stops.** That is a
  gradient function painting a flat fill. Use `bg-violet-500` instead.
- **There are exactly six gradients in the whole app.** Three canonical (above)
  cover 74 of 77 uses. The other three are semantic *states*, where the colour
  is information rather than decoration:

  | Exception | Where | Why it earns an exception |
  |---|---|---|
  | `from-rose-500 to-violet-600` | Fluency record button | rose = recording, a real affordance convention |
  | `from-violet-300 to-violet-400` | roadmap locked node | lighter = disabled |
  | `from-emerald-50/50 to-violet-50/50` | Fluency success | emerald = success, matches the semantic border colours |

- **"Decorative" is not a reason.** A Sep 2026 pass found 17 one-off recipes
  each justified as decorative; 14 of them were drift and collapsed into the
  canon with no visible loss. If a new gradient can't name the *state* it
  encodes, it should be one of the three canonical ones.

### ‼️ NEVER (anti-slop). These override any default styling instinct.
Checked against nine ed-tech leaders in Sep 2026 (Duolingo, Khan Kids, Teach
Your Monster, HOMER, Epic, Ello, Amira, Lexia, Reading Eggs). **Not one of them
uses any of the following.** If a screen wants one of these, it is reaching for
a generic default, not for Readee.

- **No pill/badge above a headline.** No pulsing or animated status dots.
- **No gradient on text.** Headlines are a solid colour. `bg-clip-text` is banned.
- **No floating/drifting background orbs or blobs.**
- **No shimmer sweeps, meteors, border beams, or animated grid patterns.**
- **No scroll-reveal on every section.** First screenful only, if at all.
- **No three generic feature cards in a row.** Real content grids are fine.
- **No dark mode.** Readee is a bright reading product for children; light text
  on a dark ground causes halation, which is actively bad for decoding.
- **No thin monochrome line icons on child-facing surfaces.** See below.
- **No native emoji** (existing rule) and **no icon standing in for a mascot** —
  empty states use the bunny, carrots use Readee's carrot.

### Icons: split by audience (DECIDED Sep 2026)
| Surface | Use | Why |
|---|---|---|
| **All customer chrome + state + parent screens** (arrows, chevrons, close, search, billing, settings, analytics, nav) | **`<Glyph />`** | Fluent System Icons, self-hosted in `public/icons/ui`. Rendered with `mask-image` + `currentColor`, so **semantic colour still works**: grey = locked, emerald = success, white = on a coloured fill. |
| **Child content + rewards** (carrots, stars, streaks, trophies, books, medals) | **`<FluentIcon />`** | Microsoft Fluent Emoji, Flat. Self-hosted in `public/icons/fluent`. |
| **Empty states** | **the bunny** (`<EmptyState mascot=...>`) | Nine poses already exist. Never an icon. |
| **Missing story cover** | **`<CoverFallback />`** | The reading bunny. |
| **Internal only** (owner, admin, classroom, student) | **Lucide** | Developer dashboards. None of it ships to a family. Not a migration miss - leave them. |

**Lucide is no longer allowed on any customer surface.** Glyph and FluentIcon are
the same vendor and design language; mixing in Lucide put two studios' drawing
conventions on one screen and it read as broken.

‼️ **`<Glyph name>` and `icon:` fields carry a NAME STRING, not a component.**
`<Icon />` where `Icon` is the string `"home"` renders a bare unknown element
that paints nothing, silently - and `<map>`/`<menu>` are real HTML tags, so they
do not even show up as unknown. Type icon fields as `GlyphName`, never `any`;
the `any` is what let this ship. Render with `<Glyph name={Icon} size={16} />`.
When auditing, ask **"does the imported name appear anywhere in the file body
outside the import?"** - not "does `<Name` appear". Verify in a browser
(`scripts/_shot-glyphaudit.ts`), because a missing icon leaves nothing to measure.

- `<FluentIcon name="carrot" size={20} />`. Sizes in use: 11, 14, 16, 18, 20,
  22, 24, 30, 88. Verified legible from 11px up.
- **Never a native emoji character.** The device renders it, so the same carrot
  is different artwork on iPhone, Chromebook and Samsung. We control none of it.
  Fluent Emoji is one fixed artwork everywhere, sized by us. That distinction is
  the whole point; do not "simplify" it back to a plain emoji.
- Licence: MIT, Copyright (c) Microsoft Corporation. `public/icons/fluent/LICENSE`
  ships alongside the assets because MIT requires the notice. Do not delete it.
- Adding an icon: download the Flat SVG from
  github.com/microsoft/fluentui-emoji into `public/icons/fluent/`, then add the
  name to `FLUENT_ICONS` in `app/_components/FluentIcon.tsx`.
- Adding a Glyph: drop the 24px regular SVG into `public/icons/ui/` as
  kebab-case.svg and add the name to `UI_ICONS` in `app/_components/Glyph.tsx`.
- **Why not Lucide on child surfaces:** it is a 2px monochrome stroke set and
  the shadcn/ui default. It reads as a developer dashboard, and thin strokes
  lose their silhouette at the size a child taps. Filled colour survives the
  shrink; outlines do not.

### Motion (canonical — copy these, don't invent)
An audit on Sep 2 2026 found **23 entrance rise distances and 19 durations**.
Nobody chose 23 rise distances; each screen re-derived one. Consolidated to
three of each:

| Role | Rise | Duration |
|---|---|---|
| Subtle (chips, rows, inline reveals) | `y: 8` | `duration: 0.2` |
| Standard (cards, panels, most reveals) | `y: 16` | `duration: 0.35` |
| Large (page-level, celebration) | `y: 24` | `duration: 0.5` |

- Downward entrances mirror it: `y: -8` / `-16` / `-24`.
- Standard entrance is `initial={{ opacity: 0, y: 16 }}` +
  `transition={{ duration: 0.35 }}`. Reach for another value only with a reason.
- **Legitimate exceptions, do not "fix" these:** a specific layout slide
  (`y: 288` in WhatsNew, `y: -110` on the floating carrots) and ambient or
  celebration loops over 1s (`repeat: Infinity` progress rings, the mystery-box
  reveal). Those are not entrance motion.
- Millisecond values (`700`, `850`) belong to CSS transitions and setTimeout,
  not Framer. Different unit, leave them alone.

### Shadows (canonical — copy these, don't invent)
An audit on Sep 2 2026 found **30 bespoke shadow recipes**, including the same
indigo drop written five ways (`.15` / `0.15` / `.18` / `.25`, and a `30px_-10px`
near-twin). Consolidated to four:

| Role | Class |
|---|---|
| Resting card / panel | `shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)]` |
| Small resting card | `shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)]` |
| Violet glow (interactive) | `shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)]` |
| ...its hover | `hover:shadow-[0_12px_28px_-8px_rgba(139,92,246,0.55)]` |
| Focus / selection ring | `shadow-[0_0_0_3px_rgba(139,92,246,0.15)]` (+ `_inset`) |

- Always write opacity as `0.18`, never `.18`. The bare-dot form is how the
  duplicates got in: they look different to grep but identical on screen.
- **Glows under violet elements must be violet** (`139,92,246`), not indigo. A
  violet button with an indigo glow was a real bug this sweep fixed.
- Prefer plain Tailwind (`shadow-sm` / `md` / `lg`) for anything neutral. Reach
  for an arbitrary shadow only when it needs a brand tint.

**Hard 3D-button shadows are a DIFFERENT thing and are correct.**
`shadow-[0_4px_0_0_#4338ca]` is the chunky pressed-button look (Duolingo uses
the same trick). The offset colour must match a darker shade of the button.
Keep these; they are not drift.

### Rules
- Spacing: Tailwind default scale only (4, 8, 12, 16, 24, 32, 48px). No arbitrary values.
- Shadows: use the four canonical recipes above. Do not invent new tinted shadows.
- Typography: One font family, regular + semibold weights only.
- Animations: Framer Motion for all transitions and reveals. Keep them purposeful.
- Empty states: Every empty list/tab needs a designed state — use the bunny mascot.
- Loading: Skeleton loaders, not spinners.
- Errors: Every data fetch must have an explicit error state — no blank screens.
- Toasts: shadcn/ui toasts for all success/error feedback. Consistent placement.

### Design Rules (strictly enforced)
- **No native emojis** - use `<Glyph />` / `<FluentIcon />` or custom images only. Swept and enforced Apr 2026; icon set replaced Sep 2026.
- **No em-dashes (—) in customer-facing copy** - the #1 AI-slop giveaway. Use a hyphen, comma, or colon, or rephrase. Applies to UI strings/JSX, page metadata/titles, toasts, error messages, customer emails, and marketing copy. Does NOT apply to code comments, AI-prompt strings, internal tooling, or reading-passage content (where em-dashes are legitimate prose). Swept Aug 2026.
- **Use "child" not "kid" in customer-facing copy** - say child / children (child's / children's), never kid / kids, in all UI strings, placeholders, labels, page metadata, toasts, error messages, and customer emails. Does NOT apply to code identifiers (variables, components, props, filenames), comments, AI-prompt strings, or lesson/passage/question content. Idiomatic brand or badge names ("Comeback Kid", "Big Kid Words") are exempt. Swept Aug 2026.
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
