# Tomorrow — Apr 30 2026

Punch list for the next session. Ordered by leverage — top items first.

## 1. Validate what we shipped today (~30 min)

The IEP workspace works against test child but test child has no real practice data, so the AI keeps saying "data not provided." To see the rich version of the note + plan, **seed practice data first**:

- [ ] Sign in as test child via the parent account (`filip.galietti@gmail.com`)
- [ ] Do 5–10 questions in `/practice` for 2–3 different RF.1 standards (RF.1.3a, RF.1.3b, RF.1.4a)
- [ ] Sign back in as `+test2@readee.app` (teacher)
- [ ] Run progress note again on the same fluency goal — verify:
  - [ ] Status code is no longer "not_yet_introduced"
  - [ ] PLOP and Evidence sections cite actual numbers (e.g. "8/10 correct on RF.1.3a")
  - [ ] "Trend data ✓" green chip appears on the result
- [ ] Run intervention plan — verify:
  - [ ] AI references the kid's real gaps in the focus_skills chips
  - [ ] Push gives 4 green / 0 blue (parent → leaf fallback should resolve all)
- [ ] Test the kid receiving the work: sign back in as test child, confirm assignments appear in dashboard with staggered weekday due dates

## 2. Continue AI tools test plan

Phase A still has the IEP entry (#7) to officially mark ✓ PASS once the validation in step 1 passes:
- [ ] Update `docs/AI_TOOLS_TEST_PLAN.md` Phase A summary

Phase B (parent-side) — needs a parent test account and a kid with one of the parent's classroom enrollments:
- [ ] **#8 Ask Readee** at `/dashboard/ask-readee` — 3-step parent wizard
- [ ] **#9 Homework scan** at `/dashboard/homework-scan` — Gemini Vision

Phase C (student-side, Buddy live mode):
- [ ] **#10 Reading Buddy** at `/buddy` in all 4 modes — only blocker before this is having a kid in a classroom with at least one assignment, which step 1 above creates

## 3. Pick one of the parked SPED follow-ups (high leverage if Phase A/B/C are clean)

In rough order of value:

- [ ] **End-of-cycle auto-suggest** — when an intervention_plan's end_date passes, surface a "ready for cycle 2" CTA on the Plan tab that pre-fills the next plan with the same goal. Closes the loop teachers currently have to remember.
- [ ] **Inline-generate leveled passage** in the Push modal — when a session has `materialKind: "passage"` and no leveled passage exists, offer a one-click "Generate matching passage" that calls `/api/leveled-build` and re-runs resolve. Today the parent → leaf fallback usually catches it, but inline-gen is the better fix.
- [ ] **Re-resolve a saved plan** — if the teacher generates a plan, then creates a leveled passage, the saved plan's matches don't update. Add a "Re-check matches" button in PlanTab that re-runs resolve.
- [ ] **Per-session skip toggles** in the Push modal — let teacher uncheck individual sessions before pushing (e.g. skip the cold-read on Day 1 because they already did it).

## 4. Smaller cleanups

- [ ] **Uncommitted debug logging** — `app/(protected)/practice/custom-quiz/[quizId]/page.tsx` has `console.log("[parent-quiz] enter", ...)` calls from the smart-search debug session. Decide: keep, gate behind a flag, or revert.
- [ ] **`docs/DAILY_CHECKLIST.md`** is also unstaged — pull from it whatever's done; archive the rest.
- [ ] **Untracked junk in scripts/** — logo-mocks CSVs and old manifest backup `.bak` files. Either commit on purpose or `.gitignore` them.

## 5. Smart-search "No reader selected" bug — REVISIT

Filip reported it at session start, we deferred to "later." Still in the wild. Once test child has practice data, repro should be quick: smart search → click result → see what URL the address bar lands on. Already gathered most of the diagnosis (none of the buildHref routes target /practice or /roadmap directly), so just need the failing repro path.

## What NOT to do tomorrow

- **Don't touch Stripe.** Filip explicitly punted Stripe SKU/webhook setup until launch (see `project_stripe_deferred.md`).
- **Don't add more SPED features.** Validate what we shipped first. The push-to-assignments flow is the longest-running unverified-in-the-wild surface.
- **Don't refactor.** No surface needs cleanup yet.
