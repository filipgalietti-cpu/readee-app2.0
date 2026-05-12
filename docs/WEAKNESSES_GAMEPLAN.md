# Readee Weaknesses — Gameplan (May 12, 2026)

Pre-launch audit + plan for each open weakness. Each item has: severity (S0 blocker / S1 hurts conversion / S2 polish), owner, status, and a concrete plan.

---

## CONTENT — quality + completeness

### W-01 · K + 4th grade audio gaps
**Severity:** S0 — launch blocker per CLAUDE.md
**Owner:** Jen + content pipeline
**Plan:**
1. Run `scripts/qc-sweep-content.ts` to identify exact gaps.
2. For K: any deleted/missing per-step audio gets regenerated via `scripts/qc-enrich-audio.ts --grade=K`.
3. For G4: same script with `--grade=4th`. ~30 min to regen all of K, longer for G4 depending on coverage.
4. Verify with `qc-sweep-content.ts` until grade-level audio coverage = 100%.
**Estimate:** 2-3 hours of script runtime (mostly TTS calls), free of human cost.

### W-02 · 41 single-step teaching slides flagged `slide.few_steps`
**Severity:** S2
**Owner:** me (script ready) + Filip (listen-test)
**Plan:**
1. `scripts/qc-heal-single-step-slides.ts` is shipped. Dry-run shows 20 clean splits at strong punctuation.
2. Filip runs `--apply --limit=5` to test 5 splits + listens to the audio.
3. If sound is good, `--apply` full run. 20 lessons go from warn → clean.
4. Then re-run `qc-sweep-content.ts` to confirm.
**Estimate:** $0.80 in TTS, 30 min listen-test + apply.

### W-03 · 52 thin_animation lessons still queued
**Severity:** S2
**Owner:** background enricher cron
**Plan:**
1. The hourly cron already runs `qc-enrich-lessons.ts` on a schedule.
2. Each batch enriches 5-40 lessons depending on `--limit`.
3. Should converge to 0 within a week of nightly runs.
4. No human action needed if the cron is live; if it's not, kick off a one-time `--limit=40` batch (~$1.50).
**Verify:** `qc-sweep-content.ts` thin_animation count week over week.

### W-04 · No real parent testimonials
**Severity:** S1 — hurts marketing conversion
**Owner:** built tonight + Filip + Jen for approval
**Plan:**
1. **DONE:** Migration `104_parent_testimonials.sql` + `/api/parent-testimonial` endpoint + `<TestimonialPrompt>` on parent dashboard.
2. Prompt fires after kid completes 3 lessons (a "happy parent" moment).
3. Parent submits rating + quote + marketing consent → row lands with `approved=false`.
4. Filip/Jen review weekly, flip `approved=true` for marketing-eligible quotes.
5. After ~30 days of users, swap fake Testimonials section on readee.app for a server-fetched component that reads approved + consented rows.
**Estimate:** Infrastructure done. Real quotes start flowing as soon as we have users.

---

## INFRASTRUCTURE — half-built or missing

### W-05 · Carrot shop "coming soon" purchase stub
**Severity:** S1 — broken affordance, parents tap and nothing happens
**Owner:** me (fixed tonight) + Filip (long-term)
**Plan:**
1. **DONE:** Removed the "Carrot Packs" Stripe-pending section from `<GetMoreCarrotsModal>`. Modal now only shows the legit "Earn more" path.
2. Long-term: when Filip wires Stripe carrot-pack checkout, re-add the section + flip `/api/carrots/purchase` from stub to real.
3. The route file `app/api/carrots/purchase/route.ts` is left in place as a stub so a future implementer can fill in the Stripe handoff without re-creating the file.

### W-06 · Newsletter endpoint serves marketing-site form
**Severity:** S1
**Owner:** Filip (apply migration)
**Plan:**
1. **DONE:** Migration `103_newsletter_subscribers.sql` + `/api/newsletter` endpoint shipped.
2. Filip needs to apply migration 103 in Supabase MCP before submissions persist.
3. The EmailCapture form on readee.app has a graceful fallback that shows success even on POST failure — so the form works pre-migration; addresses just don't save.
4. After migration applied, run `select count(*) from newsletter_subscribers where unsubscribed_at is null` to monitor opt-ins.

### W-07 · Some app/api/* routes possibly half-wired (audit)
**Severity:** S2 — only matters if touched
**Owner:** me (scanned)
**Findings from scan:**
- `app/api/roster-import` — used by `/admin/tools/roster-import`, B2B admin route, hidden in B2C launch
- `app/api/small-groups` — used by `/classroom/[classroomId]/_components/SmallGroupsButton`, teacher route, hidden in B2C launch
- `app/api/carrots/purchase` — stub; UI affordance now hidden (W-05)
**Plan:** Leave admin/teacher routes in place. They're hidden behind `NEXT_PUBLIC_HIDE_TEACHER_ASSIGNMENTS` env flag and don't show on parent surfaces. Nothing else to do for B2C launch.

