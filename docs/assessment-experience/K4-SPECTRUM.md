# K–4 instructional assessment spectrum

This extends the existing placement, rather than replacing the lesson design or parent-entry flow. The live runner previously used whole-grade word lists (including a fifth-grade ceiling), one confirmation passage, and a Kindergarten listening fallback. Claude also built a separate adaptive quiz over the curriculum banks. Version 4 connects those assets to a single evidence-driven instructional flow.

## What is reused

- The Luna orb, Rabbit, lesson-style answer cards, separate selection/Next, microphone recovery, audio player, atomic completion, report, and free-first-unit route.
- Claude’s authored K–4 difficulty axis and nearest-question staircase pattern; the implementation replays answers purely so rendering/retry cannot change difficulty.
- Fifty source-linked questions from the existing curriculum banks (ten per grade), existing full-prompt narration, word sets, phoneme clips, and four original reading passages. Fourth-grade questions on Nia’s story now ask theme, textual evidence, and changing interpretation.
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
| 5    | Two-syllable words and endings                                                                  | RF.2.3                                                                         |
| 6    | Prefixes, suffixes and longer words                                                             | RF.3.3                                                                         |
| 7    | Longer multisyllabic words                                                                      | RF.3.3                                                                         |
| 8    | Multisyllabic words containing roots/affixes                                                    | RF.4.3a                                                                        |
| 9    | Fourth-grade stretch: information, experiment, necessary, thermometer, independent, communicate | RF.4.3a                                                                        |

Word naming samples decoding; it does not independently prove understanding of every root or affix. Oral blending uses three phoneme sequences, with the printed answer hidden. This corrects the earlier printed-word choice task’s conflation of phonemic awareness and decoding. Oral phoneme blending corresponds to RF.1.2b; RF.K.2c specifically concerns onset/rime and should not be claimed for this task.

Four correct responses establish a word step. Two incorrect responses open an easier step, or end a climb when a lower step was already established. There are six distinct probes available per step. A completed hardest step ends at fourth grade; no fifth-grade ability claim is made.

## Confirming independent reading

The word evidence proposes a starting band. The child reads a story and an informational text independently, then answers three questions about each. The text remains available in an expandable look-back for reference. Luna reads questions/options as support; she never reads the cold passage to the child.

Each reading sample requires at least 80% of the passage attempted, at least 90% accuracy on attempted words, and two of three meaning answers. Confirmation additionally requires **five of six answers across the pair**. A short accurate fragment cannot establish a level. A difficult sample opens fresh lower-band text. If no connected-text band can be confirmed, the report names foundational instruction as a provisional starting point and requests follow-up; it does not label the child a nonreader.

These are explicit Readee instructional rules, not published diagnostic cut scores. Authored texts and thresholds require educator review and child-response calibration. Rate is descriptive correct words per minute on the sample. It is not converted to a national percentile, grade equivalent, or promised catch-up date.

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

Audio generation is static and resumable. Only fixed author scripts go to Google. Batched synthesis strips spoken delimiters before publishing individual clips; local Whisper transcribes each resulting clip for a separate check. A single-clip mode repairs clipped, altered or incomplete speech; 306 final clips have matching checks. Transcription agreement is not a specialist content review. No child recordings are sent to this build process.
