# Pilot verification

Completed September 11, 2026 in `/private/tmp/readee-journey-polish`.

Packaged release: `astra-g1-u1-pilot-v1-9d8a3d0b845a`.

## Commands and results

| Check                                                   | Result                                                                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Foundation + pilot + spectrum tests below               | **80 passed**, 6 files; 29 new pilot/packaging tests                                                                  |
| `npx --no-install tsc --noEmit --incremental false`     | Passed, exit 0                                                                                                        |
| Changed-code lint below                                 | Passed, exit 0, no warnings                                                                                           |
| Source package `--verify` against active Astra worktree | Passed, `changed: []`                                                                                                 |
| `npx --no-install eslint .`                             | Existing failure: **1,373 errors, 310 warnings**, exit 1; same counts as foundation baseline. No pilot-file findings. |
| Build                                                   | Not run. A dev server uses this worktree's `.next`; no application route changed.                                     |

```sh
npx --no-install vitest run tests/curriculum-release.test.ts tests/curriculum-reconciliation.test.ts tests/learner-evidence.test.ts tests/curriculum-pilot.test.ts tests/curriculum-pilot-packaging.test.ts tests/placement-spectrum.test.ts

npx --no-install eslint --no-ignore lib/curriculum/release.ts lib/curriculum/pilot/rules.ts lib/curriculum/pilot/preview.ts lib/curriculum/pilot/checkpoint.ts scripts/package-curriculum-pilot.mjs tests/curriculum-pilot.test.ts tests/curriculum-pilot-packaging.test.ts tests/fixtures/curriculum-pilot.ts

node scripts/package-curriculum-pilot.mjs --root /Users/filipgalietti/readee-app2.0 --out docs/curriculum-pilot/g1-u1 --verify
```

Full repository lint output: `/tmp/readee-pilot-repository-lint.log`. The global configuration ignores scripts; changed-file lint explicitly uses `--no-ignore` so the new packager is checked.

## Coverage and practical limits

Tests cover exact lesson/standard identity, content versions, duplicate/unknown references, authored order, unresolved mappings, approval requirements, unsupported evidence, provisional vs missing evidence, historical compatibility through foundation tests, above-enrollment reading, listening independence, partial/full historical credit, deterministic output, entitlement independence, per-lesson explanations, checkpoint attribution, and runtime dependency isolation.

Packager tests create temporary synthetic source files, never edit real lessons, and verify reproducibility, source/asset/timing drift, newly added assets, missing resources, duplicate definitions, unknown standards/question IDs, and unregistered exams. Even synthetic completed QA/review/publication cannot make the isolated preview production-eligible.

Seven synthetic child fixtures pass the actual submission schema and server replay. They establish program behavior, not clinical accuracy or child/device usability. The packet contains no real child records or recordings. No database writes, approval grants, customer emails, hosted asset changes, commits, pushes, or deployments were performed.

The package fingerprints **884 dependency paths: 843 present and 41 missing**. Missing audio is a local snapshot finding, not a verified live outage. Nine lessons and the checkpoint fail local resource checks; the remaining lesson still has unknown overall technical QA. No full audio-quality, microphone, curriculum-coverage, or device review was claimed.

## Files changed in this ticket

One existing foundation file extended:

- `lib/curriculum/release.ts`: optional explicit unit domains; older releases remain compatible.

Twelve pilot files added:

- `lib/curriculum/pilot/rules.ts`: ten review-only rule proposals with version-bound unit provenance.
- `lib/curriculum/pilot/preview.ts`: isolated one-unit candidate projection, validation, and completion preservation.
- `lib/curriculum/pilot/checkpoint.ts`: future checkpoint evidence contract; no writer.
- `scripts/package-curriculum-pilot.mjs`: offline source/asset packager and drift verifier.
- `tests/fixtures/curriculum-pilot.ts`: seven schema-valid synthetic assessment/progress fixtures.
- `tests/curriculum-pilot.test.ts`: 20 integration/boundary tests.
- `tests/curriculum-pilot-packaging.test.ts`: nine synthetic-source packaging tests.
- `docs/curriculum-pilot/README.md`: selection, evidence/rules, entry cases, checkpoint audit, and next ticket.
- `docs/curriculum-pilot/verification.md`: this verification and file inventory.
- `docs/curriculum-pilot/g1-u1/REVIEW.md`: Jennifer's curriculum review packet and approval form.
- `docs/curriculum-pilot/g1-u1/release.json`: versioned draft release manifest.
- `docs/curriculum-pilot/g1-u1/package.json`: exact lesson/quiz metadata and source/resource fingerprints.

The previously dirty Journey/UI files and prior foundation work were preserved. Searches found no application imports of the pilot. The full planner, Journey migration/UI, scoring, subscription logic, and live sequencing remain outside this ticket.
