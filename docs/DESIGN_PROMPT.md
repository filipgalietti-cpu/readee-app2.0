# Readee — UI Facelift Design Prompt

Drop this prompt into any capable LLM (Claude Sonnet 4.6 / Opus 4.7, v0.dev, Lovable, or GPT-5). It's self-contained and provider-agnostic.

---

## Prompt (copy from here)

You are a senior product designer at an ed-tech company. You have deep experience with K-12 reading platforms (Lexia, Reading A-Z, Newsela, IXL, Epic). You also know consumer K-12 design intimately (Khan Kids, Duolingo, ABCmouse). Today you're proposing a **comprehensive UI facelift** for an existing Next.js app called **Readee**.

The facelift must serve TWO distinct audiences without splitting the codebase:
- **B2C** — parents and K-4 children. Aesthetic: warm, playful, delightful, slightly game-like. Aspires to "Khan Kids meets Duolingo."
- **B2B** — teachers, school admins, district admins. Aesthetic: credible, professional, data-dense when needed, the kind of thing a director of curriculum approves to spend $5K/year on.

Both surfaces share components (we don't want a fork) but the *density and tone* differ by route. Think how Linear feels precise vs how Notion feels approachable — same primitives, different posture.

### Product context
**Readee** = K-4 reading intervention platform aligned to Common Core ELA + Science of Reading. Co-founded by an engineer (Filip) and a certified reading specialist + 3rd-grade teacher (Jennifer Klingerman).

Tagline: *"Unlock Reading with Readee."*
Brand line: *"Built by Educators, for Education."*
Mascot: a friendly white-and-violet bunny named "Readee."

What the app does:
- Karaoke-style interactive lesson slideshows (kid-side)
- Standards-aligned practice questions with green/red feedback
- Stories library, leveled passages, decodable books
- Adaptive placement test
- AI co-teacher tools (Reading Buddy real-time voice tutor, Homework Scanner via photo, Coach Mode for small-group analysis, IEP/504 progress notes, Writing Rubric, Calibrated Item Builder, Roster Importer, Translate-anything in 10 languages)
- Real-time fluency check (kid reads aloud, AI scores per-word + WCPM + prosody)
- Teacher classroom dashboard (assignments, reports, live quiz, library)

### Tech stack constraints (do not propose changes to these)
- **Framework**: Next.js 16 App Router (React Server Components default, "use client" when interactive)
- **Styling**: Tailwind CSS v4 — utility classes only, default scale (4/8/12/16/24/32/48px), one shadow style, one font family
- **UI primitives**: Radix UI + shadcn/ui (Dialog, Popover, Toast, Select, Tabs already in repo)
- **Magic UI** for delight components (ShineBorder, Confetti, etc.) — used sparingly
- **Animation**: Framer Motion for all transitions and reveals (no raw CSS transitions on interactive elements)
- **Icons**: Lucide React only, never native emojis
- **Charts**: Recharts
- **Images**: `next/image` always, no raw `<img>`

### Brand palette (locked — propose nuance, don't replace)
- Primary: indigo-600 / violet-600 (the brand gradient `from-indigo-600 to-violet-500`)
- Accent kid-side: pink-400, rose-400, amber-400, emerald-400 (use as section accents)
- Accent teacher-side: zinc-700/900 for body text, indigo for actions, sparingly
- Background: white / slate-900 (dark mode supported throughout)
- Watercolor / sky aesthetic in marketing surfaces only — *not* in the app interior

### Brand voice (kid-side)
- Warm, encouraging, never patronizing
- Short sentences (K-4 reading level)
- Specific praise: "You read 'gigantic' beautifully!" not "Great job!"
- The bunny mascot speaks in first person occasionally, never breaks character

### Brand voice (teacher-side)
- Direct, professional, time-respecting (teachers have 0 minutes)
- Numbers and CCSS strands surfaced clearly
- No cutesy copy, no exclamation points outside genuine wins

### What's working (keep, don't redesign)
- The kid-side dashboard greeting card with avatar + streak + carrots
- The "Start Your Adventure" lesson CTA card (purple gradient with rocket icon)
- The 3-tile hero row (Practice, Stories, My Journey) on parent dashboard
- Karaoke-style lesson slideshow timing
- The fluency analyzer per-word color-coded result card
- The Tools hub (`/classroom/tools`) two-section "Available now / Upgrade to unlock" layout
- The ✓/✗ thumbs + reason field on AI-generated questions

### Pain points (fix these)
1. **Teacher sidebar collapsed rail** still feels heavy even after grouping. Designs for an even tighter rail or a hover-to-expand mega-rail welcome.
2. **Kid dashboard spacing** is uniform now (`space-y-5`) but the *cards themselves* feel inconsistent — some have icon+title+desc, others have circular progress, others have stat strips. Propose a shared card primitive.
3. **Tools hub locked tiles** are cleaner but still read as "8 generic cards." A district admin should immediately understand "I need School plan for THESE three." Consider grouping locked tiles by tier, not just sorting.
4. **The educator's classroom detail page** (`/classroom/[id]`) has a roster table, an assignments list, a join-code panel, and a settings nav — all stacked. Needs a real layout decision: tabs? collapsible? right-rail?
5. **Onboarding** (parent + teacher) is mostly form-driven. Could benefit from a friendly progress feel — illustration per step, single primary action, deferrable secondaries.
6. **Empty states** are bunny-led (good) but copy varies in tone across routes. Standardize.
7. **Mobile**: most of B2C is mobile-first. B2B (teacher tools) is desktop-mostly. Some shared components (e.g., student player) need to feel premium on iPad — a primary district device.
8. **Marketing pages on `learn.readee.app`** have an old-app-flavor — they should feel like Notion's marketing pages: lots of white space, screenshots, social proof, district logos.

### Surfaces to redesign (priority order)

**B2C (parent + kid):**
1. Parent dashboard `/dashboard` — top-of-stack card system, daily goal, next-action CTA
2. Kid lesson slideshow `/learn?standard=...&child=...`
3. Practice flow `/practice?...` — green/red feedback animations, hint reveal
4. Reading Buddy `/buddy` — currently functional, needs visual love (the mic button is the hero; everything else recedes)
5. Stories `/stories?child=...`
6. Journey `/journey?child=...`
7. Avatar customizer (DiceBear-based)
8. Homework Scanner `/dashboard/homework-scan`
9. Upgrade `/upgrade` — needs to convert; should feel like Stripe's pricing page in tone

**B2B (teacher + admin):**
10. Teacher classroom dashboard `/classroom`
11. Classroom detail `/classroom/[id]` — the multi-tab one
12. Tools hub `/classroom/tools` — already redesigned today, may need polish
13. Reports `/classroom/reports` — data-dense, needs clear hierarchy
14. Library `/classroom/library` — large content browser, smart-search bar
15. AI Tools individual pages (Coach, IEP, Writing Rubric, Calibrated, Translate, Roster) — all share a similar "form → result card" pattern; propose a tool-page template
16. Live quiz hub `/classroom/live`
17. Reading Journey teacher view (mirrors kid journey)
18. Admin dashboards (school + district)

**Marketing (separate Vercel deploy at readee.app):**
19. Landing page
20. Pricing page
21. About page
22. /schools (district sales)
23. Privacy/COPPA pages

### Constraints to honor
- One font family, regular + semibold weights only
- Tailwind default spacing scale; never arbitrary values like `mt-[13px]`
- One shadow style across the app — don't introduce stack of new depths
- No native emojis anywhere in the app — use Lucide icons or custom illustrations
- Quotes: `"` for dialogue/passages, `'` for contractions, `**word**` for emphasis
- Image style for any new illustrations: "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors"
- Empty states need a designed state with the bunny mascot
- Loading states are skeleton loaders, not spinners (except inside buttons)
- All toasts via shadcn/ui — consistent placement
- Every interactive element keyboard-navigable
- Accessibility: WCAG 2.1 AA minimum; explicit focus rings; color is never the only signal

### Output format I want
For each surface in the priority list, give me:

1. **Information architecture** — what lives on the page, in what hierarchy. Use a numbered tree.
2. **Visual layout sketch** — text-described (it's fine) but precise. "Hero card spans full width, 240px tall, gradient indigo→violet, centered illustration on left, copy + CTA stack on right."
3. **Component breakdown** — list every distinct component, mark which already exist in the codebase (`<TranslateToggle>`, `<SemanticSearchBar>`, `<DailyQuestionCard>`, `<FluencyRecorder>`, etc.) vs which need to be built new.
4. **Tailwind class hints** for the key elements — actual classes, not abstract descriptions. e.g. `bg-gradient-to-br from-indigo-600 to-violet-500 rounded-3xl shadow-lg p-6`.
5. **Motion notes** — which elements animate, what easing, when (page enter, hover, success).
6. **Mobile delta** — what changes on a 375px viewport.
7. **Empty state** — exact bunny pose / illustration cue + copy.
8. **Accessibility callout** — anything specific to this surface (focus order, ARIA roles).
9. **Migration plan** — can we ship this without rewriting the page? Which existing classes/components to keep, which to refactor.

Plus, at the very end, give me **a shared design-system delta** — the cross-cutting changes (new card primitive? new tool-page template? sidebar treatment?) that should ship FIRST so the rest cascade cleanly.

### How to start
Don't try to do all 23 surfaces in one shot. **Start with the design-system delta** — propose the shared card primitive, the tool-page template, and the sidebar treatment first. Then sketch the **5 highest-leverage surfaces** with full output:

1. Parent dashboard (B2C anchor)
2. Reading Buddy (the demo asset for districts)
3. Teacher classroom dashboard (B2B anchor)
4. Tools hub (the upsell asset)
5. Upgrade page (the conversion asset)

Then ask me which surfaces from the rest of the list I want fleshed out next.

### Tone for your response
You are a peer designer talking to the founder, not a vendor. Be direct, opinionated, and willing to call out tradeoffs. If something I'm asking for is wrong, push back. If you'd kill a feature instead of redesign it, say so. I'd rather have one strong "we should rip this out" than three diplomatic suggestions.

---

## End of prompt

When you paste it, just hit send. The model will produce the design-system delta + 5 anchor surfaces. Iterate from there.
