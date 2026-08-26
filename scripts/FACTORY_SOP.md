# Lesson Factory SOP — one lesson, start to robot-green

Run from repo root. Dev server must be on localhost:3000. ONE lesson at a time
(Vertex TTS is sequential-only). Every step's output gates the next.

## 1. Author
```
npx tsx scripts/lesson-author.ts --id=<id> --standard=<CCSS> --archetype=<phonics|comprehension|language> --title="<Title>" --concept="<concept>"
```
Writes the lesson file, registers the manifest, creates /demo/<id>.

## 2. JUDGE the lesson draft (Claude reads the whole file; fix by editing, never regenerate)
Reject/fix ANY of these (every one has burned us):
- **Stimulus missing**: if a scene asks the child to answer from sounds/words, the narration script must actually SAY them ("Rrr. Ug.") — a kid can't answer what was never spoken.
- **Instruction/gate mismatch**: "watch me" narration on a scene that gates on the child tapping. The script must invite the exact action.
- **Answer reveals**: narration/hint before-or-at first wrong must never contain the answer. Explains (2nd wrong) MAY name it.
- **Narration never enumerates choose options** (tiles shuffle).
- **Teacher voice**: concise instruction, no hype filler ("big kid challenge!", "no picture helpers"), no meta-commentary, NO em-dashes anywhere.
- **Asset-path hygiene**: image/word keys must be kebab-case, no spaces.
- **Oral standards get an oral beat**: RF.K.2x / speaking standards need at least one `speak` interaction (Azure auto-listen is live).
- **Filler questions**: "did we do the lesson today?" style — replace with a real skill check.
- Multi-item interactions: every item's bucket/order assignment must be correct; coachWrong must coach, not reveal.

## 3. Assets + lint + lesson robot (sequential, SYNCHRONOUS)
```
npx tsx scripts/lesson-tts.ts --lesson=<id>
python3 scripts/lesson-timings.py <id>
npx tsx scripts/lesson-images.ts --lesson=<id>
npx tsx scripts/lesson-lint.ts --lesson=<id>
npx tsx scripts/lesson-qa.ts --lesson=<id>
```
lesson-lint must be CLEAN. lesson-qa must PASS. Fix and rerun, never skip.
PRODUCERS: run every step in the FOREGROUND with a generous timeout (10 min per
step). NEVER launch a step in the background and end your turn to "wait" — for
a producer, ending the turn means reporting done, and a promise is not a
result. One step, one blocking call, check output, next step.

## 4. Quiz
```
npx tsx scripts/quiz-author.ts --lesson=<id>
```
Then JUDGE the quiz file with the same checklist plus:
- exactly one true option per choose; either/or questions exempt from no-reveal
- bands honest: easier = 2 options + picture support; harder = SAME concept at
  NEXT grade level (production over recognition)
- speak accepts: single words, 3+ letters, token-equality-friendly
- every referenced audio path will be synthesized by quiz-tts's self-heal pass;
  bucket names 1-2 words (b-*.mp3 codegen)
Then:
```
npx tsx scripts/quiz-tts.ts --quiz=<id>-quiz
npx tsx scripts/quiz-qa.ts --quiz=<id>-quiz
```
quiz-qa must PASS.

## 5. Close out
- `npx tsc --noEmit` clean (ignore .next/types noise).
- In docs/UNIT_ROADMAP.md flip this standard's row ☐ → ☑ (lesson column only;
  exams ship separately per unit).
- Append ONE line to scripts/factory-run.log:
  `<id> <standard> LESSON:green QUIZ:green scenes:<n> Qs:<n> notes:<fixes made>`

