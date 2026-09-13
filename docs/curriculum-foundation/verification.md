# Foundation verification

Verified September 11, 2026, in `/private/tmp/readee-journey-polish`. Existing worktree changes were left in place. No production application files, lesson content, assessment scoring, migrations, or entitlements were changed.

## Files added

| File | Purpose |
| --- | --- |
| `lib/curriculum/release.ts` | Release schemas, identity validation, derived planning eligibility |
| `lib/journey/evidence-contract.ts` | Explicit evidence status/support/provenance and progress types |
| `lib/journey/learner-evidence.ts` | Pure saved-evidence normalization, including historical compatibility |
| `lib/journey/instructional-mappings.ts` | A/B/C capability policy, mapping types/validation, empty approved set |
| `lib/journey/planner-contract.ts` | Educational planner input/output and explanation types only |
| `scripts/curriculum-reconciliation.ts` | Offline AST-based source reconciliation and CSV/JSON export |
| `tests/curriculum-release.test.ts` | Release/identity/approval/order/checkpoint validation |
| `tests/curriculum-reconciliation.test.ts` | Complete source coverage, combined candidates, mapping and dependency boundaries |
| `tests/learner-evidence.test.ts` | Current/historical evidence, uncertainty, missing data, no invented mastery |
| `docs/curriculum-foundation/README.md` | Integration contract, findings, review decisions, next ticket |
| `docs/curriculum-foundation/verification.md` | This result record |
| `docs/curriculum-foundation/astra-snapshot/reconciliation.csv` | Complete Astra-worktree reconciliation table |
| `docs/curriculum-foundation/astra-snapshot/reconciliation.json` | Same rows with source provenance/hashes |
| `docs/curriculum-foundation/journey-snapshot/reconciliation.csv` | Complete Journey-worktree reconciliation table |
| `docs/curriculum-foundation/journey-snapshot/reconciliation.json` | Same rows with source provenance/hashes |

## Commands and outcomes

### Source reconciliation: passed for both worktrees

```sh
node scripts/curriculum-reconciliation.ts --root /Users/filipgalietti/readee-app2.0 --out docs/curriculum-foundation/astra-snapshot
node scripts/curriculum-reconciliation.ts --root /private/tmp/readee-journey-polish --out docs/curriculum-foundation/journey-snapshot
```

Both exited 0 and generated 203 rows covering all 201 catalog standards. Node printed its existing-package module-type warning because the CLI uses ESM syntax with native TypeScript stripping. No package setting/dependency was changed to silence it.

### Relevant tests: passed

```sh
npx --no-install vitest run tests/curriculum-release.test.ts tests/curriculum-reconciliation.test.ts tests/learner-evidence.test.ts tests/placement-spectrum.test.ts tests/placement-plan.test.ts tests/journey-access.test.ts
```

**72 passed across six files, including 34 new tests.** Existing spectrum, plan, and entitlement tests passed alongside the foundation tests.

Coverage includes exact identity and version binding; duplicate IDs; unknown standards; combined-standard approval; unit ordering; checkpoint membership/publication; spectrum profile versions 1–3; pre-spectrum placement compatibility; unsupported legacy percentages; confirmed/provisional/missing/unsupported states; above-enrollment reading; listening versus independent reading; historical answer-key non-replay; completion versus mastery; cross-child input rejection; and a recursive runtime import-graph check excluding model, scoring, billing, and I/O dependencies.

### Typecheck: passed

```sh
npx --no-install tsc --noEmit --incremental false
```

Exit 0, no errors. Incremental output was disabled.

### Scoped lint, including the otherwise-ignored script: passed

```sh
npx --no-install eslint --no-ignore lib/curriculum/release.ts lib/journey/evidence-contract.ts lib/journey/learner-evidence.ts lib/journey/instructional-mappings.ts lib/journey/planner-contract.ts scripts/curriculum-reconciliation.ts tests/curriculum-release.test.ts tests/curriculum-reconciliation.test.ts tests/learner-evidence.test.ts
```

Exit 0, no errors or warnings.

### Repository-wide lint: failed on existing code

```sh
npm run lint
```

**1,683 findings: 1,373 errors and 310 warnings.** The new foundation files had no findings. Existing failures include `@typescript-eslint/no-explicit-any` in reader setup, revenue observability, signup observability, and Stripe fulfillment tests, along with other existing application/test findings. No unrelated fixes or autofixes were attempted. Full captured output: `/tmp/readee-foundation-lint.log`.

### Production build: not run

The existing local dev server on port 3443 uses this worktree's `.next` directory. A production build here could interfere with that running server. This change adds unconnected, unit-tested foundation modules and an offline tool; no route or build configuration was modified. A production build remains a deployment check for the later integration ticket.

## Limits

No live Supabase review/approval records, published assets, or Stripe state were queried. Unknown approval is explicitly unknown, not a failure verdict. The source snapshots cannot certify completion of Astra's ongoing rebuild. No real child's assessment or progress record was changed. No planner, new UI, adaptive behavior, or curriculum release was activated.
