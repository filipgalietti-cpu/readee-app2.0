# Daily checklist, Apr 29 2026

> Function before polish. The app needs to *work* end-to-end before
> it needs to look better. If something below is "good enough to
> ship," ship it and move on. No redesigning surfaces that already
> work.

## Rules of the day
- Do not redesign anything that is already functional.
- Do not start a UX iteration without confirming nothing on this list
  is open.
- One commit per item where possible. Keep PRs (well, pushes to main)
  thin.
- Re-read this list at the top of every break. If you drift into
  "let me just polish X" work, stop.

---

## P0, ship-blockers (do these first)

- [ ] **Smart-search "No reader selected" bug.**
  - File: `app/(protected)/classroom/_components/SemanticSearchBar.tsx`
  - Root cause: `buildHref` for `sample_question` writes
    `/practice?focus=${id}` but `/practice` only reads `?standard=`.
    Combined with stale `teacherChildId` from `library/page.tsx:63-69`
    (`parent_id = profile.id` only, ignores classroom-pinned demo kids).
  - Fix: drop child routing on the teacher side. Route
    `sample_question` and `story` to `/classroom/library?focus=${id}`,
    `sample_lesson` to `/classroom/library?standard=${standardId}`.
    Pass `childId={null}` from `library/page.tsx`.
  - Verify: smart search a phonics question, click result, no
    "No reader selected" screen.

- [ ] **Stripe SKUs for Teacher Solo + credit packs.** Plan-gating code
      and webhook are wired (`lib/plan/check-access.ts`, `profiles.plan`).
      The remaining work is operator-only:
  - [ ] Create Stripe products in dashboard (Teacher Solo $19/mo,
        $5 + $8 credit packs).
  - [ ] Add Stripe price IDs to Vercel env vars.
  - [ ] Test a full checkout against the staging webhook.

- [ ] **CRON_SECRET in Vercel.** Required for the parent weekly digest
      and daily question cron jobs to fire. Without it the cron route
      handlers 401 and silently drop.

- [ ] **DAILY_QUESTION_TEACHER_ID in Vercel.** Cron picks the daily
      question from this teacher's content library. Without it the
      `/today` page is empty.

## P1, walk the AI tools (~30 min, before you build anything new)

Each of these has a wired UI and a server action. Walk through every
one and confirm: input → "Build" → response, no 401/500, plan gate
respects free vs Readee+.

- [ ] `/dashboard/ask-readee` (parent), one full build
- [ ] `/classroom/authoring/wizard` (teacher), one full assignment
- [ ] `/classroom/tools/iep-note`
- [ ] `/classroom/tools/translate`
- [ ] `/classroom/tools/writing-rubric`
- [ ] `/classroom/tools/calibrated-item`
- [ ] `/classroom/tools/coach` (recorder)
- [ ] `/classroom/tools/homework-scan`
- [ ] `/buddy` (Vertex Live, mic permission, prosody confirmed
      working at 150 WCPM on Apr 27 — re-confirm)

If any of these throws, log the surface and the error and triage.
Do NOT redesign them, only fix the broken path.

## P2, plan-gating coverage spot-check (~20 min)

- [ ] Free account hits `/practice` after 10 attempts on a standard,
      gets redirected to `/upgrade?reason=practice`.
- [ ] Free account hits `/learn` for lesson 2 of any grade, gets
      redirected to `/upgrade?reason=lesson`.
- [ ] Free account hits `/analytics`, gets redirected.
- [ ] Free account hits `/dashboard/ask-readee`, sees Readee+
      paywall (not the wizard).
- [ ] Free educator hits a Teacher Solo tool, sees the upgrade CTA.

## P3, content gaps

- [ ] **K stubs.** RL.K.10 and RI.K.10 still have `slides:[]` in
      `app/data/sample-lessons.json`. Author both.
- [ ] **Spanish translation cron.** Script exists, has not been run
      against prod content yet. Decide: run now or defer to launch +1.

## P4, the things that can wait (do not do today unless P0-P3 are clean)

- Voice cloning provider replacement (ElevenLabs is out, no
  replacement picked, defer until a real teacher asks).
- Cloud Run for true Gemini Live (current Vertex Live is fine).
- Vertex Search migration (pgvector smart search works).
- Video bucket cleanup.
- Any cosmetic/UX iteration on existing surfaces.
- Adding more loader variants to other places, the 5 wired surfaces
  are the test set.

---

## Done today (Apr 28)

- [x] Onboarding placeholder polish (drop "e.g.", fix vertical
      alignment) — `29d3d27`
- [x] OrganicLoader library + `/dev/loaders` gallery — `d1bcf7b`
- [x] ReadeeAiLoader (variant 13) on 6 AI surfaces — `35b9c81`
- [x] Vertex Live + Buddy v2-v5 (earlier in the day)

## Diagnosed but not fixed

- Smart-search "No reader selected" — see P0 above.
