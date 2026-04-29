# Specialist tier + tool consolidation, brainstorm

Filip's open questions, captured 2026-04-29 mid-test:

1. Do regular K-4 teachers use 1:1 reading tools? **Mostly no.**
2. Should specialists get their own tier and tool set?
3. Does Coach Mode (AI Running Record) overlap with `/fluency`?

This doc is a thinking surface, not a decision yet. Pick or modify
sections, then I'll execute.

---

## 1. The audience reality

| Role | 1:1 reading sessions | Frequency | Pain |
|---|---|---|---|
| Reading specialist (Title I, intervention) | Yes, daily | 5-15 kids/day, 15 min each | Running records, IEP notes, progress reports |
| Special ed / IEP case manager | Yes, weekly | 3-8 kids/week, 20 min each | Goals, progress monitoring, parent letters |
| K-2 regular ed teacher | Yes, weekly | Whole class once / kid / week, 5 min each | DRA / F&P / running records by hand |
| 3-4 regular ed teacher | Rarely | Term-end benchmarks only | Mostly group instruction |
| Speech-language pathologist | Yes, daily | Caseload-driven | Articulation, fluency, language samples |

**Implication:** "AI Running Record" is daily-driver for the top two
rows, weekly for K-2 gen-ed, basically irrelevant for 3-4 gen-ed.
That's a different SKU than "every teacher in the building."

## 2. Overlap with /fluency, /buddy "Read with me"

Three tools today all do "audio in, reading analysis out":

```
                        student-driven         teacher-driven
              ┌─────────────────────────────┬─────────────────────┐
   self-     │ /fluency                     │                     │
   practice  │ ── kid records, sees WCPM    │                     │
              ├─────────────────────────────┤                     │
   conv-      │ /buddy "Read with me"       │                     │
   ersational │ ── kid + AI back-and-forth  │                     │
              └─────────────────────────────┴─────────────────────┤
                                                                  │
                                          /classroom/tools/coach  │
                                          ── teacher-led 1:1      │
                                          ── saves to running log │
                                          └─────────────────────────
```

The audio→analysis engine is essentially the same. The differences:

- **Who hits record** (kid vs adult)
- **What gets persisted** (kid sees personal score; teacher sees a
  longitudinal log; parent sees a brief tip)
- **Prosody/UX framing** (gamified vs clinical vs encouraging)

**Consolidation move (later, not today):** one shared engine
`lib/ai/build-read-aloud.ts` that returns a structured analysis,
plus three role-aware faces. Risk if rushed: regress all three
live surfaces in one PR. Queue as its own sprint when 3 of 4 P1
surfaces are ✓.

## 3. Should specialists get their own tier?

Two paths:

### Path A: "Reading Specialist" SKU on top of Teacher Solo

- Inherits everything in Teacher Solo
- Adds specialist-only tools, all 1:1 / longitudinal:
  - AI Running Record (this tool)
  - Per-kid running-record trend (graph WCPM over time)
  - Auto-draft IEP progress notes from running-record history
  - Phoneme-targeted passage generator (delivered today)
  - Comparison view (this kid vs grade-level benchmark)
- Probably $29-39/mo, individual. Or add as a $5/teacher add-on
  on the school SKU for teachers who self-identify as specialists.

**Pro:** clean differentiation, specialists are willing to pay more,
matches how they actually buy software (district-purchased per role).

**Con:** more SKUs to maintain, harder marketing copy, paywall
fragmentation makes the upgrade page complicated.

### Path B: Just bundle into existing tiers

- Teacher Solo gets all the AI tools we have
- School/District gets per-classroom + admin overlays
- Skip the specialist SKU entirely; rely on volume from gen-ed

**Pro:** simpler, fewer paywalls, faster to ship.

**Con:** undersells specialist tools, leaves money on the table at
districts that have a Title I budget.

### My take

**Path A**, but framed as "Reading Specialist Add-On" not a separate
SKU. Cheaper to test (just an entitlement flag), reversible. Validate
with 5-10 specialists at pilot pricing before committing to full SKU.

## 4. Teacher signup → paywall flow chart

Today's flow (from CLAUDE.md + existing code):

