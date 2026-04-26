# Week of Apr 25 2026 — deliverables

_Living doc. Update status as items move._

The last 36 hours shipped a lot. This week is **stabilization +
distribution**: prove what we built actually works, plug the prod
ops gaps, and start putting it in front of real teachers.

## Status legend
- 🔴 **Blocker** — ship-blocking, do first
- 🟡 **Important** — do this week
- 🟢 **Nice-to-have** — do if time

---

## 🔴 Blockers (must close this week)

### 1. Wire Stripe live products + Vercel env vars
Code is shipped, products created in Stripe (live mode), values are in
local `.env.local`. **Vercel production env vars still need to be
pasted in and a redeploy fired.** Without this, the new pricing /
top-up flows silently 500 on prod.

Vars to add (Production scope, paste from `.env.local`):
- `STRIPE_PRICE_TEACHER_SOLO_MONTHLY`
- `STRIPE_PRICE_TEACHER_SOLO_ANNUAL`
- `STRIPE_PRICE_CREDITS_250`
- `STRIPE_PRICE_CREDITS_500`
- `CRON_SECRET`
- `PLAY_MODE_SECRET` (optional — falls back to STRIPE_WEBHOOK_SECRET if unset)

After redeploy, smoke-test in this exact order:
- [ ] `/upgrade` shows two cards (Readee+ + Teacher Solo)
- [ ] Click Teacher Solo → real Stripe Checkout opens at $19/mo with 7-day trial
- [ ] On a quiz builder, click **Buy more credits** → Stripe one-time checkout opens
- [ ] `curl -H "Authorization: Bearer $CRON_SECRET" https://learn.readee.app/api/cron/parent-digest` returns 200

### 2. End-to-end test the Build with AI flow
Single most-tested feature this week. Run it 5+ times across grades
+ topic types so we catch any cold-start failures.

- [ ] Teacher signs in → `/classroom/authoring/wizard`
- [ ] Step 1: title + grade + topic (try a typing-suggestion prompt)
- [ ] Step 2: passage on
- [ ] Step 3: 3 MCQ + 2 T/F + 1 matching pair set
- [ ] Step 4: passage image + passage TTS + per-question TTS, voice = Sage
- [ ] Build → Progress bar shows + step labels rotate
- [ ] Lands on quiz editor with `built=1` banner
- [ ] **MCQ count is exactly 3** (the bug we fixed)
- [ ] **T/F questions exist with kind = true_false** (the other bug we fixed)
- [ ] **Matching pairs is one question with the connect-the-pairs UI**
- [ ] Click **Preview as student** → Card view scrolls through all questions
- [ ] Toggle to **Play it** → student runner walks through; matching board works

### 3. End-to-end teacher signup
Migration 053 just fixed `handle_new_user` to default new accounts to
`role='parent'` (was `'student'`) and respect a role hint from
`raw_user_meta_data`. The signup form now has a Parent / Teacher toggle
and the OAuth callback stamps `role='educator'` when the Google flow
originates from `?signup_role=educator`. Verify both halves work.

- [ ] In an incognito window, hit `/signup?as=teacher` — toggle shows
      Teacher selected by default, banner reads "Teacher signup — free
      to start"
- [ ] Email/password path: create a fresh account with the toggle on
      Teacher → confirm email → sign in → `/classroom` opens (not
      `/dashboard`), `profiles.role = 'educator'` in DB
- [ ] Google OAuth path: same as above with the Continue with Google
      button — verify the new profile lands as `role='educator'`, not
      `'parent'`
- [ ] Switch toggle to Parent on the same page → password signup creates
      a profile with `role='parent'`, redirects to `/dashboard`
- [ ] Old `?as=teacher` URL still works (existing teacher signup links)

### 4. End-to-end test the assign + complete flow
Where we hit the "Start button does nothing" + "completion didn't
register" bugs in the last day.

- [ ] Teacher assigns a custom quiz to a classroom that has the
      hybrid test child as a member
- [ ] Switch to the parent dashboard for that child
- [ ] "From your teacher" card shows the assignment with a Start pill
- [ ] Click Start → routes to `/practice/custom-quiz/[id]?child=...`
- [ ] Passage renders in big readable Georgia serif (not the old tiny gray)
- [ ] Kid plays through, completes
- [ ] Done screen shows score + carrots
- [ ] Return to dashboard → **assignment is GONE from the open list**

---

## 🟡 Important (do this week)

### 5. Voice samples sanity check
Samples were generated and uploaded to `audio/voice-samples/{id}.wav`.

