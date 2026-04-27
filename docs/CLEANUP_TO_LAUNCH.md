# Cleanup to Launch

_The bar before any revenue push or district demo. Every item here is
something a paying customer would notice on day one. No new features
until this list is empty._

## Definition of "ready"

A district admin can:
1. Land on `readee.app`, immediately understand what we do, and click through to a meaningful demo without confusion.
2. Sign up as a teacher, build a quiz with the AI wizard, preview it, assign it, watch a student finish, and see results — every step works on first try with zero "well that's a bug" moments.
3. Inspect any piece of content (existing manifest or AI-generated) and find no glaring quality issues — no answer-giving hints, no broken images, no off-grade vocabulary.
4. See a "reviewed by reading specialist" trust signal that's actually backed by a process.
5. Pay us — Stripe live, webhooks reliable, billing portal works.

Not "ready" until all five.

## 🔴 Content quality (Jennifer-led, AI-assisted)

### 1. Fix all the hint-gives-away-answer issues
Backfill found this is a systemic K pattern. Many hints literally
state the answer. Approach: scan the full manifest with an AI judge
that specifically checks "does this hint reveal the answer?", batch-
rewrite the bad ones, regenerate hint audio for changed rows.

- [ ] `scripts/audit-hints.js` — scans master_manifest, flags hint/answer leakage
- [ ] `scripts/rewrite-hints.js` — proposes new hints for flagged rows
- [ ] Jennifer reviews proposals (CSV diff)
- [ ] Apply approved rewrites to manifest, rebuild app/data files
- [ ] Regenerate hint audio for changed rows (~$0.001/each)
- [ ] Re-run backfill, hint failures should be near-zero

### 2. Fix the 6 "correct answer not in choices" rows
Real bug — answer string didn't match a choice character-for-character.

- [ ] Pull the 6 from the QC CSV
- [ ] Hand-fix the typo / character mismatch in the manifest
- [ ] Rebuild app/data files

### 3. Fix the 7 "duplicate choices" rows
Same drill — manifest typo, hand-fix, rebuild.

### 4. Run the QC backfill against ALL content
Currently only master_manifest. Also need:
- [ ] `app/data/sample-lessons.json` (200 lessons)
- [ ] `scripts/stories-bank.json` (25 stories)
- [ ] Output: combined Jennifer-fix CSV

## 🟡 QC engine calibration

### 5. Drop deterministic Flesch-Kincaid check
75% false-positive rate makes the signal useless. AI judge alone
catches real grade mismatches.

- [ ] Remove FK band check from `lib/ai/qc.ts` (`passage.reading_level`)
- [ ] Keep word-count band check (that one's signal-rich)
- [ ] Re-run a 50-item smoke test → confirm WARN rate drops below 30%

### 6. Tune the LLM judge prompt
Some judge messages are too noisy ("hint could be slightly more
guiding…"). Tighten the rubric to only fire warn/fail on things a
human reviewer would actually want flagged.

- [ ] Add explicit "do NOT flag style preferences, only correctness/safety/grade-fit" to the judge system prompts
- [ ] Re-run 50-item smoke test, compare to current

## 🟡 Wizard E2E hardening

### 7. Self-run the wizard scenario checklist
Filip runs `docs/WIZARD_SCENARIOS.md` himself, checks off every
scenario. Catches the bugs we know we don't know.

### 8. Daily question fallback
Today: if QC fails twice, the bad row stays, widget shows it.
Want: widget falls back to yesterday's last good row.

- [ ] Update `DailyQuestionCard` query to filter `qc_overall != 'fail'`
- [ ] Update `/today` index page same way
- [ ] Add a `?lookback=` param so the cron can re-pin a known good day if needed

### 9. Voice samples in prod
Last validated locally. CSP fix shipped — confirm samples actually
play in the prod wizard.

## 🟡 Marketing surface

### 10. Landing page rebuild
The current `readee.app` is the old marketing site. New `readee-site-next`
is live but we haven't audited the copy / hero / proof points for the
"district admin lands here" frame.

- [ ] Hero: lead with the "K-4 reading specialist + AI" pairing, not feature list
- [ ] Above-fold proof: Jennifer's credentials, 1100+ standards-aligned questions, district pilots
- [ ] Demo embed: 60-second screen recording of the wizard build flow
- [ ] Two CTAs: "Try free as a teacher" + "Book a district demo"
- [ ] Privacy / COPPA / Common Core badges visible without scrolling
- [ ] Pricing page that surfaces Teacher Solo + School + District tiers

### 11. SEO / share-card audit
- [ ] OpenGraph tags on every public page (have it on /today, need it on /, /signup, /schools, /standards/*)
- [ ] Robots.txt + sitemap.xml served correctly
- [ ] All 200+ /standards/* pages have unique meta descriptions

## 🟢 Operational readiness (do, but not blockers)

### 12. Admin force-regenerate button on `/admin/qc`
~30 lines, half hour. Lets Jennifer fix a bad daily before parents see it.

### 13. Make `qc-content.js` incremental
Skip items already in the CSV. Saves $1-2 per re-run.

### 14. Stripe live env vars
Deferred until everything else is green. The moment we charge a
penny, every above item becomes a customer-facing bug.

## What launch looks like

- Friday: cleanup items 1-9 done
- Following week: marketing 10-11 done
- Following Monday: Jennifer + Filip do a final pass against the
  "district admin scenario" — full clean walk-through, no bugs
- Stripe goes live
- First district pitches go out

That's the order. Polish → Trust → Revenue.

---

_See `docs/WIZARD_SCENARIOS.md` for the self-test runbook (item 7)._
