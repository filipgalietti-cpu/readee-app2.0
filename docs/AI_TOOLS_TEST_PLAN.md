# AI tools E2E test plan, Apr 29 2026

Sign in as `filip.galietti+test2@readee.app` (now `plan=school`,
educator role, full access). Open browser devtools → Network tab →
filter "Fetch/XHR" so you can see request/response bodies if anything
fails.

For each tool below: do the steps, tick the box if it works, send me
the failure details if it doesn't. Format for failures:

```
[Tool name]
Step that failed: e.g. "clicked Build, got nothing"
HTTP code from network tab: e.g. 500
Response body (red error): paste here
```

---

# Phase A — Teacher-side (test as +test2 educator)

## 1. Buddy (kid-facing UI accessible from teacher) — ✓ PASS (2026-04-29)

URL: `https://learn.readee.app/buddy`

Mode picker confirmed renders correctly. Live mode walkthrough
deferred until parent/student phase since Buddy is kid-facing.

## 2. Authoring wizard (teacher AI assignment)

URL: `https://learn.readee.app/classroom/authoring/wizard`

- [ ] Page loads with 4-step wizard (Brief → Passage → Questions →
      Audio & visuals)
- [ ] Step 1: pick a grade, type a brief like "An informational
      passage about how plants grow"
- [ ] Step 2: confirm passage settings
- [ ] Step 3: pick 3 questions, MCQ
- [ ] Step 4: enable image + audio, click "Build assignment"
- [ ] Loading state shows the gooey-eight loader + progress bar climbing
- [ ] After 30-60s, redirected to a built quiz at
      `/classroom/authoring/quiz/<id>`
- [ ] Quiz shows passage, image, and 3 questions

## 3. Coach (teacher voice analyzer)

URL: `https://learn.readee.app/classroom/tools/coach`

- [ ] Page loads, sees recorder UI
- [ ] Pick a child from dropdown (demo students should be there)
- [ ] Click record, read aloud for ~30s ("The brown dog ran across the
      field and chased a butterfly. He stopped to drink water from a
      stream. Then he heard his owner calling his name.")
- [ ] Click stop
- [ ] Within 30s, see transcription + WCPM + accuracy + coach feedback

## 4. Translate

URL: `https://learn.readee.app/classroom/tools/translate`

- [ ] Page loads
- [ ] Paste "The cat sat on the mat. It was warm and soft."
- [ ] Pick Spanish from dropdown
- [ ] Click Translate
- [ ] Within 5s, Spanish translation appears
- [ ] Translate it again to confirm cache hit ("cached · free" badge
      should appear, no credit charge)

## 5. Writing rubric

URL: `https://learn.readee.app/classroom/tools/writing-rubric`

- [ ] Page loads
- [ ] Paste a short student writing sample (3-4 sentences, any topic)
- [ ] Pick a grade
- [ ] Click Score it
- [ ] Within 10s, see 4 score cards (Ideas, Organization, Voice,
      Conventions) with band labels

## 6. Calibrated item

URL: `https://learn.readee.app/classroom/tools/calibrated-item`

- [ ] Page loads
- [ ] Pick a CCSS standard (e.g. RL.2.1)
- [ ] Pick a grade
- [ ] Set difficulty to medium
- [ ] Click Generate
- [ ] Within 10s, see one MCQ with prompt, 4 choices, correct flagged

## 7. IEP note

URL: `https://learn.readee.app/classroom/tools/iep-note`

- [ ] Page loads (school-tier ✓)
- [ ] Pick a child
- [ ] Paste annual goal like "By end of Q4, [Name] will read
      grade-level passages with 90% accuracy"
- [ ] Click Draft progress note
- [ ] Within 15s, see 4 sections (Present Levels, Evidence,
      Progress Toward Goal, Recommended Supports)

---

# Phase B — Parent-side (deferred until teacher phase is clean)

After teacher phase: I'll create or repurpose a parent test account so
you can verify these without role mixing.

## 8. Ask Readee parent wizard

URL: `https://learn.readee.app/dashboard/ask-readee`

- [ ] Page loads with 3-step wizard
- [ ] Step 1: pick a child, type "a story about a brave puppy"
- [ ] Step 2: enable passage + 3 questions
- [ ] Step 3: enable image + audio, click "Build with Readee.ai"
- [ ] Loading state, gooey-eight loader, "Building, this takes 20-40 seconds…"
- [ ] After 20-40s, redirected to a built lesson

## 9. Homework scan

URL: `https://learn.readee.app/dashboard/homework-scan`

- [ ] Page loads
- [ ] Upload any photo of writing/worksheet
- [ ] Click Scan
- [ ] Within 20s, see analyzed text + tips

---

# Phase C — Student-side (Buddy live mode)

After teacher phase: log in as a child profile (or use the kid mode
launch from a parent account) to actually drive Buddy through one
full conversation in each mode.

URL: `https://learn.readee.app/buddy`

- [ ] **Read with me** — fresh passage renders, mic listens during read
- [ ] **What does this word mean?** — tap a word card, ask, get audio reply
- [ ] **Tell me a story** — pick topic, see opening, reply with what
      happens next, story continues
- [ ] **Quick quiz** — passage + 3 questions, all 3 answer flows work
- [ ] If live mode auth fails, UI auto-falls back to turn-based chat

---

## After each phase

Send me a summary like:

```
Phase A: ✓ 2, 3, 5, 6, 7  ✗ 4 (translate threw 500)
```

And I'll fix the failures in order before moving to Phase B.
