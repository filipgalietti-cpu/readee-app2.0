# K–4 instructional assessment spectrum

This extends the existing placement, rather than replacing the lesson design or parent-entry flow. The live runner previously used whole-grade word lists (including a fifth-grade ceiling), one confirmation passage, and a Kindergarten listening fallback. Claude also built a separate adaptive quiz over the curriculum banks. Version 4 connects those assets to a single evidence-driven instructional flow.

## What is reused

- The Luna orb, Rabbit, lesson-style answer cards, separate selection/Next, microphone recovery, audio player, atomic completion, report, and free-first-unit route.
- Claude’s authored K–4 difficulty axis and nearest-question staircase pattern; the implementation replays answers purely so rendering/retry cannot change difficulty.
- Fifty source-linked questions from the existing curriculum banks (ten per grade), existing full-prompt narration, word sets, phoneme clips, and the original story titles/questions. Version 4 shortens the Grade 1–3 narratives while preserving evidence for every question and leaving the v3 texts unchanged. Fourth-grade questions on Nia’s story now ask theme, textual evidence, and changing interpretation.
- The lesson authorship work remains in its own worktree. This does not publish unfinished golden lessons or change subscriptions.

## Child flow

Parent setup and enrollment → hand the device to the reader → microphone check and unscored practice → adaptive word reading → oral blending when foundational evidence is useful → two independent reading samples → adaptive narrated understanding → parent report → first assigned free lesson.

The starting word step uses enrollment. It is not a floor or ceiling. Any enrollment can reach any step, including early K or the fourth-grade ceiling. A technical failure contributes no answer, never an incorrect answer. The child can explicitly pass on a word.

| Step | Content                                                                                         | Related foundational standard family                                           |
| ---- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 0    | Match a heard consonant sound to a letter                                                       | RF.K.3, **receptive recognition only**, not the full sound-production standard |
| 1    | CVC words: cat, pig, hot, bug, ten, jam                                                         | RF.K.3 / early RF.1.3 decoding                                                 |
| 2    | Blends and digraphs: ship, stop, hand, chin                                                     | RF.1.3                                                                         |
| 3    | Long vowels, common words and endings                                                           | RF.1.3                                                                         |
| 4    | R-controlled vowels and vowel teams                                                             | RF.2.3                                                                         |
| 5    | Two-syllable, common words and endings                                                          | RF.2.3                                                                         |
| 6    | Prefixes, suffixes and longer words                                                             | RF.3.3                                                                         |
| 7    | Longer multisyllabic words                                                                      | RF.3.3                                                                         |
| 8    | Multisyllabic words containing roots/affixes                                                    | RF.4.3a                                                                        |
| 9    | Fourth-grade stretch: information, experiment, necessary, thermometer, independent, communicate | RF.4.3a                                                                        |

Word naming samples decoding; it does not independently prove understanding of every root or affix. Oral blending uses three phoneme sequences, with the printed answer hidden. This corrects the earlier printed-word choice task’s conflation of phonemic awareness and decoding. Oral phoneme blending corresponds to RF.1.2b; RF.K.2c specifically concerns onset/rime and should not be claimed for this task.

Four correct responses establish a word step; two misses rule it out for this sample. After the enrollment-based first step, binary bracketing probes the midpoint of the remaining range. A completed set updates the lower or upper bound, never an enrollment ceiling. Across ten steps this requires at most five sets and **25 measured word responses**, including mixed answers within sets. Every K–4 outcome remains reachable from every enrollment grade. Unprobed intermediate steps are not recorded as passed or mastered. There are six distinct probes available per step. A completed hardest step ends at fourth grade; no fifth-grade ability claim is made.

## Confirming independent reading

The word evidence proposes a starting band. The child reads a story and an informational text independently, then answers three questions about each. The text remains available in an expandable look-back for reference. Luna reads questions/options as support; she never reads the cold passage to the child.

Each reading sample requires at least 80% of the passage attempted, at least 90% accuracy on attempted words, and two of three meaning answers. Confirmation additionally requires **five of six answers across the pair**. A short accurate fragment cannot establish a level. A difficult sample opens fresh lower-band text. Sampling stops after **three unsuccessful bands (at most six passages)**, preserving room for a Grade 4 word reader to confirm Grade 2 reading without an exhaustive descent through every band. This is a fatigue bound, not a new passing threshold. An unconfirmed result remains explicitly provisional and requests follow-up. Demonstrated word reading proposes the lesson band; children who passed step 2 or higher start with guided comprehension there, while children showing only letters/CVC words begin with foundations. Neither outcome is a confirmed independent reading level. The old unconditional Kindergarten fallback is removed.

