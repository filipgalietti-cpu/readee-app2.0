# Content Factory

Daily AI batch generation pipeline that adds K-4 reading content to the library every morning. Started Apr 30 2026.

## TL;DR

- Cron runs nightly per asset type (8 UTC for leveled passages).
- Each cron generates a small batch (5–15 items), runs full QC + fidelity judge + gameability checks.
- **AI QC is the gate** — Filip's call Apr 30 2026: Jen will not actively triage. Items either auto-ship or auto-reject.
- Aggregate credits: ~$45/mo at full scale across all asset types.
- Source of moat: ~12,600 new K-4 items/year. Newsela has a writers' room. We have a factory.

## Asset types

| Kind | Status | Cron | Batch size | ~Credits/item |
|---|---|---|---|---|
| `leveled_passage` | ✅ Phase 2 live | `0 8 * * *` | 5 | 8 |
| `calibrated_mcq` | 🟡 Phase 3 planned | TBD | 30 | 2 |
| `decodable_book` | 🟡 Phase 3 planned | TBD | 5 | 10 |
| `themed_story` | 🟡 Phase 3 planned | TBD | 1 | 12 |
| `vocab_card` | 🟡 Phase 3 planned | TBD | 20 | 6 |

**Phoneme audio is OFF-LIMITS.** Isolated phoneme TTS (`/b/`, `/sh/`, `/oo/`) is too brittle to generate at scale; the 45-file hand-tuned phoneme bank from Mar 2026 stays the canonical source. Phonics-pattern *prose* (decodable books) is fine.

## How it works

### 1. Topic rotation
`lib/factory/topic-rotation.ts` picks N (standard, grade, theme) tuples per night:
- Filters to comprehension standards only (RL.* / RI.* leaves)
- Excludes any standard used in the last 14 days for that asset kind
- Pairs each with one of 20 hand-curated themes (animals, weather, kids around the world, etc.)
- Deterministic shuffle by date — re-runs of the same day yield the same picks

### 2. Pre-flight guards
`lib/factory/guards.ts`:
- Idempotency: `factory_runs` has a unique constraint on `(run_date, asset_kind)` so re-running the same day returns early.
- Per-kind batch size cap: max 15 leveled passages per night.
- Daily factory budget: 350 credits across all asset kinds. Aborts if a batch would push spend past the cap.

### 3. Generation
- Calls the existing `buildLeveledPassage()` (or whatever asset-specific generator) — reuses the synchronous QC + image + per-level MCQ pipeline we already had.
- Each prompt is seeded with brand-voice exemplars (`lib/factory/brand-voice.ts`) drawn from the existing 25-story bank so output matches Readee tone, not generic ChatGPT prose.

### 4. Auto-promote decision (the "AI QC is the gate" layer)
`lib/factory/auto-promote.ts` — **aggressive mode by default** since Jen isn't reviewing:

**REJECT (shadow row, prompt-tune signal):**
- HARD QC check warned or failed. Hard checks:
  - `passage.banned_words` — substring banlist hit
  - `passage.judge` — content concern from the LLM judge
  - `image.judge` — image not kid-safe / has text / off-prompt
  - `q.correct_present` — correct answer literally not in choices
  - `q.judge` — per-MCQ judge content / fidelity concern
- Standards-fidelity verdict = `mis_tagged`
- MCQ length-cheat detected (correct answer >2× shortest distractor)
- QC overall = `fail`

**SHIP TO LIBRARY (`ready`):**
- All hard checks pass, even if soft checks warned.
- Soft warns are: `passage.length`, `passage.reading_level` (FK drift), `passage.no_markdown`, fidelity `partial`. These get the green light because they're stylistic, not safety/integrity issues.

**NEEDS REVIEW** is now reserved for `cautious` mode (new asset prompts under iteration only).

### 5. Persistence
- Live content lands in its existing table (`differentiated_passages` etc.) — assets are visible to teachers immediately if `status: ready`.
- A `content_review_queue` row records the QC verdict, the source prompt version, the standard tag, and a pointer back to the live row. This is the audit trail.
- `factory_runs` logs per-night counters (generated/pass/warn/fail/credits) so we can see "did the cron actually fire?" at a glance.

## Operations

### Where to look
- `https://learn.readee.app/admin/batch-qc` — review queue + today's runs panel. Admin gate via `admin_memberships`.
- Supabase `content_review_queue`, `factory_runs` tables.
- Sentry — every factory failure goes through `trackFactoryError(...)` with route prefix `factory.{asset_kind}`.