## Engine laws (context for judging)
- Audio chains sequence the sound; progression NEVER gates on audio `ended`
  (safety timers exist — don't remove them).
- Scoring: correct = first-try-clean everywhere; streak resets on any wrong.
- Core-majority adaptive: max 2 easier + 2 harder served per 7-Q run.
- displayText ≠ ttsScript: editing a script means its clip re-records (tts
  scripts are incremental — they skip existing files, so delete stale clips
  when you change a script).

## STOP GAPS (mass-production run)
1. **Two-strike rule**: any step failing twice after a fix attempt → STOP that
   lesson, log `<id> BLOCKED: <reason>` in factory-run.log, move to the next
   lesson. Never loop-retry a lesson burning API spend. Blocked lessons are
   surfaced to Filip in the unit summary.
2. **UNIT-BOUNDARY PAUSE — WAIVED for K by Filip (Aug 19: "produce all units,
   no need to stop unless you feel otherwise")**: K units run back-to-back;
   each unit still gets its exam assembled + robot-tested at the boundary.
   The pause RETURNS before G1 mass production: the author prompt is
   K-hardcoded, so G1 needs a factory generalization pass + ONE piloted,
   human-ear-checked G1 lesson before its unit runs. Filip's ear on at least
   one K lesson before then is strongly requested (30+ lessons with zero
   human listen is real risk).
3. **No commits, no pushes, no uploads to prod storage.** Local files only.
4. Spend sanity: ~19 images + ~40 clips per lesson. If Vertex errors exceed
   50% on a batch, stop the run entirely (platform issue, not our bug).

## Pipeline notes (learned mid-run)
- `lesson-images.ts --lesson=<id> <filename.png...>` — ALWAYS pass filenames when
  regenerating specific images; no args regenerates the whole set (full batch cost).
- quiz-tts self-heal speaks FILENAMES for non-word clips: if a narration/hint clip
  got SKIPped by a transient synth failure, DELETE it and re-run quiz-tts (which
  reads the real script) — never let the self-heal pass fill a narration path.
- Single-image regen: DELETE the bad PNG first, then `lesson-images.ts --lesson=<id> <bare-key>`
  (bare keys, not .png filenames; existing files are skipped).
- Speak contract: single-word text = exact-read mode, TILE SHOWS THE WORD (right for
  read-alouds, a REVEAL for answer-questions — those need multi-word accept lists → "?" tile).

## Grade 1 production (Aug 20+)
- Factories take `--grade="1st Grade"` (lesson-author + quiz-author). Core = ON-GRADE G1;
  easier = K-bridge; harder = G2 concept. FELT STEP-UP vs K (Filip directive): kids READ —
  3-5 sentence passages w/ G1 phonics (digraphs, blends, long vowels, 2-syllable words),
  prompts to 12 words, ≥2 speak beats/lesson, 3-4 options on core with TEXT tiles (picture
  crutches on easier/teaching beats only), phrases allowed as items when decodable.
- Narrator never pre-reads text the child should read (reading checks stay no-reveal).
- All K-era rules still apply verbatim (reveals, enumeration, stimulus, images, audio paths).

## Incident policy (learned Aug 23 — the bumpy dinner)
1. Producer dies MID-lesson (draft exists): DEFAULT = orchestrator direct takeover
   (judge in main loop + bash pipeline steps). Do NOT launch a finisher agent for
   late-pipeline deaths — finishers cost credits and caused the quiz-overwrite race.
2. Before declaring a producer dead: machine awake? (pulses firing) AND no file
   writes for 10+ min. A frozen-by-sleep agent RESUMES on wake — racing it double-works.
3. NEVER run quiz-author when the quiz file already exists (it overwrites without
   asking). Regenerating intentionally = delete the file first, on purpose.
4. Stand-down messages to possibly-alive agents arrive at their NEXT tool round —
   too late to prevent an in-flight destructive call. Don't rely on them for safety.
5. (Aug 24 revision) TAKEOVER TRIGGER: only after an EXPLICIT failure notification
   for the producer, OR 30+ minutes with zero file writes AND zero pipeline
   processes. A judging producer writes nothing for 10-15 min — the old 10-min
   heuristic raced two live producers (prefix-power, digraph-detectives).
- EXAM ASSEMBLY: namespace picks (`{ ...q, id: `${quiz.lessonId}--${q.id}` }`) —
  generic per-quiz ids (c-2) collide across source quizzes and the runner's
  asked-set silently drops the collision (found by robot on g1-unit-3-exam).

## Grade 2 production (Aug 25+)
- Factories take `--grade="2nd Grade"`. Core = ON-GRADE G2; easier = G1-bridge; harder = G3 concept.
- FELT STEP-UP vs G1: 5-8 sentence passages (4-5 page chapter feel; fables/folktales for RL), G2
  phonics (vowel teams oo/ou/ow/oi/oy/aw, r-controlled, prefixes/suffixes), 4-option core chooses
  with plausible parallel distractors, ≥2 speak beats leaning EXPLANATION ("tell why"), paragraph-
  focus questions, sentence-length tiles allowed (≤28 chars).
- All K/G1 rules still apply verbatim (reveals, enumeration, stimulus, whisper-verify, namespaced exams).