These are explicit Readee instructional rules, not published diagnostic cut scores. Authored texts and thresholds require educator review and child-response calibration. Grade 1–3 form-A stories contain 50, 81 and 110 words; form B contains 52, 87 and 114. The v4 runner no longer ends reading at 150 seconds. Responsive pages preserve the exact text and continuous recording; children can finish or skip explicitly. Ten minutes triggers an unmeasured technical pause, not a failed passage. Shorter texts remove the legacy reading burden but do not establish equated difficulty.

Rate uses the runner's captured first-minute count and duration, falling back to overall duration only when legacy evidence lacks a window. A completed short passage can use its shorter timed window. Pauses within an unfinished first minute remain part of that minute: 28 words by second 35 followed by no further reading is 28 WCPM over the first minute, not 48. Rate is descriptive correct words per minute on the sample. It is not converted to a national percentile, grade equivalent, or promised catch-up date.

## Understanding with read-aloud support

Ten fixed, adaptive prompts sample language and meaning independently from the cold reads. They reuse narrated curriculum questions with self-contained text and no answer-revealing pictures or teaching hints. Reused items can be familiar on a retest; they are not equated alternate forms. Difficulty increases after correct answers and decreases after incorrect answers, within K–4. Nearby literature/information items rotate without large difficulty jumps solely to meet a strand quota; items do not repeat.

A supported language band is named only when at least four items from that band were answered and at least 75% were correct. Otherwise the result says more evidence is needed. This is the **source question band with listening support**, not an independent reading grade or mastery of its RL/RI standards. The authored difficulty numbers have not been empirically equated between grades.

## Report and journey

A Grade 4 enrollee may have Grade 2 independent reading, stronger word reading, and Grade 4 supported language understanding. Keep those facts separate. Enrollment remains Grade 4. The journey begins in the confirmed reading band; its first unit targets foundational skills or meaning according to the observed gap. Richer age-appropriate read-aloud discussion is recommended alongside independent practice.

No whole unit is skipped and no standard is seeded as mastered from these brief probes. The plan gives a practice schedule, not a forecast of when a grade will be reached. The first assigned unit remains free; assessment completion does not call checkout.

Version 4 stores named word, passage, choice, and oral-blending traces. The server replays the sequence and scores choice IDs against the fixed content before the existing atomic write. Legacy version 3 and older saved results remain readable. The legacy required numeric assessment column is not an overall score for version 4 (`overallScoreAvailable: false`); the old percentage-results URL redirects to the actual placement report.

## Evidence and limits