- [ ] Open the wizard, enable any audio toggle
- [ ] Each of the 6 voices plays its sample on click
- [ ] Voice persists into the actual TTS at build time (build a quiz
      with voice = Marcus, listen to the resulting passage TTS — should
      be the deeper narrator voice)

### 6. Account page on every account type
Just refactored the account page to be capability-aware. Verify on
3 account shapes:

- [ ] Pure teacher (owns classroom, no children) — header says "Teacher
      account · N classrooms", Linked Readers + Grown-up PIN sections
      are hidden, Teaching section appears
- [ ] Pure parent (no classroom, has children) — header says "Parent
      account · N children", Teaching section hidden
- [ ] Hybrid (Filip's account) — header says "Teacher · Parent
      account · N classrooms · N children", BOTH sections visible
- [ ] Plan section shows "Teacher Solo" badge correctly when on that plan

### 7. UI smoke pass — every surface that changed
Roughly 20 commits in the last 24h touched UI. Click through:

- [ ] **Sidebar**: Build with AI shimmers (rainbow), Top Up button is
      transparent (not black), Credits widget shows + works for hybrid
      teachers, view-mode toggle present, Family group collapsed by default
- [ ] **Build with AI wizard**: typing-suggestions cycle below empty
      topic field, voice selector appears when audio toggles on, progress
      bar animates during build
- [ ] **Library**: Standards index loads as default, click a card → jumps
      to question list expanded
- [ ] **CSV import**: from any quiz, "Import from CSV" → modal opens →
      template downloads → upload + preview works → import succeeds
- [ ] **Preview as student**: Card / Play it toggle works, Play it does
      NOT save a score row in DB
- [ ] **Play mode**: parent dashboard "Hand the device to <kid>" → kid
      home loads, top bar shows kid name + Grown-up exit; typing /admin
      bounces back; exit asks for PIN
- [ ] **Teacher referral**: `/classroom/refer` page renders code + share
      URL + Email/Text buttons compose correctly
- [ ] **Standards SEO pages**: `/standards/rl-k-1` loads without auth,
      shows 3 sample questions, has upgrade CTA

### 8. First district-pilot pitch deck
Now that the product surface is real, draft a 6-slide deck:

1. The problem (district-level reading proficiency, federal funding pressure)
2. What Readee does (K-4, Common Core, Science of Reading, built by reading specialist)
3. Live demo screenshots — Build with AI, Ask Readee, Live Quiz, parent dashboard
4. Privacy + COPPA/FERPA story (point at /privacy-for-schools + /schools/dpa)
5. Funding fit (Title I-A, II-A, IV-A, IDEA — point at /schools/funding-guide)
6. Pricing + first-pilot offer (point at /schools)

Goal: send to 5 contacts (warm intros via Jennifer's network) by Friday.

---

## 🟢 Nice-to-have

### 9. Voice samples on the parent Ask Readee surface
The voice selector lives inside the wizard. Could surface the samples
on a standalone `/account` row so parents can preview voices outside
of a build context. Low priority.

### 10. Polish the wizard progress UX
Right now the progress bar is purely client-side animated to ~95%.
Real per-step progress would require either streaming the server
action (Next.js doesn't make this clean) or splitting the orchestrator
into a series of API calls. Not worth the complexity yet — but worth
revisiting if teachers complain about uncertainty during long builds.

### 11. Inline matching-pair editor in QuizBuilder
Today matching questions are read-only after generation (delete +
regenerate to change). A pair editor would let teachers tweak. Low
priority because the AI gen quality is decent.

---

## What we're NOT doing this week

- **Spanish (ES) launch.** The plumbing exists — `Profile.language`,
  `Child.language`, the translation script — but a real ES launch
  needs translated UI strings, ES-voice TTS, ES-image-prompt sweeps,
  parent/teacher-facing comms, and QA from a native speaker.
  Tabled until after district pilots are live; revisit when an actual
  district asks for it.
- Spaced-repetition tuning. SRS engine is shipped (migration 049),
  trigger updates state on every practice_results insert. Let it
  collect a week of real data before tuning the quality bands.
- Sales hire. Per `docs/SALES_HIRE_PLAN.md` — we're not at the
  trigger yet (5+ districts in active talks).
- Layer 4 community sharing UI polish. The backend pipeline works;
  there's nothing in the queue yet.

---

_See `docs/SALES_HIRE_PLAN.md` for sales-hire framework. See
`/Users/filipgalietti/.claude/projects/-Users-filipgalietti/memory/`
for project memory across sessions._
