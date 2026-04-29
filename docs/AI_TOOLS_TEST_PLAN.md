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

## 2. Authoring wizard (teacher AI assignment) — ✓ PASS (2026-04-29)

Multiple bugs found and fixed during testing:
- `e9c3b8a` smart-search routing dead-end (preflight)
- `53b7022` MCQ duplicate choices crashing render
- `033f553` Gemini Flash Image multi-panel hallucination
- `8c29a7e` duplicate passage display, redundant per-Q image/audio, 2-pair matching
- `1bdf5f7` per-student assignment targeting
- `5ede76c` passage image lightbox
- `098446a` regenerate image button + friendly passage font + classroom-default guardrail
- `48c438f` image tile height
- `301b2ee` student runner overhaul (3-phase, save/resume, results recap)
- `0e85d81` matching partial credit, uniform tiles, card view mirrors student

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

## 3. Running Records (was Coach Mode) — ✓ PASS (2026-04-29)

URL: `https://learn.readee.app/classroom/tools/coach`

Repositioned 1:1 vs the original group-diarization concept. Bug-fix
and feature trail during testing:
- `01d6083` fixed "Pick a student first" stuck state after inline-add
- `f61d898` inline add-students collects grade defaulting from classroom
- `ed2915f` always-on roster controls (+ Add students / Manage roster)
- `4e903f8` tightened passage generator prompt + stripped markdown
- `95d1a8a` kid-friendly font with grade-scaled size
- `d099fa3` "Hand to student" fullscreen mode
- `ae9b922` auto-fit passage to viewport
- `025d1b1` dropped redundant grade dropdown from inline add
- `705bf6b` chevron-rotation toggle on Add students button
- `1b26457` "How it works" disclosure replaces wall-of-text
- `ed1faaa` renamed tool to "Running Records / Listen to a student read"
- `80e16e4` collapsible skill-focus panel
- `76834f6` AI-suggested practice → Assign-to-kid one-click flow
- `449bee4` switched from group diarization to solo running record
- 078 migration: running_records table for longitudinal log

## 4. Translate — ✓ PASS / pivot tabled (2026-04-29)

URL: `https://learn.readee.app/classroom/tools/translate`

Standalone Translate playground works (Gemini text + cache). The
in-reader L1 toggle we briefly built was rolled back same-day, see
`docs/MULTILINGUAL_PARENT_COMMS.md`. Readee's curriculum is English
K-4 reading comprehension; multilingual stays adult-facing only and
the parent-comm features are queued for later.

Trail:
- `6fc1ec0` shipped the L1 toggle on the kid's reader
- `3cdf6e0` parent-side wiring
- (this revert) toggle removed; substrate (home_language column,
  translate cache, translate-passage API) retained for the
  deferred parent-comm features.

## 5. Writing rubric — ✓ PASS / repositioned (2026-04-29)

URL: `https://learn.readee.app/classroom/tools/writing-rubric`

Standalone scoring playground works. Real product win was the
integrated **AI Writing Coach question type** inside custom quizzes
(migration 080), so the standalone is now positioned as a sandbox.

Trail (Writing-Coach integration):
- `526a419` free_response question kind + writing-coach API
- `df556d4` migration 081 nullable correct
- `6d08f5c` rubric ≥3 → ✓; recap shows rubric not red X
- `d50aa16` writing-prompt counter in the wizard, orchestrator
  generates prompts from passage

## 6. Calibrated item — ✓ PASS / merged into Quiz builder (2026-04-29)

Standalone tool deprecated. The calibrated-item flow now lives inside
Quiz builder's "+ Add question" modal as a **Method: Manual | AI fill**
toggle. AI fill ships with the same Grade → Domain → Standard layered
picker (kid-friendly lesson titles), difficulty slider, optional anchor
passage (paste or AI-generate with Short/Medium/Long length tier), and
adds a violet chip strip showing Bloom's level + skill microlabel +
actual difficulty after fill.

URL (new home): `https://learn.readee.app/classroom/authoring/quiz/<id>` →
**+ Add question** → switch to **AI fill**.

Trail:
- `facab40` Save-to-quiz panel on the standalone (Part B, now moot)
- `b9d1787` AI fill mode inside QuizBuilder modal (Part A)
- `24dc4bd` anchor passage in modal + Bloom/skill chips + deprecate
  standalone (route kept as redirect card; tile removed from
  /classroom/tools and the classroom hero card; orphan
  CalibratedItemForm component deleted)

## 7. IEP / 504 workspace — UPGRADED (2026-04-29)

URL: `https://learn.readee.app/classroom/tools/iep-note`

Promoted from "draft a note" into a full 3-tab SPED workspace.
Commit `6f6d13e`, migrations 082-084 applied.

**Goals tab**
- [ ] Pick a student → Goals tab loads (active count visible in tab pill)
- [ ] Click "New goal" → editor opens
- [ ] Paste a real annual goal, set goal_type, baseline, target criterion, target date
- [ ] Save → goal appears in active list with type/status/target chips
- [ ] Edit existing goal → fields pre-populate, status switcher works
- [ ] Archive goal → moves to "Inactive" disclosure

**Note tab**
- [ ] With saved goals: dropdown lists active goals (truncated to 100 chars)
- [ ] Without saved goals: defaults to "Paste ad-hoc" mode
- [ ] Pick reporting period preset (auto-defaults to current quarter)
      and school year (auto-derived from today's date)
- [ ] "Custom…" option reveals free-text input
- [ ] Click Draft → loader appears with caption
- [ ] Result has formal status chip (one of: On track / Adequate /
      Insufficient / Mastered / Not yet introduced)
- [ ] If kid has trend data: green "Trend data ✓" chip shows
- [ ] If kid has running records: green "Running records ✓" chip shows
- [ ] Note has 4 sections plus quoted one-line summary
- [ ] "Copy full note" produces formatted text including status code
- [ ] "Draft plan" CTA at bottom switches to Plan tab

**Plan tab**
- [ ] Same goal picker as Note tab
- [ ] Click "Draft 2-week plan"
- [ ] Result shows: summary, focus skills chips, two weekly blocks
      with day-by-day sessions (each session has duration, activity,
      material hint, expected outcome)
- [ ] Probe schedule, expected criterion, escalation trigger sections
      render with their tone-coded icons
- [ ] Caregiver note appears when AI emits one (amber callout)
- [ ] "Copy plan" produces formatted text

**Persistence + audit**
- [ ] Generated note appears in `iep_progress_notes` table with
      `input_snapshot` populated (audit trail for IEP team meetings)
- [ ] Generated plan appears in `intervention_plans` table

**Disclaimer**
- [ ] Footer disclaimer renders: "AI-assisted drafts. Always review
      with your IEP team before submitting."

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
