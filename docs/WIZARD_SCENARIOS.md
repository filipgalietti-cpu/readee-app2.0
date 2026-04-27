# Wizard E2E Scenarios — self-test runbook

Run yourself in a clean incognito window. Each scenario is a click-by-
click walkthrough with expected outcomes. Note any deviation. Goal:
hit every scenario without finding a "wait, that's broken" moment.

Estimated time: 30 minutes.

## Setup

- [ ] Incognito window in Chrome
- [ ] `learn.readee.app` (production) — NOT localhost
- [ ] Have Jennifer's test classroom ready with at least one test student

---

## Scenario A — Brand new teacher, easy build

Goal: prove the happy path works for someone who's never used Readee.

1. [ ] Sign up at `/signup?as=teacher` with a fresh email
2. [ ] Email confirms, redirects to `/classroom`
3. [ ] Click "Build with AI" in the sidebar
4. [ ] Step 1: leave title BLANK (verify it's optional now), pick 2nd grade, pick a topic prompt suggestion
5. [ ] Step 2: enable passage
6. [ ] Step 3: 3 MCQ + 2 T/F + 1 matching pair
7. [ ] Step 4: passage image ON, passage TTS ON, per-question TTS OFF, voice = Sage
8. [ ] Click Build → progress bar shows + step labels rotate
9. [ ] Lands on quiz editor with `?built=1` banner
10. [ ] **Title was auto-filled** from the AI's passage title (not "Untitled quiz")
11. [ ] **Passage image renders** as a hero next to the description
12. [ ] **Passage audio** has a play button — click it, audio plays
13. [ ] **Question count is exactly right**: 3 MCQ + 2 T/F + 1 matching = 6 questions
14. [ ] No yellow warning banner (would mean QC flagged something)
15. [ ] Open the inline assign dialog → pick a classroom → assign
16. [ ] Confirms "Assigned to 1 classroom"

**Expected total time:** ~4 minutes.
**Bug if:** any step deviates, especially 9-14.

---

## Scenario B — The "I don't know what to type" teacher

Goal: prove the prompt-suggestion ghost typing actually helps.

1. [ ] Open `/classroom/authoring/wizard` fresh
2. [ ] Topic field is empty — wait 5 seconds — ghost-typed prompt appears
3. [ ] Wait another 5 seconds — different prompt cycles in
4. [ ] Press Tab — current prompt commits to the field
5. [ ] Field is now editable, cursor at the end

**Bug if:** the typing animation conflicts with the cursor, or Tab does something else.

---

## Scenario C — Bad inputs

Goal: error states don't leave the teacher stuck.

1. [ ] Step 1, leave topic blank → click Next → "Describe the topic" inline error
2. [ ] Step 1, fill topic, no passage no questions → step 2/3 blocks with "Without a passage, you need at least one question"
3. [ ] Build with all toggles ON but topic = "fjklfjkl xyzzy" (gibberish) → orchestrator runs, lands on quiz, but passage / questions look weird
4. [ ] **YELLOW BANNER** at top of quiz says "Build finished with warnings" if QC fired any fails
5. [ ] No crash, no white screen, no 500

---

## Scenario D — Per-question regenerate

Goal: prove the new feature works.

1. [ ] In any built quiz, click the small Sparkles icon on an MCQ row
2. [ ] Spinner appears for ~3 seconds
3. [ ] Question prompt + choices update — same image and audio, fresh content
4. [ ] Page doesn't navigate away
5. [ ] Try again on a T/F row — same behavior, prompt updates
6. [ ] Try on a matching_pairs row → button is hidden (correct, no generator yet)

---

## Scenario E — Custom quiz, end-to-end student flow

Goal: prove a built quiz actually plays end-to-end for a real kid.

1. [ ] Build a quiz with the wizard (Scenario A)
2. [ ] Assign to your test classroom
3. [ ] Switch to the parent dashboard for the test child
4. [ ] "From your teacher" card shows the quiz with a Start button
5. [ ] Click Start → routes to `/practice/custom-quiz/[id]?child=...`
6. [ ] Passage renders in 18px Georgia serif (NOT tiny gray text)
7. [ ] Passage image visible at top
8. [ ] Passage audio plays on click
9. [ ] Walk through every question type:
   - MCQ: pick wrong → red feedback, pick correct → green
   - T/F: same
   - Matching: tap left, tap right, line connects, all 4 pairs match
10. [ ] Done screen with score + carrots
11. [ ] Back on dashboard: assignment is **GONE from the open list**

---

## Scenario F — Live quiz session

Goal: confirm the new Live quiz tab works.

1. [ ] Sidebar → "Live quiz" → `/classroom/live`
2. [ ] No active sessions → page renders with classroom launchers + "no in-progress" empty state
3. [ ] Open a classroom → click "Start live quiz" → pick a standard
4. [ ] Lobby page renders with join code displayed
5. [ ] Hop back to `/classroom/live` in another tab
6. [ ] In-progress session shows with join code + Resume button

---

## Scenario G — Reports drill-down

Goal: confirm the per-child report renders for a kid with practice data.

1. [ ] Sidebar → "Reports" → `/classroom/reports`
2. [ ] Page renders with at least one classroom
3. [ ] If "Needs your attention" has anyone, click them → drill-down loads
4. [ ] Drill-down shows: weakest standards, last 5 sessions, recent assignments
5. [ ] Back button returns to the queue

---

## Scenario H — Today's Readee surfaces

Goal: confirm the daily question is visible everywhere.

1. [ ] Parent dashboard → "Today's Readee" card visible above teacher assignments
2. [ ] Click thumbs up → counter increments (check DB)
3. [ ] Teacher classroom view → "Today's Readee" card visible above classrooms grid
4. [ ] Sign out, hit `/today` directly → public page renders with passage, image, audio, question
5. [ ] Twitter/Slack-share the URL → OG card preview shows passage title + image

---

## Scenario I — Account page on every shape

1. [ ] Pure parent (no classroom): "Parent account · N children", no Teaching section, no Readee.ai credits
2. [ ] Pure teacher (no children): "Teacher account · N classrooms", no Linked Readers, no Grown-up PIN, Readee.ai credits visible
3. [ ] Hybrid (Filip): both sections visible, header reads "Teacher · Parent account"

---

## After every run

- [ ] Note any deviation in the form: scenario letter + step number + what happened vs what was expected
- [ ] If 0 deviations: ready to put a real teacher on it
- [ ] If 1-3 minor deviations: fix and re-run
- [ ] If 4+ or any blocker: not ready, back to fixes