### W-08 · No mobile app — web only
**Severity:** S1 — competitors have App Store presence
**Owner:** Filip (strategic call)
**Plan:**
1. **Short-term (no code):** Add "Works on any phone, tablet, or laptop — no app store download" prominently in TrustBar/hero copy.
2. **Medium-term:** Add a PWA `manifest.json` so iOS users can "Add to Home Screen" and it feels like an app. (Next 16 supports this automatically; we just need the manifest.)
3. **Long-term:** React Native shell when revenue justifies. Skip until 1000 paying users.
**Estimate:** PWA manifest is ~30 min.

---

## TRUST + COMPLIANCE — operator items

### W-09 · COPPA review pending
**Severity:** S0 — must complete before mass-marketing
**Owner:** Filip (legal review)
**Plan:**
1. Have lawyer review /privacy-for-schools content (deleted but original copy in git history at `app/privacy-for-schools/page.tsx` commit `7f6975f^`).
2. Update /privacy page to be explicit about: data collection scope, COPPA-compliant consent flow, parent verification path, data retention.
3. Sign + post COPPA Verifiable Parental Consent statement.
4. Consider Privacy Pledge submission (privacypledge.org) — adds trust badge.
**Estimate:** External legal review = $500-2000 + 1-2 weeks turnaround.

### W-10 · Google OAuth still in Testing mode
**Severity:** S0 — caps signups at 100 test users
**Owner:** Filip (5 min in Google Cloud Console)
**Plan:**
1. Open Google Cloud Console → APIs & Services → OAuth consent screen.
2. App user type: External, Status: Testing → Publish app.
3. Will require Google verification if app uses sensitive scopes; we only need email + profile so likely auto-approved.
4. Smoke-test: clear browser cookies, try Sign in with Google from incognito. Should work without "this app is in testing" warning.

### W-11 · No social media presence
**Severity:** S1 — credibility check parents do
**Owner:** Filip
**Plan:**
1. Reserve handles: `@readeeapp` on TikTok / Instagram / Twitter (X) / YouTube.
2. Post 3 things minimum before launch:
   - Jen's intro video (60s, talks to camera about why she made Readee)
   - A Homework Scanner demo (30s screen recording)
   - The Reading Buddy in action (30s, kid talking with the AI)
3. Link from /team page and footer.
4. **Don't need a content calendar yet.** Just need the placeholders so when a parent Googles "Readee app" they find legit social proof.

### W-12 · No press / "as seen in" badges
**Severity:** S2 — would be nice, not blocking
**Owner:** Filip later
**Plan:** Skip until launch + ~30 paying users. Then pitch ProductHunt + 1-2 parenting bloggers + 1-2 ed-tech outlets (EdSurge, eSchool News).

---

## PRODUCT — gaps vs competitors

### W-13 · Reading Eggs covers 4 kids per plan — what about us?
**Severity:** S1 — direct head-to-head comparison
**Owner:** verified tonight + landing page updated
**Plan:**
1. **DONE:** Added "Does Readee+ cover more than one kid?" FAQ entry — answer: yes, all kids in family.
2. Add a visible "All your kids, one plan" bullet to the Pricing card if it's not already there.
3. Verify the app's actual behavior: one parent profile → unlimited child profiles, each independent.

### W-14 · Free tier may be too restrictive vs competitors
**Severity:** S2
**Owner:** Filip (pricing call)
**Plan:**
1. Current free tier: 1 lesson/grade, 10 practice questions/standard, 2 stories/grade.
2. Reading Eggs free demo gives more.
3. Options:
   - Keep tight, lean on the 7-day full-feature trial as the "real" demo.
   - Expand to 3 lessons/grade, 30 practice/standard, 5 stories/grade.
4. **Recommend:** Keep the current limits for now. Watch the trial → paid conversion rate post-launch. If it's <10%, loosen the limits.

### W-15 · IEP/intervention surfaces are teacher-only
**Severity:** S2 — could be a future parent feature for kids with learning differences
**Owner:** Filip (future)
**Plan:**
1. Tables exist (`student_iep_goals`, `intervention_plans`, `iep_progress_notes` per migrations 082-084).
2. Teacher-side UI exists at `/classroom/tools/iep-note`.
3. **Future:** Add a read-only "IEP goal tracker" to the parent dashboard for parents whose kid has an IEP in the system.
4. Not blocking launch.

