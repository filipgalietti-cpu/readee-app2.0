# Tests

Vitest-based unit + small integration tests.

## Running

```bash
npm test            # one-shot
npm run test:watch  # re-runs on save
npm run test:ci     # build + tests, matches CI
```

## Philosophy

**Unit tests for pure logic, not mocks of Supabase.** The value of a test for
`rewriteMastery(rows)` is that it can't pass by accident; the value of a
mock-Supabase test is mostly arguing with the mock.

- Use tests to **pin behavior**: given these inputs, this is the output.
  Refactors that break output break tests. That's the whole point.
- Prefer testing **exported helpers** over testing file-private logic. If
  something inside a server action is worth testing, extract it to
  `lib/.../`.
- Skip testing anything that's "call Supabase, return what it gave you" —
  that's testing the ORM, not our code.

## Current coverage

| File | What it covers |
|---|---|
| `student-session.test.ts` | HMAC sign/verify for classroom-owned student cookies. Catches: secret swap, body tampering, old tokens, malformed inputs. |
| `csv.test.ts` | `csvEscape` and `safeExportFilename` from `lib/util/csv.ts`. Catches RFC 4180 edge cases (embedded quotes, commas, newlines). |

## What else would earn its keep

- Custom-question validator (extract from `authoring-actions.ts` → `lib/classroom/question-validation.ts`, then test)
- Class-code uniqueness / character set properties (`randomCode` in `admin/actions.ts`)
- Gemini response-shape validator (the `questions.push(...)` filter loop in `readee-ai.ts`)
- CSV parser for invite modal (extract `parseCsv` from `InviteStudentsButton.tsx` into a util and test it)
- `auth_is_teacher_of_child` / `auth_admin_sees_child` helpers — **don't** test in Vitest; test these with `supabase db test` or an integration suite that runs against a clone of prod.

Don't write end-to-end Playwright tests until you're feeling the pain.
Solo-dev stage: smoke-test manually, let Sentry catch regressions, add
unit tests as you hit specific bugs.
