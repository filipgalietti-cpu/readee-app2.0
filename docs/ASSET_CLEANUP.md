# Asset Cleanup Punch List

_Ground truth from the Jul 14 audit (`scripts/audit-assets.py` +
`scripts/recheck-dead-assets.py`). Assets are ~96% healthy — only 67 truly-dead
URLs of 4,897. The old "1,227 missing images" number was WRONG (Supabase 429
rate-limiting misread as dead). Real work below._

---

## ✅ Bucket 1 — 18 broken audio (cheap, no image credits)
Real "Object not found" files (question + hint audio). IDs in
`scripts/asset-audit-truedead.json`.
- [ ] Regenerate **5 question audio** (`audio_url`): RI.3.3-Q8, RI.3.3-Q11,
      RI.3.3-Q13, RI.3.3-Q14, RI.4.5-Q12
- [ ] Regenerate **13 hint audio** (`hint_audio_url`): RI.2.3-Q7/Q9/Q13,
      RI.3.3-Q8/Q11/Q13/Q14, RI.4.5-Q7/Q10/Q11/Q12, RI.K.5-Q7/Q11
- [ ] ⚠️ RI.2.3 is **grade 2** — do AFTER the G2 voice regen finishes (file lock)
- [ ] Use Vertex Pro voice (same as lessons), upload to Supabase, patch URLs

## ✅ Bucket 2 — 49 K passage audio (near-free cleanup)
Stored as relative paths (`/audio/...`, no supabase prefix) AND the app never
reads `passage_audio_url` → doubly broken.
- [ ] Decide: **drop the unused field** (simplest) OR fix prefix + generate +
      wire the field into the runner
- [ ] All 49 are kindergarten (`RL.K.*`) — K JSON is NOT locked (regen past it)

## 💳 Bucket 3 — 75 missing images (Vertex Imagen — CREDIT SPEND)
The acute "look at the picture" → blank bug (Lily, the wolf). IDs in
`scripts/asset-audit-report.json` → `pic_referenced_no_image`.
- [ ] Approve the credit spend (~75 images, ~94% less than the old estimate)
- [ ] Generate: **K 19 · G1 17 · G2 13 · G3 20 · G4 6**
- [ ] Use the "bright 2D cartoon" prompt style; upload + patch `image_url`
- [ ] ⚠️ G2's 13 wait until the voice regen releases the G2 file lock
- [ ] Optional: vision-judge pass on the 558 existing images for WRONG content
      (e.g. RL.2.9-Q4) — small scope, separate

## ⏳ Bucket 4 — finish the running voice re-record
The whispery→Vertex feedback-audio fix (`gen-feedback-audio.ts`).
- [ ] K ✅ done · G1 ✅ done · **G2 running now (PID was 33407)** — let it finish
- [ ] When done: refresh `scripts/feedback-audio-url-backup.json` from the new
      JSON → run `scripts/backfill-feedback-audio-to-db.ts` → commit
- [ ] **G3/G4 feedback audio never existed** — separate generate job if wanted

## 🧹 Bucket 5 — housekeeping (safe, free)
- [ ] Prune stale `app/data/*-standards-questions.json.<timestamp>.bak` backups
- [ ] Prune old audit result JSONs in `scripts/` (audit-25-result.json,
      audit201-*.json, audit-punchlist-postfix.json, etc.)
- [ ] Keep the two new audit scripts + `feedback-audio-url-backup.json`

---

### Suggested order (my rec)
1. Let G2 voice regen finish (already running).
2. Bucket 1 (18 audio) + Bucket 2 (49 passage) + Bucket 5 housekeeping — one
   cheap, safe commit.
3. Bucket 3 (75 images) once you OK the credits — the highest kid-facing impact.
4. Refresh backup + backfill + commit; then merge the practice-runner branch.

### Re-verify anytime
`python3 scripts/audit-assets.py` (full) then
`python3 scripts/recheck-dead-assets.py` (polite recheck of flagged).
