# Curriculum and learner-evidence foundation

Status: implemented contracts and offline tools only. No production imports, scoring changes, lesson edits, Journey migration, planner, paywall, UI work, or adaptive replanning.

The intended canonical content is the 201 K–4 lessons being rebuilt and QAed with Astra. The snapshots below describe work in progress, not approval of the older content and not a declaration that Astra's rebuild is complete.

## 1. Source reconciliation

- [Astra worktree: complete CSV table](astra-snapshot/reconciliation.csv)
- [Astra worktree: machine-readable table and source hashes](astra-snapshot/reconciliation.json)
- [Journey worktree: complete CSV table](journey-snapshot/reconciliation.csv)
- [Journey worktree: machine-readable table and source hashes](journey-snapshot/reconciliation.json)

The Astra source was `/Users/filipgalietti/readee-app2.0` at HEAD `6b91afa1` plus its in-progress files. The Journey source was `/private/tmp/readee-journey-polish` at HEAD `4020a152` plus its existing changes. Content fingerprints accompany each snapshot because Git HEAD alone does not identify uncommitted lesson work. These source inventories differ in 175 files while retaining the same lesson identities.

Both snapshots contain:

| Item                                               | Count |
| -------------------------------------------------- | ----: |
| Catalog standards                                  |   201 |
| Registered V2 lesson definitions                   |   183 |
| Exact registered standard coverage                 |   181 |
| Authored roadmap units                             |    21 |
| Registered quizzes including exams/finals          |   201 |
| Reconciliation rows                                |   203 |
| Duplicate LessonDef IDs                            |     0 |
| Lessons promoted to planning-eligible by this work |     0 |

The 203 rows cover every catalog standard, preserve the alternative RL.K.1 lesson, and retain RF.K.1 as an out-of-catalog declaration. `canonicalLessonId` is the existing `LessonDef.id` where one exists; it is not a newly approved choice between alternatives. Null means identity is unresolved. Registry slugs are separate fields. Row order is catalog order.

The table includes grade, declaration, domain, proposed roadmap unit, roadmap position, objective, source existence/registration, separate approval states, quiz/exam associations, combined candidates, discrepancies, and source locations. A roadmap position is a **standard-row position**, not automatically the approved lesson position: three standard rows can name one lesson.

### Explicit identity decisions still needed

1. **Book Basics:** the lesson declares `RF.K.1`; the roadmap explicitly names Book Basics for `RF.K.1a`, `RF.K.1b`, and `RF.K.1c`. The tool records this named relationship as `documented-combined-candidate`. It does not add a runtime alias or approve coverage. Jennifer must confirm coverage; engineering then maps the three standard routes to one approved lesson and decides how existing standard-level completion credit carries over.
2. **RL.K.1:** both `reading-detective` and `key-details` are real, distinct lesson IDs. The current serving lookup prefers the non-exemplar. The release must explicitly name the canonical lesson or approved sequence; the tool does not choose one.
3. **Seventeen Grade 4 standards lack exact V2 declarations in these snapshots:** `RL.4.7`, `RL.4.9`, `RL.4.10`, `RI.4.7`, `RI.4.8`, `RI.4.9`, `RI.4.10`, `RF.4.4`, `L.4.4c`, `L.4.5`, `L.4.5a`, `L.4.5b`, `L.4.5c`, `L.4.6`, `L.4.1`, `L.4.2`, `L.4.3`. This is expected work-in-progress inventory; rerun against Astra's next approved batch.
4. **Unit identity:** the authored 21-unit roadmap mixes domains. The existing Journey groups domains instead. Those structures must not be treated as interchangeable.
5. **Checkpoints:** direct quiz `lessonId` associations and exam imports are reported as authored associations, not certification that a checkpoint covers every standard in the unit. Question-level multi-standard exam coverage is not a consistent typed field today.

### Repeatable tool

With the Node 25 runtime available in this workspace:

```sh
node scripts/curriculum-reconciliation.ts --root /Users/filipgalietti/readee-app2.0 --out docs/curriculum-foundation/astra-snapshot
node scripts/curriculum-reconciliation.ts --root /private/tmp/readee-journey-polish --out docs/curriculum-foundation/journey-snapshot
```

On a toolchain without native TypeScript stripping, use `tsx` to run the same script. No dependency was added. Node currently emits a module-type warning; the tool still exits successfully. It parses TypeScript ASTs without executing lesson modules, invoking models, contacting a database, or running content generation. Unknown nonliteral identities fail extraction instead of being guessed. It inventories only declared `LessonDef`/`QuizDef` exports and verifies every registry reference resolves; it is not a general-purpose TypeScript evaluator.

