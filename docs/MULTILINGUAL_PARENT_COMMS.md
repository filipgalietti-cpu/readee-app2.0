# Multilingual parent comms, deferred queue

Tabled Apr 29 2026 after a strategy reset. Readee's curriculum
stays English K-4 reading comprehension. The L1 toggle on the
student reader was killed (wrong audience). What remains is a
real, district-purchaseable revenue feature targeting adult-facing
multilingual scaffolding.

The translation substrate is already shipped:
- `children.home_language` column (migration 079)
- `translateText()` + `translations_cache` table (migration 067)
- `/api/student/translate-passage` (deferred student-reader use,
  but auth is OR-gated parent + class-code, reusable)
- `SUPPORTED_LANGUAGES` in `lib/ai/translate.ts` (10 languages)

## What to build when this comes off the queue

### 1. Parent letter composer with per-recipient L1
Teacher writes one note in English. UI multi-selects recipients
(students). Per recipient, fan-out a translated copy to each
family's home_language. Email or print.
- Tier-gated: school plan
- Demo story: "I sent 28 families their weekly note, in 5 different
  languages, in one click."

### 2. Weekly digest auto-translates per recipient
The existing `/api/cron/parent-digest` route already builds a
per-child English digest. Wrap the body in `translateText` keyed
on `child.home_language` before sending.
- Zero-touch for teachers
- Cached so repeat weekly content is free after first send

### 3. Parent dashboard "What's my kid reading?" L1 view
On the parent dashboard, when a kid has an active assignment, show
a small "Read in [home language]" chip. Tapping translates the
passage and shows it in a parent-only popover. Kid's reader is
unaffected.

### 4. IEP / 504 progress notes in the family's L1
On the existing IEP note tool, add a "Send to family" affordance
that translates the parent-readable section to home_language before
emailing.

### 5. ELL vocab gloss (narrow ELL support, NOT translation overlay)
On any English passage in the kid's reader, long-press / hover any
word → see L1 definition for that one word only. Reuses translate
cache. Kid still reads English; this is dictionary scaffolding,
not text translation.

## What NOT to build (locked off-scope)
- Side-by-side English/L1 in the kid's reader
- Generating passages / lessons / quizzes in non-English
- TTS / transcription in non-English for kid-driven flows
- Anything that puts the kid reading their L1 instead of English

## Decision criteria for revisiting
- Pull this off the queue when one of:
  - A district demo asks specifically for multilingual parent comms
  - 5+ teachers in pilot ask for parent letter translation
  - We hit a Title III RFP that requires checkbox for L1 family comms

Until then, focus on the English-CCSS curriculum tools.
