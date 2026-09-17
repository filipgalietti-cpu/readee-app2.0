# Journey and Unit 1 release verification — 2026-09-16

Candidate: `codex/journey-return-polish` at `0e8343e6`.

## Story verified

A parent-owned child can open the approved Kindergarten unit, save lesson evidence, resume the same session, unlock the unit exam only after all eight lessons, return to the journey after completion, inspect compact saved statistics on a completed stop, and open a parent-only question report. A failed exam can be reset through the revision-checked retry path without awarding completion carrots again.

## Results

| Boundary | Result | Evidence |
| --- | --- | --- |
| Production compilation | Pass | Next.js 16.3.4 Webpack build compiled, TypeScript passed, and 742 static pages plus dynamic routes were collected. The local runner required an 8 GB Node heap. |
| Production configuration | Pass | The linked Vercel project contains the approved-unit switch, immutable asset base, Supabase, Stripe, Azure, email, analytics, and monitoring configuration required by this flow. Values were not copied into this report. |
| Authentication and ownership | Pass | Unauthenticated journey/report requests redirect to login while preserving the child-specific return URL. The synthetic full-stack run rejected a second family's child ID. |
| Browser and responsive UI | Pass | Fresh Chromium runs at 1280×800 and 390×844 rendered the white Readee header, completed-node statistics, next-stop progression, and parent report without page errors or horizontal overflow. |
| Browser → API → database | Pass | Production-mode browser test used a local Postgres engine with the production migration and real route handlers. It persisted one session and assessed evidence for all eight lessons, then retained the same session after reload. |
| Entitlement and exam gate | Pass | Existing free access and paid access were enforced; the exam returned locked before completion and opened after all eight lessons were complete. |
| Speech/objective grading | Pass | The objective letter response received a server-accepted verdict and signed receipt; a rubric from another lesson was rejected. Missing speech configuration remained unavailable rather than being scored correct. |
| Rewards and retry logic | Pass | Focused tests cover the once-per-release reward latch, revision conflict handling, archived exam retry, and no new carrots on a retake. |
| Journey return | Pass | Normal and reduced-motion browser checks covered adjacent stops, chapter boundaries, repeated returns, and confirmed that the transition itself performs no reward write. |
| Parent reporting | Pass | Server-derived question results, difficulty, support/pending states, and carrots render in the parent report; child-facing completion returns to the map instead of interrupting with detailed grades. |

## Automated evidence

- Production build: pass.
- Focused Vitest suites: 46 tests across 9 files, all pass.
- Journey return browser contract: all normal- and reduced-motion checks pass.
- Synthetic production-mode browser/API/Postgres flow: pass.
- Local review route: `http://localhost:3336/demo/journey-progress`.

## Remaining release checks

This verification did not write to live Supabase, send email, charge Stripe, deploy the branch, or use a real child's microphone. Before production promotion, use a designated synthetic family on the live project to verify one saved response, one exam retry, next-unit access, the parent report after refresh, and a small Azure speech check. Monitor save failures, asset responses, duplicate rewards, and speech rate-limit responses during that run.

The local standalone production server returns 404 for Vercel Analytics and Speed Insights scripts because those endpoints are injected by Vercel at deployment. Those local-only console messages did not affect the application flow.