- [Common Core K foundational skills](https://www.thecorestandards.org/ELA-Literacy/RF/K/), [Grade 1 foundational skills](https://www.thecorestandards.org/ELA-Literacy/RF/1/), [Grade 4 foundational skills](https://www.thecorestandards.org/ELA-Literacy/RF/4/), [Grade 4 literature](https://www.thecorestandards.org/ELA-Literacy/RL/4/), and [Grade 4 information](https://www.thecorestandards.org/ELA-Literacy/RI/4/) define the related skill families. Sampling these does not assess every K–4 ELA standard.
- [IES foundational reading guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/21) supports attention to sounds/letters, decoding, connected text, vocabulary, and language comprehension. [IES Grades 4–9 intervention guide](https://ies.ed.gov/ncee/WWC/PracticeGuide/29/Published) includes multisyllabic decoding, fluency practice, comprehension, and challenging text.
- [NWEA MAP Reading Fluency technical report](https://www.nwea.org/uploads/English-MAP-Reading-Fluency-Technical-Report-2024-08-26.pdf) is an example of separating component measures and validating an adaptive assessment. Readee does not inherit its item calibration or validity evidence.
- [Hasbrouck–Tindal technical report](https://brtprojects.org/wp-content/uploads/2019/05/TechRpt_1702ORFNorms.pdf) describes norms compiled from established oral-reading measures. Readee’s custom passages cannot simply borrow their percentiles. [DIBELS technical manual](https://dibels.uoregon.edu/sites/default/files/DIBELS8-TechnicalManual_04152020.pdf) illustrates the empirical work needed for standardized interpretation.

Still required before treating this as a validated assessment: reading-specialist review of new items and thresholds, passage difficulty/equivalence review, real child sessions across K–4, speech-recognition error audits (including accents and speech differences), and comparison with an appropriate established measure. Automated trajectories verify program behavior; they do not validate grade accuracy or replace live microphone testing.

## Verification commands

- `npx vitest run tests/placement-*.test.ts tests/assessment-audit*.test.ts`
- `npx tsc --noEmit`
- `npx tsx scripts/assessment-spectrum-browser.ts` (localhost only; every POST blocked)
- `node scripts/assessment-experience-browser.cjs` (lesson-style screens and responsive controls)
- `npx tsx scripts/placement-spectrum-audio.ts --dry` (missing/changed assets)

Audio generation is static and resumable. Only fixed author scripts go to Google. Batched synthesis strips spoken delimiters before publishing individual clips; local Whisper transcribes each resulting clip for a separate check. A single-clip mode repairs clipped, altered or incomplete speech; 312 final clips have matching checks. Transcription agreement is not a specialist content review. No child recordings are sent to this build process.

## Resume and hesitation

Each measured word, oral blend, cold-read result, committed comprehension choice, and listening answer checkpoints to sessionStorage. The checkpoint contains a stable session ID, accumulated active duration, content/policy revision, child ID, enrollment, and evidence. Restore validates the whole prefix with the server's replay functions. It rejects another child/enrollment, expired (24-hour), future-dated, malformed, or old-revision drafts. Time away is excluded. The microphone check and unscored warm-up repeat on resume; completed probes do not. An unfinished recording is retried, never scored as silence. Completed cold-read evidence and partial comprehension survive; the audio blob itself does not survive a refresh. Completed-submit retry and atomic idempotency are unchanged. Browser storage must be available, and this is same-tab/device recovery, not cross-device sync.

Word turns wait for 15 seconds without microphone activity or interim recognition before offering inline retry or an explicit pass. The same word remains visible, including after repeated silence. Recognizer failures also retain the word or story with inline recovery. Interim “I don’t know” and the pass button both advance a word as an explicit miss; silence never does. Letter prompts rotate through four fixed recordings and offer replay and pass. Sound contrasts use authored distractors, including other targets, rather than a constant b/d/g trio.

The hello turn waits for sustained voice and then 1.8 seconds of quiet before Readee replies. It allows up to 30 seconds for the first response. Stories allow page turns and thinking pauses without automatically ending the sample; no words and no input activity for 30 seconds opens inline microphone retry. A story pass records `readingStopped: { passageId, reason: "child-pass" }`, preserving an unmeasured independent-reading result and continuing supported-language questions. Server replay and checkpoint revision 3 validate that the stopped passage was actually next. Choice passes are explicit incorrect answers; they do not invent a recognized reading sample.

## Specialist review: confirmation policy remains open

The five-of-six pair threshold is unchanged. With independent Bernoulli questions sharing the same success probability p, its confirmation probability is `6*p^5*(1-p) + p^6`:

| Assumed per-question p | Current 5/6 pair | 4/6 pair, still requiring 2/3 on each passage |
| ---------------------- | ---------------- | --------------------------------------------- |
| 0.90                   | 88.6%            | 94.5%                                         |
| 0.80                   | 65.5%            | 80.3%                                         |
| 0.70                   | 42.0%            | 61.5%                                         |

Both columns assume independent, equally difficult items. These are conditional confirmation probabilities, not measured placement accuracy or proof that a particular p is an instructional norm. Comprehension questions within a passage are plausibly correlated. Jennifer should review these alongside actual items, passage comparability, the 80%/90% gates, and whether an additional same-band sample is preferable to lowering the threshold. No specialist endorsement is implied by the implementation.

Still deferred from the September 10 audit: independent review of story/information equivalence, irregular-word attribution beyond honest mixed-set labels, real microphone/child/accent testing, and historical v3 report interpretations. The required legacy `score_percent` column remains a compatibility value with `overallScoreAvailable: false`; writing null requires a database/consumer migration, not a one-line route change. New v4 reports do not use it as a score. The authored difficulty axis remains an uncalibrated routing aid.
