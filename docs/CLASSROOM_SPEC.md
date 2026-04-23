# Readee Classroom — v1 Spec

Living document. Last updated: 2026-04-22.

---

## What it is

A teacher-facing dashboard layered on the existing Readee consumer app.
One product, three tabs (Students, Assignments, Insights). Teachers pay
directly; schools follow in v2.

**Core promise:** a teacher can assign work, see who's doing it, and
author her own quizzes — with AI helping her generate images, TTS audio,
and whole quizzes from a topic prompt.

---

## Teacher dashboard

Single page. Three tabs.

### Tab 1 — Students (the roster)

- Class name + "Invite students" button (join code flow)
- Table of students with:
  - Name, avatar, carrot count, streak
  - % mastery (rolling 7-day)
  - Lessons completed this week
  - Standards they're weakest on (top 2)
- Row badges: "Excelling" / "Falling behind" / "Hasn't logged in in 5d"

### Tab 2 — Assignments

- List of active assignments with: title, due date, assigned-to, completion bar
- Per assignment: who's done, who's in progress, who skipped
- **+ New Assignment** button → picker:
  - **Assign Readee lesson** (browse full 201-lesson library, filter by grade + standard)
  - **Create custom quiz** → opens quiz builder

#### Quiz builder

- Title, grade level, due date, assign to class(es)
- Add question → dropdown of types:
  - Multiple Choice
  - Match the Following
  - Fill in the Blank
  - Short Answer
  - True / False
  - Order the Steps
- Per question: prompt text, correct answer, optional image, optional TTS
- **AI helpers** next to each question:
  - `[Generate image]` — uses Imagen 4.0 with child-safe pre-prompt
  - `[Generate read-aloud]` — uses Gemini TTS, voice picker
  - `[Regenerate]` — refresh button (costs 1 credit)
- Every question must be tagged with at least one CCSS standard (dropdown)

#### AI Quiz Wizard (paid tier)

Not an open chatbot. A constrained wizard with these actions:

- "Make a 10-question quiz on [topic] for [grade level], aligned to [standard]"
- "Simplify this question for lower readers"
- "Add a distractor answer to this MCQ"
- "Write an answer-key explanation"

Teacher always previews + edits AI output before save. No direct-to-student path.

### Tab 3 — Insights