The CSV/JSON are review artifacts, **not another lesson registry**. Never import them into Journey. Regenerate after Astra changes content. Source hashes cover inventoried source files, not audio/image bytes or a transitive asset manifest; they are not sufficient production release content versions.

## 2. Canonical curriculum release contract

`lib/curriculum/release.ts` defines and validates metadata referencing the existing registry:

```text
CurriculumRelease
  schemaVersion, releaseId, catalogVersion, registryVersion
  units: stable ID, grade, title, metadata version, source, approval, checkpoints
  lessons: existing lessonId + slug, content version, grade, unitId, position,
           objective, explicit standard coverage, technical QA,
           curriculum review, production publication
  checkpoints: existing quizId, content version, units, QA/review/publication
```

Four different questions remain separate:

| State               | Evidence required                                                |
| ------------------- | ---------------------------------------------------------------- |
| Exists              | Exact ID/slug/version in the supplied curriculum inventory       |
| Technical QA passed | Version-bound passed check with artifact reference               |
| Curriculum approved | Version-bound approval reference                                 |
| Released            | Matching version explicitly released, with publication reference |

Coverage has its own version, source, and review. Combined coverage is an explicit list of known standard IDs. There is no prefix expansion, title matching, arbitrary grade conversion, or inference from file existence. Unit metadata/order must also be reviewed.

`validateCurriculumRelease()` detects duplicate IDs/slugs, unknown references, version/grade mismatch, invalid combined coverage, duplicate/gapped positions, and inconsistent checkpoint membership. Positions describe lessons and must be contiguous within a unit; three standards taught in one combined lesson occupy one lesson position.

`lessonPlanningEligibility()` fails closed unless identity, technical QA, lesson approval, coverage approval, unit approval, publication, and associated checkpoint readiness all pass. Eligibility is derived, not a field that can be set to true. A malformed release is blocked as a whole. It does not publish anything or change today's lesson gates.

Approval inputs must be assembled by trusted internal tooling/code review. A reference string is provenance, not authentication. Do not accept release/approval objects from a child's browser.

### Reuse existing review infrastructure

`lessons_db` already has versions/content hashes and QC status; `lesson_reviews` contains reviewer verdicts. The future release assembler can reference those records. However, existing lesson reviews are keyed by slug/scene/reviewer and are not bound to exact content versions. Do not silently promote an old thumbs-up after the lesson changes. The future content version must cover the actual lesson, imported teaching data, audio/image manifest, and relevant quiz version. A source-file-only hash is insufficient.

No real release manifest has been approved or populated here. No database migration is necessary for these contracts.

## 3. Assessment observation capabilities

`lib/journey/instructional-mappings.ts` encodes this capability policy:

| Observation           | A: directly measured                             | B: broad instructional inference            | C: unsupported                                                           |
| --------------------- | ------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------ |
| Letter sounds         | Sampled sound-to-letter responses                | Consider supported letter-sound instruction | Whole-alphabet mastery or phonics diagnosis                              |
| Word reading          | Named mixed-set responses and saved band         | Word-reading starting area                  | Specific vowel-team/root/affix weakness from the band                    |
| Oral blending         | Three sampled spoken blending responses          | More supported blending work                | Segmentation/manipulation mastery or complete phonemic-awareness profile |
| Connected text        | Sample accuracy, coverage, meaning responses     | Saved confirmed/provisional starting band   | National grade equivalent or failure inferred from no recording          |
| Passage comprehension | Counts on sampled text questions                 | Guided reading/discussion follow-up         | Specific RL/RI mastery without approved question tags                    |
| Listening             | Saved supported-language counts; chosen item IDs | Supported discussion at the evidenced band  | Independent reading at the listening level                               |
| Rate                  | Saved WCPM/accuracy on this sample               | Context for specialist review               | Automatic rate deficiency, national percentile, or catch-up date         |

The current authored word-step RF tags and listening standard tags establish observation associations. They do not establish lesson prescriptions. Passage questions lack a complete per-item CCSS mapping. Oral blending is sampled, not a complete foundational-skills battery.

`InstructionalTargetMapping` requires a versioned rule, minimum-evidence description, target references, source provenance, and review. The validator rejects unreviewed/unimplemented rules, unknown targets, unsupported observations, missing provenance, and duplicate mapping IDs.

**`APPROVED_INSTRUCTIONAL_MAPPINGS` is intentionally empty.** No new instructional relationship has been fabricated. There is no runtime evaluator or planner.

Jennifer/curriculum review is required for the observation-to-target bridge, minimum evidence, specific pattern attribution, unit entry choices, combined coverage, and checkpoint interpretation. Standard tags alone cannot approve those policies.