```
                   ┌────────────────────────┐
                   │ Visitor lands at        │
                   │ readee.app or learn.app │
                   └───────────┬────────────┘
                               ▼
              ┌────────────────────────────────┐
              │ /sign-in (email + password)     │
              │ Sign up → role picker → free    │
              └────────────────┬───────────────┘
                               ▼
                     ┌─────────┴────────┐
                     │ role = educator? │
                     └───────┬──────────┘
                ┌────────────┴────────────┐
                ▼                         ▼
       ┌────────────────┐      ┌────────────────────┐
       │ Onboarding     │      │ Parent flow,        │
       │ wizard         │      │ create child, etc.  │
       │ (3-step)       │      └─────────────────────┘
       └────────┬───────┘
                ▼
   ┌────────────────────────────┐
   │ /classroom dashboard, free │
   │ tier today                 │
   └────────────┬───────────────┘
                ▼
        ┌───────┴────────┐ tries a paid tool
        ▼                 ▼
 ┌─────────────┐    ┌────────────────────────────┐
 │ basic flows │    │ /upgrade?reason=<tool>     │
 │ work free   │    │ → Stripe checkout, deferred│
 └─────────────┘    └────────────────────────────┘
```

**Gaps in this flow:**

1. Free tier has no AI tools — every paid tool just bounces to
   /upgrade. There's no "try once free" preview. Conversion suffers.
2. The role picker conflates "educator" with "every teacher type."
   No specialist self-id at signup.
3. No school/district auto-detect (e.g. "your school is on the
   district plan; we activated your seat").
4. Stripe is deferred per memory, so today every "Upgrade" CTA is
   functionally a coming-soon page.

### Proposed signup flow once Stripe lands

```
                   Sign up + verify email
                            ▼
            ┌───────────────┴───────────────┐
            │ Role: parent | educator       │
            └───────────────┬───────────────┘
                            ▼ (educator)
         ┌──────────────────┴──────────────────┐
         │ Self-ID:                              │
         │ ○ Classroom teacher (K-4)             │
         │ ○ Reading specialist / interventionist│
         │ ○ Special ed / IEP                    │
         │ ○ Admin / instructional coach         │
         └──────────────────┬──────────────────┘
                            ▼
         ┌──────────────────┴──────────────────┐
         │ Find your school                     │
         │ (auto-detect district plan if any)   │
         └──────────────────┬──────────────────┘
                            ▼
            ┌───────────────┴───────────────┐
            │  No district seat: free trial │
            │  + tailored upgrade CTA       │
            └───────────────────────────────┘
```

The self-ID drives the upgrade page's *featured* tier:

- Classroom teacher → Teacher Solo at $19/mo
- Reading specialist → Reading Specialist Add-On (or Teacher Solo +
  Specialist Pack)
- Special ed → Same as specialist, plus IEP progress notes featured
- Admin / coach → School plan demo

Same Stripe SKUs under the hood, different surfaces emphasized.

## 5. What to ship now vs defer

**Ship today (already done in this session):**
- AI passage generator inside the Running Record (delivered)
- Reposition the tool's copy as specialist-targeted (delivered)
- Inline add-students with grade defaults (delivered)

**Ship next (1-2 hr each):**
- Per-kid running-record trend page on
  `/classroom/[classroomId]/students/[childId]` (use the
  `running_records` table we created in 078)
- "Generate IEP note from records" button on the trend page (wraps
  the existing IEP note tool, prefilled from records)
- Specialist self-ID question on teacher onboarding (1 wizard step)

**Ship later (sprint):**
- Consolidate /fluency + /buddy + Coach into one engine
- Reading Specialist SKU (or entitlement flag) wired into Stripe
- District auto-detect at signup
- Free-tier "try one AI tool" preview to lift conversion

**Don't ship:**
- Group-diarization Coach Mode (killed, was solving a non-problem)
- Separate paywalls per tier (Stripe deferred until launch)

---

## Decisions needed from Filip

1. Path A (Specialist Add-On) or Path B (bundle into existing tiers)?
2. Self-ID question at onboarding — yes/no?
3. Per-kid trend page next, or move to test #4 Translate first?