- Class-wide standards heatmap (green / yellow / red)
- Weekly leaderboard (toggle-able on/off per teacher preference)
- "Most-missed questions this week"
- "Students who need attention" (low mastery + low activity)
- Export to CSV (for teacher's own gradebook)

---

## Student-side experience

When a teacher assigns work, the student's existing Readee home shows:

- A new pinned card at the top: **"From Mrs. K"**
- Assignment title, due date countdown, pencil icon
- Completing earns carrots as normal
- Teacher assignments slot in alongside their usual journey — they don't replace it

Parent dashboard (if parent has Readee+ separately):

- Passive note: "Ms. K assigned a quiz, due Friday"
- No data flows parent → teacher. Teacher only sees what the child does *inside* the teacher's assignments, not their private Readee+ activity.

---

## AI credits (COGS pass-through)

- Base tier includes **100 credits/month**
- 1 credit = 1 image generation OR 1 TTS clip OR 1 AI quiz generation (10 Qs)
- Refresh button = 1 more credit
- Add-on packs: $5 for 100 credits, $15 for 500 credits
- Pricing formula: roughly 5× our underlying cost, all passed through Stripe

Credit balance always visible in dashboard header.

---

## TTS voices (v1)

Three options:
- Warm teacher (Autonoe — same as consumer Readee)
- Upbeat younger narrator
- Calm male narrator

All Gemini TTS — no new infra.

---

## Pricing tiers

| Tier | Price | Includes |
|---|---|---|
| **Free** | $0 forever | 15 students, assign Readee lessons only, no AI, no custom quizzes |
| **Teacher Plus** | $149 / classroom / year | 35 students, custom quizzes, 100 credits/mo, all question types |
| **School Pack** | $6 / student / year, min 30 students | Everything above + FERPA DPA, admin console (v2), sales-assisted |

Free tier is the wedge. Teachers try it, love it, push their school to buy the Pack.

---

## Legal / safety (non-negotiable for launch)

1. **FERPA-compliant Data Processing Agreement** — lawyer-drafted before first school sale ($1.5–3k)
2. **Child-safe pre-prompt** on every AI image: appends "bright 2D cartoon illustration appropriate for children ages 5–10, educational, no violence, no scary imagery, no text"
3. **Moderation pass** on every generated image (Gemini Vision classifies child_appropriate: y/n)
4. **Teacher preview** required — no AI output goes to kids without teacher seeing it first
5. **Rate limits** on AI calls (per teacher, per hour)
6. **Full audit log** of every AI generation
7. **Updated Teacher Terms of Service** — teacher attests they won't abuse

---

## Data model additions (Supabase)

New tables:

- `classrooms` — id, teacher_id, name, grade_level, created_at, join_code
- `classroom_memberships` — classroom_id, child_id, joined_at, status
- `assignments` — id, classroom_id, type (`readee_lesson` | `custom_quiz`), source_id, due_at, assigned_at
- `custom_quizzes` — id, teacher_id, title, grade, standards[], created_at
- `custom_questions` — quiz_id, ord, type, prompt, correct, options, image_url, tts_url, standard
- `assignment_submissions` — assignment_id, child_id, submitted_at, score, completed
- `ai_generations` — id, teacher_id, kind (image|tts|quiz), prompt, output_url, status, credits_used, moderation_passed

New `profiles` role: `'teacher'` alongside existing parent.

All gated with Supabase RLS so teachers only see their own classes.

---

## Build order

### Weeks 1–4 — Skeleton
- Create class + join-code invite flow
- Roster view
- Assign a Readee lesson to a class
- Basic "who's done, who's not" view
- Jennifer + 2 pilot teachers test

### Weeks 5–8 — Custom quizzes + AI
- Quiz builder (MCQ first, other types in 1.1)
- AI image button (with safety stack)
- AI TTS button
- AI quiz wizard
- Credit system + Stripe credit packs
- Teacher preview flow

### Weeks 9–12 — Polish + launch
- Insights tab with heatmap
- Teacher onboarding (3-min guided setup)
- FERPA DPA finalized
- Privacy + ToS pages for teachers
- Free tier vs paid gating
- `/classroom` landing page at readee.app
- Public launch

---

## Open questions

- Do parents who have Readee+ AND whose kid is in a Readee Classroom class get any discount? (Punting for v1 — keep them separate.)
- Co-teachers on one class — v1 = no, v1.1 = yes
- Substitute teacher access — punt
- Multiple classes per teacher — yes, supported from v1 (one teacher_id, many classroom rows)

---

## Why no "Studio" vs "Console" split

Considered and rejected. Teachers think about their class as one workflow ("give my kids a quiz about the book"). Splitting that across two nav sections is extra clicks for no payoff. One dashboard, three tabs, AI as helper buttons inside it.

---

## Competitive positioning (Jennifer's field intel)

**Boddle** is what her 3rd grade class uses today. Her read on why it works:
kids love it because **it's a video game, not because they learn.** It leans
heavy on microtransactions.

That's Readee Classroom's whole wedge:
- Kids still feel the dopamine of a game (carrots, streaks, leaderboards,
  avatar unlocks)
- But the underlying content is Science-of-Reading rigorous, not trivia
- No predatory microtransactions — credit packs exist only for AI content
  generation by **teachers**, never kids

Teachers who pick Readee over Boddle are picking: "my kids love it *and*
they actually grow their reading level."

---

## Who owns what

- Filip — product, engineering, infra, AI integration
- Jennifer — teacher UX sanity-check, content standards, first pilot user (must dogfood in her own 3rd grade class)
- Both — pricing, marketing copy, launch plan
