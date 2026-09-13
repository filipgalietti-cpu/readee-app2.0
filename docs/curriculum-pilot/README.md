# One-unit Astra curriculum pilot

Status: isolated integration artifact, September 11, 2026. **Awaiting curriculum approval; not released.** No application route imports the pilot. It changes no assessment scoring, lesson content, Journey UI, subscriptions, or production sequencing.

Start with [Jennifer's review packet](g1-u1/REVIEW.md). The [release manifest](g1-u1/release.json) contains exact versions; the [package](g1-u1/package.json) adds objectives, concepts, quiz attribution, source/asset fingerprints, and technical findings. [Verification](verification.md) records commands and limitations.

## 1. Selection made before implementation

The prior reconciliation was checked against the current Astra worktree at `/Users/filipgalietti/readee-app2.0`, HEAD `6b91afa1` plus ongoing uncommitted rebuilds. The new package fingerprints the actual working files; HEAD alone does not identify this edition. Inspection covered the 201-standard catalog, both registries, roadmap, selected lesson/quiz definitions, exam picks, local assets, and available review information. No version-bound Jennifer approval was found. Authored comments saying “human-reviewed” and roadmap checkmarks are not release approvals.

| Candidate                | Why it is strong                                                                                                                                                                                                                                                         | Outstanding issues                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **G1.U1, selected**      | 10/10 exact lesson definitions and individual quizzes; clear authored order; three foundational lessons; mixed reading/language instruction; 12-item exam explicitly samples all ten standards. Grade 1 permits meaningful below/on/above and above-enrollment fixtures. | Approval absent; L.1.4 and its two substandards need scope review; local asset gaps; checkpoint persistence and interpretation unfinished.                                                       |
| K.U2, Sound & Letter Lab | 8/8 exact definitions and quizzes; five foundational lessons; avoids Book Basics/RF.K.1 identity problem; existing `unit-2-exam`, 12 items.                                                                                                                              | Review prerequisites and checkpoint representation. Cannot exercise a reader above enrollment entering a K unit within K–4. Catalog uses `K.L.1`, which must retain its exact existing identity. |
| G2.U1                    | 13/13 exact definitions and quizzes; authored order; existing `g2-unit-1-exam`, 14 picks representing all 13 standards.                                                                                                                                                  | More review work; broad RF.2.3 alongside substandards and broad L.2.4 alongside three substandards; exam includes authored top-up questions; less suitable for the smallest foundational pilot.  |

Selection favored a complete, manageable sequence and useful evidence fixtures, not unit numbering. “Exists in Astra” describes the snapshot, not a claim that the entire 201-lesson rebuild or QA is finished. No ambiguity requires inventing an identity to package G1.U1 as a draft.

### Exact identities

Selected authored order:

| Position | Existing lesson ID / slug | Standard |
| -------: | ------------------------- | -------- |
|        1 | sentence-shapes           | RF.1.1a  |
|        2 | blend-builders            | RF.1.2b  |
|        3 | sound-spotters            | RF.1.2c  |
|        4 | ask-it-find-it            | RL.1.1   |
|        5 | story-message             | RL.1.2   |
|        6 | fact-questions            | RI.1.1   |
|        7 | topic-spotter             | RI.1.2   |
|        8 | word-toolbox              | L.1.4    |
|        9 | sentence-clues            | L.1.4a   |
|       10 | prefix-power              | L.1.4b   |

K.U2 alternative, authored order: `sound-sliders` RF.K.2c; `sound-detectives` RF.K.2d; `word-machines` RF.K.2e; `letter-sounds` RF.K.3a; `snap-words` RF.K.3c; `tell-it-back` RL.K.2; `word-wonder` RL.K.4; `naming-doing-words` K.L.1.

G2.U1 alternative, authored order: `decoding-champions` RF.2.3; `long-or-short` RF.2.3a; `team-players` RF.2.3b; `ask-and-answer-g2` RL.2.1; `fable-tellers` RL.2.2; `character-challenges` RL.2.3; `fact-finders-ask` RI.2.1; `paragraph-power` RI.2.2; `chains-and-steps` RI.2.3; `word-solvers` L.2.4; `clue-hunters` L.2.4a; `word-math` L.2.4b; `root-clues` L.2.4c.

## 2. Release and packaging contract

`scripts/package-curriculum-pilot.mjs` parses authored TypeScript without executing lesson modules. It requires one exact definition per selected standard, exact ID/slug/registry/quiz relationships, and resolvable exam picks. The manifest reuses `CurriculumRelease`; optional unit `domains` is the sole extension to the prior foundation. No competing production registry was added.

- Unit `G1.U1`, title **Grade 1 · Unit 1**: the roadmap supplies no separate thematic title. Grade 1; RF/RL/RI/L domains; ten contiguous lesson positions.
- Lesson version: hash of lesson and individual quiz bundles, including source, imported timing JSON, resolved audio/image references, and owned asset-directory bytes. Changes to those resources invalidate the edition.
- Checkpoint version: exam source, selected question attribution, and source-quiz bundles. No selected question has a follow-up redirect; the existing default runner uses the authored order with adaptive mode off.
- Unit version: authored roadmap section. Catalog and registry fingerprints are explicit and contribute to release identity.
- Coverage: ten single-standard declarations. No RF parent expansion or combined-standard relationship is inferred. L.1.4 remains distinct from L.1.4a/b.
- Exists, technical QA, curriculum approval, and production publication remain separate. Nine lesson bundles have **failed local asset checks**; Word Toolbox's overall technical QA is **unknown**, not passed. All curriculum/coverage/unit reviews are pending and publication is draft. Checkpoint technical QA is failed because source-quiz resources are missing locally; a complete runner/device audit is also outstanding.
- `validateCurriculumRelease` validates structure; `lessonPlanningEligibility` still blocks production. The isolated preview reports those blockers rather than overriding them.

**Asset finding:** 41 statically referenced audio files are absent locally. Exact paths are in `package.json → technicalReview.missingFiles`. No resources were generated, rewritten, uploaded, or checked on hosted storage. This does not establish 41 live production 404s. Package hashes record missing files as missing, so adding them changes the content version. Hashes establish identity, not instructional or audio quality.

The package is not a content distribution mechanism. Production would need the corresponding frozen Astra source/assets plus trusted approvals. Repackaging or a later edit requires review of the new edition. Do not import this JSON inventory into the live Journey.

```sh
node scripts/package-curriculum-pilot.mjs --root /Users/filipgalietti/readee-app2.0 --out docs/curriculum-pilot/g1-u1
node scripts/package-curriculum-pilot.mjs --root /Users/filipgalietti/readee-app2.0 --out docs/curriculum-pilot/g1-u1 --verify
```

Verification checks recorded bytes and newly added files in the packaged directories. Extraction fails on unresolved selected lesson/exam identities. The tool is deliberately limited to this pilot and the current literal authored formats; it is not a general TypeScript evaluator or the full planner.

## 3. What the assessment supports for this unit

Sources: `app/data/placement-spectrum/words.ts`, `language.json`, `reading.ts`; `lib/placement/spectrum.ts`, `spectrum-decision.ts`; normalized evidence in `lib/journey/learner-evidence.ts`. No scoring or thresholds were changed.

| Evidence source       | A: directly supported observation                                             | B: proposed instructional inference requiring review                                           | C: unsupported interpretation                                                             |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Letter-sound floor    | Responses to sound-to-letter choices for m/s/t/p/n/f                          | Review an earlier foundational area if samples and other evidence suggest it                   | Productive sound mastery, whole alphabet mastery, or specific G1 unit prerequisites       |
| Mixed word sets       | Recorded word responses and named set; G1 sets tagged RF.1.3                  | Broad word-reading area review alongside passages                                              | Direct RF.1.2b/c mapping, specific vowel/prefix weakness, or unit mastery                 |
| Oral blending         | Responses combining map, sit, fish                                            | Review whether Blend Builders is useful                                                        | Mastery/failure of all consonant blends, segmentation, or Sound Spotters' isolation skill |
| Connected text        | Accuracy, coverage, and meaning on sampled passages                           | Saved confirmed Grade 1 start supports considering G1.U1; provisional start needs confirmation | Exact national grade equivalent or a deficient skill inferred from unmeasured audio       |
| Passage comprehension | Saved question counts on actual text                                          | Review guided story/information instruction                                                    | A precise RL/RI lesson prescription without approved item mappings                        |
| Supported listening   | Saved language counts; authored RL.1.1/RL.1.2/RI.1.1/RI.1.2 item associations | Review supported discussion work using the whole sample                                        | Independent reading at the listening band or standard mastery from one item               |
| Rate                  | Saved sample WCPM and accuracy, when available                                | Context for specialist review with other evidence                                              | Automatic entry/skip/deficiency threshold or catch-up prediction                          |
| Previous completion   | Existing standard-level completion records                                    | Continue the authored sequence at unfinished work                                              | Mastery of the old or rebuilt content, or checkpoint passing                              |

The normalized adapter retains historical listening choice IDs with correctness unknown when the item-bank version is unavailable; it does not rescore them using today's key. Band recommendations are broad instructional inferences even when the saved policy calls them confirmed. No exact lesson prescription is promoted to directly measured evidence.

## 4. Proposed rules for Jennifer

`lib/curriculum/pilot/rules.ts` defines ten proposals using `InstructionalTargetMapping`, `EvidenceSupport`, and existing explanation categories. `pilotRulesForRelease` gives independent copies and binds provenance to the exact unit edition. Mappings remain pending and are **not** inserted into `APPROVED_INSTRUCTIONAL_MAPPINGS`.

| Rule ID (prefix `g1-u1-`) | Strength | Proposed destination/action                                                                               | Reason category                   |
| ------------------------- | -------- | --------------------------------------------------------------------------------------------------------- | --------------------------------- |
| confirmed-entry           | B        | G1.U1 / sentence-shapes, only as a review candidate when entry and independent band are confirmed Grade 1 | assessment-selected-starting-unit |
| provisional-followup      | B        | G1.U1 / sentence-shapes, labelled provisional                                                             | provisional-follow-up             |
| blending-followup         | B        | Review blend-builders / RF.1.2b; no automatic miss-count threshold                                        | provisional-follow-up             |
| listening-followup        | B        | Review the four story/information lessons; no item-specific prescription                                  | provisional-follow-up             |
| comprehension-followup    | B        | Review the same four lessons using whole-passage evidence                                                 | provisional-follow-up             |
| letter-word-review        | B        | Hold for earlier-area review; no invented prerequisite destination                                        | provisional-follow-up             |
| earlier-review            | B        | Hold when evidence suggests an earlier starting area                                                      | provisional-follow-up             |
| above-review              | B        | Hold for later-area review; do not mark this unit mastered/skipped                                        | none                              |
| no-automatic-skip         | C        | No prescription from a broad band to whole-unit mastery                                                   | none                              |
| no-specific-deficiency    | C        | No prescription from a single error or rate to a precise deficit                                          | none                              |

Each proposal retains evidence description, strength, target references when supportable, parent-safe explanation, approval requirement, effect, and mapping/rule version. All require curriculum review. Unsupported proposals carry no mapping. Validation rejects unknown targets, unknown/changed rules, and attempts to label B/C evidence a measured need.

Only the entry/provisional candidate projection and completion handling execute in the isolated preview. Blending/listening/comprehension follow-up proposals are review declarations, not active selectors. Prerequisite, review, and reassessment reason categories remain deferred as in the foundation. Normal continuation is explained by the authored unit sequence, not a fabricated assessment diagnosis.

## 5. Pilot entry behavior

`previewPilot` accepts normalized evidence, release, inventory, and proposed rules. It returns `mode: curriculum-review-only`, `productionEligible: false`, structural issues, approval blockers, proposed lesson references/explanations, retained credit, and the next proposed lesson. It has no subscription input, database writes, or runtime model calls.

| Case                                               | Isolated review behavior                                                                                                                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Confirmed Grade 1 entry and independent reading | Show ten lessons in authored order; start at Sentence Shapes, subject to pending curriculum mapping approval.                                                              |
| B. Earlier entry                                   | Hold for review; assign no earlier unit. Show any already completed pilot lessons as credit.                                                                               |
| C. Later entry                                     | Hold for later-area review; automatically master/skip nothing. Retain any pilot credit.                                                                                    |
| D. Provisional Grade 1 / missing evidence          | Provisional Grade 1 gets a clearly provisional candidate sequence. Missing/unsupported entry gets no new candidate. Stronger listening cannot confirm independent reading. |
| E. Partially completed                             | Preserve exact standard-level legacy credit and provenance; continue at first unfinished lesson when Grade 1 entry is supported.                                           |
| F. Completed before this planner                   | Preserve all ten completions, even without a current assessment; no compulsory redo. Checkpoint remains awaiting interpretation/persistence review.                        |
| Above-enrollment reader                            | K enrollment plus confirmed Grade 1 reading can produce the Grade 1 candidate. Enrollment is not overwritten.                                                              |

Completion recognition reuses the existing foundation's historical practice/section rules. Original timestamps, source rows, and `mastery: not-established` survive. These records do not claim the child completed this newer content version. Broad-band evidence never cancels completion credit.

Seven fixture builders use the actual `PlacementSubmissionSchema` and `validatePlacementEvidence` replay. The provisional fixture uses a valid `child-pass` stop rather than invented scores. Production decision logic is invoked only to build synthetic fixtures; runtime review code consumes saved normalized decisions.

## 6. Checkpoint findings and future contract

Authored source: `app/data/quizzes-v2/g1-unit-1-exam.ts`; quiz ID `g1-unit-1-exam`; lesson/group ID `g1-unit-1`; marker `G1-U1` is an exam identifier, not a CCSS standard. Manifest unit identity `G1.U1` is explicitly associated; no string-normalization alias is introduced.

| Exam position | Source lesson   | Source question ID             | Explicit source standard |
| ------------: | --------------- | ------------------------------ | ------------------------ |
|             1 | sentence-shapes | c-1-capital-letter-application | RF.1.1a                  |
|             2 | blend-builders  | c-identify-blend-word          | RF.1.2b                  |
|             3 | sound-spotters  | c-1-first-sound-ship           | RF.1.2c                  |
|             4 | ask-it-find-it  | c-why-dot-hide                 | RL.1.1                   |
|             5 | story-message   | c-message-identify             | RL.1.2                   |
|             6 | fact-questions  | c-2-answer-legs                | RI.1.1                   |
|             7 | topic-spotter   | c-1-main-topic                 | RI.1.2                   |
|             8 | word-toolbox    | c-bark-context                 | L.1.4                    |
|             9 | sentence-clues  | c-1-gleeful-meaning            | L.1.4a                   |
|            10 | prefix-power    | c-4-sort-un-re                 | L.1.4b                   |
|            11 | story-message   | c-story-events-sort            | RL.1.2                   |
|            12 | sentence-shapes | c-5-read-sentence-aloud        | RF.1.1a                  |

These associations follow explicit `pick(sourceQuiz, questionId)` references and source quiz standards, reinforced by authored exam comments. They establish attribution, not sufficient sampling of every aspect of a standard. `adaptive: false`, `askCount: 12`; no selected item has `followUpId`.

The existing `app/components/lesson-v2/QuizRunner.tsx` stores question ID, prompt, band, difficulty, first-attempt correctness, and attempts in local result state. Its emitted learning event includes eventual correctness, attempts, response time, lesson/scene IDs, and timestamp. `lib/lesson-engine/events.ts` logs and notifies subscribers; that alone is not durable child progress. The optional `onEvent` callback currently receives `{}` cast to `LearningEvent`, a real integration defect. The exam demo is not a durable production checkpoint writer. No runner code was changed in this ticket.

Displayed percentage/stars are existing presentation semantics. No curriculum-approved mastery/pass threshold or approved fail-to-repeat rule was found. Legitimate inference is limited to sampled responses under the recorded support/retry conditions. Do not use this exam to activate adaptive replanning.

`PilotCheckpointEvidence` is a future persistence contract only: exact checkpoint/content version, child/session, timestamp, question/source quiz/standard, attempts, separate first-attempt/eventual correctness, measured/unmeasured status, provenance, and `thresholdPolicy: null`, `mastery: not-established`. Implementing its writer, authenticated ownership checks, idempotency, and approved interpretation is a later ticket.

## 7. Explainability and next ticket

Every proposed lesson has exact lesson/version/unit/standards, reason, parent explanation, evidence or curriculum provenance, and explanation/rule version. The first uncompleted entry lesson uses an assessment-selected or provisional reason; the rest use normal curriculum sequence. Existing completions retain credit separately. Tests verify explanations for all ten lessons without claiming ten measured deficiencies. These explanations are review drafts, not approved parent-facing claims.

**Next ticket: resolve and approve this exact pilot edition.** Complete local/hosted asset reconciliation and lesson/device QA; Jennifer reviews the packet's coverage/order/overlap/prerequisites/checkpoint and individual entry rules. Bind approvals to the exact frozen content, coverage, unit, and mapping versions. Decide checkpoint interpretation and repair/persist its events in a separately scoped ticket. Rerun structural, eligibility, evidence, and credit tests. Approval does not itself publish or replace the live Journey.

The contracts appear scalable: exact identities, content-bound releases, uncertainty, rule provenance, and completion credit have now been exercised together. The extraction tool and preview intentionally handle only this unit. Scaling to 201 still requires Astra's finished editions, approvals and mappings per unit, explicit combined-standard decisions (including RF.K.1), the RL.K.1 alternative identity decision, reliable checkpoint/progress persistence, and a separately approved full planner implementation.