## 4. Normalized learner evidence

`normalizeLearnerEvidence()` accepts an owned saved placement snapshot, current enrollment, optional historical assessment reference, owned progress rows, and known curriculum standard IDs. The adapter performs no database calls, model calls, clock-dependent decisions, or placement scoring. Call it on the saved decision, not a read-time recalculated plan.

Every usable field has `status`, `support`, `value`, and provenance. Missing/unsupported fields have a reason and **no value**:

- `confirmed`: a recorded measurement or the saved policy's confirmed result; it does not mean independently validated mastery.
- `provisional`: an existing starting recommendation or incomplete confirmation.
- `missing`: no usable measurement supplied.
- `unsupported`: the source cannot support this interpretation or needs a new adapter.

Support A describes observations. Support B describes instructional inference, including a policy-confirmed band. Support C never contains a fabricated numerical value.

The output retains enrollment, instructional entry, word sample, letter sounds, oral blending, independent-reading confirmation, per-passage sample metrics, comprehension counts, separate supported listening, descriptive fluency, reported strengths/needs, standard observations, previous completions, and issues.

Reported strengths/needs are preserved narrative from the saved decision, not machine-readable targeting rules. The planner must not parse those strings to choose lessons.

### History and uncertainty

- Spectrum profile versions 1–3 are accepted without recomputing the decision; absent newer summary fields remain missing.
- Unsupported future versions and contradictory confirmation fields cannot become usable entry recommendations.
- Historical pre-spectrum placement decisions retain their recorded starting band provisionally; they are not upgraded to v4 paired-passage confirmation.
- Old `assessments.dimension_profile` percentages are not translated into spectrum bands. They produce an explicit unsupported state with a source reference.
- A child reading above enrollment retains the higher saved entry. The adapter does not clamp it to school grade.
- Missing rate is not zero. Listening does not inflate independent reading.
- Word responses retain recorded correctness. Their current standard tags are marked unverified for historical bank versions.
- Listening evidence stores chosen IDs but not historical per-item scores or an item-bank version. The adapter **does not rescore those answers using today's key**. Saved by-band totals remain authoritative. Item-level correctness stays null until versioned evidence supports it.
- Neither `score_percent`, old norm conversions, nor placement seeds become normalized mastery.

Previous completion recognition preserves today's `>=3 correct` practice rule and `practice section >=60` rule. Each carries its original table/row/timestamp and `mastery: not-established`. Unknown standard IDs or lesson slugs are flagged rather than silently treated as standards. Ownership is the caller's responsibility; mismatched child IDs on input groups are rejected.

## 5. Planner and explanation contracts

`JourneyPlannerInput` contains learner evidence (including existing progress), an approved curriculum release, approved target mappings, the saved placement plan's historical intent, and an optional prior Journey definition. There are no subscription or entitlement fields.

`JourneyDefinition` identifies planner, curriculum release, source placement, and adapter versions. Each proposed lesson retains its ID/slug/content version, unit, standards, typed reason, parent explanation, explanation-template version, rule version, and provenance.

Reason categories currently declared:

- Assessment-selected starting unit: requires an approved mapping and placement evidence.
- Provisional follow-up: requires an approved mapping and evidence of uncertainty.
- Measured instructional need: requires reviewed minimum-evidence rules; currently no approved mappings exist.
- Normal curriculum sequence: backed by the reviewed unit sequence.
- Checkpoint: backed by an authored, reviewed checkpoint association.

Prerequisite, review, and reassessment-adaptation categories are deferred until approved policies and sufficient persisted evidence exist. Explanations are not generated by a runtime model. An empty/unsupported evidence set must block a prescription instead of yielding a strong parent-facing claim.

## 6. Remaining blockers and next ticket

The production planner remains blocked by approved, version-bound curriculum releases; reviewed unit order; the two identity decisions above; observation-to-unit/lesson mappings; historical assessment-bank version limits; and incomplete detailed V2 progress persistence. Technical tests do not resolve those curricular decisions.

**Recommended next ticket: approve and package one Astra-built pilot unit.** Jennifer reviews exact content/coverage and entry/follow-up rules; engineering binds the approval to lesson/assets/quiz versions, resolves combined lesson and legacy progress identities, and produces the first release manifest that passes the new validators. Use that pilot to review deterministic planner fixtures before implementing the production planner. Continue the remaining 201-lesson rebuild in parallel.

## 7. Verification

See [verification.md](verification.md) for final command results, including unrelated repository-wide lint failures. The runtime foundation has no application import sites yet; existing assessment, lessons, Journey, billing, and database behavior remain unchanged.