### Manual triggers
```bash
# Force a fresh run (deletes any existing factory_runs row first):
curl -X POST 'https://learn.readee.app/api/cron/factory-leveled-passage?force=1&count=5' \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Adding a new asset type (Phase 3 onward)
1. Build (or reuse) the underlying generator in `lib/ai/build-{kind}.ts`.
2. Add the kind to `FACTORY_BATCH_CAPS` and `ESTIMATED_CREDITS_PER_ITEM` in `lib/factory/guards.ts`.
3. Add the kind to the asset_kind check constraint on `content_review_queue` (one-line migration).
4. Build `app/api/cron/factory-{kind}/route.ts` mirroring `factory-leveled-passage`.
5. Wire into `vercel.json` crons at a different UTC hour to avoid contention.
6. Smoke-test locally with `?force=1&count=2`.

### Killing a cron
- Comment out the entry in `vercel.json` and redeploy.
- Or set `FACTORY_DAILY_CREDIT_CAP = 0` in `lib/factory/guards.ts` to halt all factories at once.

### Tuning a prompt
1. Bump `PROMPT_VERSION` in the cron route (e.g. `leveled_v1` → `leveled_v2`).
2. Edit the underlying generator's system prompt.
3. Force-run for a few nights with `?force=1`.
4. Compare reject rate / quality between v1 and v2 batches in the dashboard.
5. If v2 is better, leave the bump. Old v1 items stay tagged for rollback.

## Check-in cadence

**FILIP: Check the dashboard every Monday morning.** Spot-audit 5–10 items at random:
- Open `/admin/batch-qc?status=ready`, click into a few cards, read the passages.
- Sample 1–2 from `?status=rejected` to see what the AI is filtering out — that's the prompt-tuning signal.
- If reject rate is climbing or quality is drifting, retune.

**First scheduled review: ~ May 7 2026.**

## Future direction

### Bundles / packs (Fortnite-style monetization)

Filip's idea, parked for after the factory has produced enough content to be interesting. The model:
- Once we have ~500+ assets per asset type, package them into themed bundles.
- Examples: "100-Day STEM Reading Pack", "Phonics Power-Up Bundle", "ELL Starter Set", "IEP Fluency Library".
- Bundles sold as one-time purchases through Stripe — sit alongside the existing subscription tiers.
- Teachers buy with school PD funds; parents buy with allowance/gift cards; districts buy under their content procurement budget.
- A bundle = a queryable filter on the existing content tables, not new content. Cost to build a bundle = packaging + design + Stripe SKU. Marginal cost to deliver = 0.
- Optional: kid-facing "library shelf" with locked/unlocked metaphor — buying a bundle unlocks that shelf for the kid. Aligns with the Fortnite-cosmetic-pack mental model.

This unlocks revenue paths beyond seat licensing. Don't build until the factory has fed the library for ~3 months.

### Other parked extensions

- **Switch to Gemini Batch API** for true 50% cost savings once volume justifies the migration effort (Phase 3 onward, when nightly batches exceed 100 items).
- **Embedding-based topic dedupe** (currently substring-based v1 in `lib/factory/topic-dedupe.ts`).
- **Production telemetry feedback** — auto-flag passages where >30% of kids fail the same MCQ; feed back into prompt-tuning.
- **Quarterly regen with newer model** — when a better model lands, regenerate any item where production telemetry says quality is weak.

## Phoneme exclusion

Hard rule: **factory cannot generate isolated phoneme audio.** Reasons:
- Gemini TTS sometimes adds an "uh" vowel after consonants (`/b/` → "buh").
- Gemini TTS sometimes pronounces letter names instead of sounds (`/sh/` → "ess-aitch").
- The 45-file phoneme bank from Mar 2026 took 5 audit rounds and Filip's manual ear-checking. Not redoable at scale.

What IS allowed:
- Decodable book prose (TTS reads the prose normally — no isolated phonemes).
- RF.x.3 phonics MCQs (questions are written; audio is TTS of the prompt).
- Spelling pattern lessons (written instruction).

What is NOT:
- Isolated phoneme audio synthesis.
- Letter-sound mapping audio.
- Any factory-generated audio file < 2 seconds long.

## Files reference

| File | Purpose |
|---|---|
| `lib/factory/index.ts` | Public API — `enqueueGeneratedAsset()`, re-exports |
| `lib/factory/guards.ts` | Caps + pre-flight |
| `lib/factory/auto-promote.ts` | Promotion decision (aggressive mode default) |
| `lib/factory/standards-fidelity.ts` | LLM judge: aligned / partial / mis_tagged |
| `lib/factory/mcq-balance.ts` | Length + slot bias checks |
| `lib/factory/brand-voice.ts` | Exemplar passages for prompt seeding |
| `lib/factory/topic-rotation.ts` | Standard + theme picker |
| `lib/factory/topic-dedupe.ts` | Recent-item duplicate filter |
| `lib/factory/tracking.ts` | Run start/finish + error tracking |
| `app/api/cron/factory-leveled-passage/route.ts` | First per-asset cron |
| `app/(protected)/admin/batch-qc/` | Review dashboard |
| `supabase/migrations/085_content_factory.sql` | Schema |
