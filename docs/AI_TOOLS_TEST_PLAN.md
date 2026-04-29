# AI tools E2E test plan, Apr 29 2026

Sign in as `filip.galietti+test2@readee.app` (now `plan=school`, full
access). Open browser devtools → Network tab → filter "Fetch/XHR" so
you can see request/response bodies if anything fails.

For each tool below: do the steps, tick the box if it works, send me
the failure details if it doesn't. Format for failures:

```
[Tool name]
Step that failed: e.g. "clicked Build, got nothing"
HTTP code from network tab: e.g. 500
Response body (red error): paste here
```

Order is highest-risk first. Don't skip; some failures only show up
after a successful run elsewhere (credits, share state, etc.).

---

## 1. Buddy live mode (highest risk)

URL: `https://learn.readee.app/buddy`

- [ ] Page loads, you see mode picker (Reading, Wonder, Story, Tutor)
- [ ] Pick "Wonder" mode
- [ ] Browser asks for mic permission, click Allow
- [ ] Status indicator says "Connected" or "Listening" within 5s
- [ ] Say "Hi Buddy, what do you want to talk about?" — buddy replies
      with audio
- [ ] If live mode fails, the UI auto-falls back to turn-based chat,
      type a message and confirm it replies in text

**If failure**: open Network tab, filter for `buddy-live`, copy the
status code + response body of the `/api/buddy-live/token` call.

## 2. Ask Readee parent wizard

URL: `https://learn.readee.app/dashboard/ask-readee`

> Heads up: this is a parent-side tool. Your test2 account is an
> educator. If the page redirects to /upgrade or shows a paywall,
> tell me and I'll add a parent-capability flag to the same account.

- [ ] Page loads with 3-step wizard
- [ ] Step 1: pick a child, type "a story about a brave puppy"
- [ ] Step 2: enable passage + 3 questions
- [ ] Step 3: enable image + audio, click "Build with Readee.ai"
- [ ] Loading state shows the gooey-eight loader, "Building, this
      takes 20-40 seconds…"
- [ ] After 20-40s, page redirects to a built lesson with passage,
      image, and questions

## 3. Authoring wizard (teacher AI assignment)

URL: `https://learn.readee.app/classroom/authoring/wizard`

- [ ] Page loads with 4-step wizard (Brief → Passage → Questions →
      Audio & visuals)
- [ ] Step 1: pick a grade, type a brief like "An informational
      passage about how plants grow"
- [ ] Step 2: confirm passage settings
- [ ] Step 3: pick 3 questions, MCQ
- [ ] Step 4: enable image + audio, click "Build assignment"
- [ ] Loading state shows the loader + progress bar climbing
- [ ] After 30-60s, redirected to a built quiz at
      `/classroom/authoring/quiz/<id>`
- [ ] Quiz shows passage, image, and 3 questions

## 4. Coach (teacher voice analyzer)

URL: `https://learn.readee.app/classroom/tools/coach`

- [ ] Page loads, sees recorder UI
- [ ] Pick a child from dropdown (any one is fine)
- [ ] Click record, read aloud for ~30s ("The brown dog ran across the
      field and chased a butterfly. He stopped to drink water from a
      stream. Then he heard his owner calling his name.")
- [ ] Click stop
- [ ] Within 30s, see transcription + WCPM + accuracy + coach feedback

## 5. Translate

URL: `https://learn.readee.app/classroom/tools/translate`

- [ ] Page loads
- [ ] Paste "The cat sat on the mat. It was warm and soft."
- [ ] Pick Spanish from dropdown
- [ ] Click Translate
- [ ] Within 5s, Spanish translation appears
- [ ] Translate it again to confirm cache hit ("cached · free" badge
      should appear, no credit charge)

## 6. Writing rubric

URL: `https://learn.readee.app/classroom/tools/writing-rubric`

- [ ] Page loads
- [ ] Paste a short student writing sample (3-4 sentences, any topic)
- [ ] Pick a grade
- [ ] Click Score it
- [ ] Within 10s, see 4 score cards (Ideas, Organization, Voice,
      Conventions) with band labels

## 7. Calibrated item

URL: `https://learn.readee.app/classroom/tools/calibrated-item`

- [ ] Page loads
- [ ] Pick a CCSS standard (e.g. RL.2.1)
- [ ] Pick a grade
- [ ] Set difficulty to medium
- [ ] Click Generate
- [ ] Within 10s, see one MCQ with prompt, 4 choices, correct flagged

## 8. IEP note

URL: `https://learn.readee.app/classroom/tools/iep-note`

- [ ] Page loads (your account is school-tier so this should clear
      the gate)
- [ ] Pick a child
- [ ] Paste an annual goal like "By end of Q4, [Name] will read
      grade-level passages with 90% accuracy"
- [ ] Click Draft progress note
- [ ] Within 15s, see 4 sections (Present Levels, Evidence,
      Progress Toward Goal, Recommended Supports)

## 9. Homework scan

URL: `https://learn.readee.app/dashboard/homework-scan`

- [ ] Page loads (parent-side, may paywall same as Ask Readee)
- [ ] Upload any photo of writing/worksheet (your phone screenshot of
      this checklist works in a pinch)
- [ ] Click Scan
- [ ] Within 20s, see analyzed text + tips

---

## After you're done

Send me a summary like:

```
✓ 1, 3, 4, 5, 6, 7, 8
✗ 2 — Ask Readee paywalled, "educator only" message
✗ 9 — Homework scan threw 500 on upload
```

And I'll fix the failures in order. Don't fix anything yourself, just
report what you saw.