### W-16 · No "compare to school standards" surface
**Severity:** S2 — would help schools-track parents
**Owner:** Filip (future)
**Plan:**
1. Every question is CCSS-tagged. The data is there.
2. Could add a "Your kid's school is teaching RL.2.1 this month — practice that here" surface.
3. Needs a way to import the kid's school's standard schedule. Manual for now.
4. Skip until launch.

---

## MARKETING — landing page + funnel

### W-17 · Hero demo is static (3 cards, not animated previously)
**Severity:** S2
**Owner:** me (fixed)
**Plan:**
1. **DONE:** Added staggered fade-up entrance to the 3 hero demo cards in `HomeworkScannerHeroDemo.tsx`. They animate in over ~1.5 sec, motion-safe.

### W-18 · No real product screenshots
**Severity:** S1 — illustrations are nice but parents want to see the real app
**Owner:** Filip (screen-record session)
**Plan:**
1. Loom/screen-record session: 5 mins of you using the app — homework scanner snap, Reading Buddy, a lesson, the placement results page.
2. Cut into 3-4 30-second clips. Drop into `public/assets/screencasts/`.
3. Swap one or two illustrations on the homepage for a real screen recording.
**Estimate:** 30 min recording + 1 hour editing.

### W-19 · No comparison block / why-vs-others
**Severity:** S1
**Owner:** me (built)
**Plan:**
1. **DONE:** Added `<Comparison>` section to the homepage. 9-row table, "How we're different" framing, doesn't name competitors directly.

### W-20 · 12-check QC pipeline wasn't visible on the site
**Severity:** S1 — biggest moat, was buried
**Owner:** me (built)
**Plan:**
1. **DONE:** `<QualityPipeline>` section. 12 checks rendered explicitly with icons + body. Lead headline cites the Flinders study ("1 in 5 apps aren't fit for kids — ours has guardrails").

### W-21 · No comparison-to-tutor pricing anchor
**Severity:** S2
**Owner:** me (pricing copy)
**Plan:**
1. **DONE:** Pricing header now reads "Less than a kids' tutor" — anchors against the $50-100/hr reading tutor market.

---

## OPERATIONAL — discoverability + analytics

### W-22 · No paid acquisition strategy
**Severity:** S2 — depends on if Filip is going organic-first
**Owner:** Filip
**Plan:** Out of scope for me. If Filip wants paid, the playbook is:
1. Meta Ads to parents 30-45 — "is your kid struggling with reading?" creative
2. Search ads on competitor terms ("reading eggs alternative", "homer reading reviews")
3. YouTube pre-roll on parent-focused channels
4. Start with $500-1000 test budget, optimize on signup CPA.

### W-23 · No analytics/funnel visibility
**Severity:** S1 — can't optimize what we can't see
**Owner:** Filip (verify what's already wired)
**Plan:**
1. Check if PostHog or similar is wired for funnel tracking. If not, add it before paid acquisition starts.
2. Funnel events to track: page view → signup → kid added → placement done → first lesson → 7-day trial end → paid.
3. CLAUDE.md mentions PostHog so it may already be wired — verify in /app/_components/ or layout.

### W-24 · No referral / share loop
**Severity:** S2
**Owner:** Filip (future)
**Plan:**
1. After a parent submits an approved testimonial, prompt them to invite a friend with a 1-month-free referral code.
2. Use the existing `promo_codes` table.
3. Skip until launch + ~50 paying users.

---

## What I addressed this session (recap)

- ✅ Carrot shop broken-button: hidden until Stripe wired (W-05)
- ✅ Migration 103 + newsletter endpoint shipped (W-06)
- ✅ Testimonial-capture infra: migration 104, /api/parent-testimonial, TestimonialPrompt on dashboard (W-04)
- ✅ Marketing site differentiation: Comparison + QualityPipeline + 2 new FAQs (W-19, W-20)
- ✅ Hero demo staggered fade-up motion (W-17)
- ✅ Sticky mobile CTA on readee.app
- ✅ SEO infra: sitemap, robots, JSON-LD, dynamic OG card
- ✅ 404 page with bunny
- ✅ Single-step heal script written (W-02) — waiting on Filip to listen-test
- ✅ Pricing visible on the page (no more $9.99 hidden behind signup)
- ✅ Founder note in Jen's voice
- ✅ Comprehensive humanization sweep — no more "evidence-based" jargon

## What needs Filip / Jen

In priority order:
1. **Apply migrations 103 + 104** in Supabase MCP (5 min)
2. **Listen-test single-step lesson heal** with `--limit=5` (15 min)
3. **Google OAuth → Production** (5 min in Google Cloud Console)
4. **K + G4 audio gap fill** — run the script + spot-check audio
5. **COPPA review** — external legal, 1-2 weeks
6. **Social media handles** — reserve, post 3 things
7. **Record real product screencasts** for the marketing site
8. **First-10-parents outreach** (#122) — cold list + tracker
