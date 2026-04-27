# Today — Apr 27 2026

_Validation day. Stop building. Touch every feature shipped this week
in production once before adding anything new._

## 🔴 Must-do (blockers)

### 1. Daily question cron — make sure it actually runs
The cron has never fired in prod. If we don't validate before tomorrow
5am ET, we wake up to either no daily question or a broken one and a
banner with no content.

- [ ] Set `DAILY_QUESTION_TEACHER_ID` in Vercel production env
      (Filip's profile id: `aa7b7ef9-ad2a-4944-a018-a3b7844fb2f0`)
- [ ] Confirm `CRON_SECRET` is set in Vercel production
- [ ] Trigger today's daily question manually:
      `curl -H "Authorization: Bearer $CRON_SECRET" "https://learn.readee.app/api/cron/daily-question?force=1"`
- [ ] Verify response is `{ok: true, qcOverall: ...}`
- [ ] Open `/today` (signed-out browser) — should redirect to today's slug, render passage + image + audio + question
- [ ] Open `/dashboard` as a parent — Today's Readee card visible above teacher assignments
- [ ] Open `/classroom` as a teacher — Today's Readee card visible above classrooms grid
- [ ] Click thumbs up — DB row's `thumbs_up` increments

### 2. Stripe live env vars + redeploy
Still pending from last week's doc. Live products exist in Stripe; the
webhook stays inert until production env vars are set.

- [ ] Vercel prod: `STRIPE_PRICE_TEACHER_SOLO_MONTHLY`
- [ ] Vercel prod: `STRIPE_PRICE_TEACHER_SOLO_ANNUAL`
- [ ] Vercel prod: `STRIPE_PRICE_CREDITS_250`
- [ ] Vercel prod: `STRIPE_PRICE_CREDITS_500`
- [ ] Redeploy
- [ ] Smoke test: `/upgrade` shows two cards, Teacher Solo opens real Stripe Checkout

### 3. Stripe webhook is pointed at prod
- [ ] Stripe Dashboard → Developers → Webhooks → confirm endpoint is
      `https://learn.readee.app/api/stripe/webhook`
- [ ] Confirm signing secret matches `STRIPE_WEBHOOK_SECRET` env var
- [ ] Send a test event from the Stripe UI, watch Vercel logs

## 🟡 Should-do (validation)

### 4. QC backfill — pull the prioritized fix list
The full manifest sweep ran overnight (might still be running — check
`/tmp/qc-manifest-resume.log` for progress).

- [ ] When complete, open `scripts/master_manifest.json.qc.csv`
- [ ] Filter for severity=fail in column 3 — that's the Jennifer queue
- [ ] First pattern to address: **K hints that give away the answer**
      (this is ~half the FAILs from the partial run)
- [ ] Second pattern: **correct answer not in choices verbatim** —
      this is a real bug in 6 questions (run the same audit on those
      to verify it's not a serialization issue)
- [ ] WARNs that are reading-level — likely Flesch-Kincaid bands are
      too tight for the manifest's actual content. Recalibrate or
      lower-severity these (deterministic check, not AI-judged)

### 5. Walk Jennifer through `/admin/qc`
The dashboard exists; she's never seen it. Do this with her on Zoom
so we get reactions in real time.

- [ ] Open `/admin/qc` — show her the queue, the filter chips, the stat cards
- [ ] Click into one report (use any of yesterday's failed builds)
- [ ] Walk through the per-content-type sections (passage / questions / image)
- [ ] Mark one report reviewed with an audit note
- [ ] Confirm she understands the workflow ("AI catches obvious junk; you sign off on the gray zone")

### 6. Walk a teacher through the wizard end-to-end
At least one real teacher (not Jennifer) needs to do a full
build-with-ai → preview → assign → student finishes → completion shows
flow. Catch friction we can't see ourselves.

- [ ] Recruit a teacher (Jennifer's network or someone in the pilot list)
- [ ] Have them build a quiz from scratch with the wizard
- [ ] Watch what they do at each step — note any confusion silently
- [ ] Have them assign it to a real student
- [ ] Have the student complete it
- [ ] Verify completion shows on parent dashboard + teacher classroom

## 🟢 Nice-to-have

### 7. Admin force-regenerate button on `/admin/qc`
One button + date picker that hits the cron route with `?force=1&date=...`
Lets Jennifer fix a bad daily before parents see it. ~30 lines, half
an hour.

### 8. Make qc-content.js incremental
Currently it re-runs all 896 items even if half were already audited.
Skip items where the CSV already has a row for the id. Saves API spend
on re-runs.

### 9. Recalibrate Flesch-Kincaid bands per grade
Backfill flagged 336 reading-level WARNs out of 450 questions — that's
a sign the bands I picked are too tight for K-2 content (one-syllable
words inflate the FK score in weird ways). Look at the actual FK
distribution per grade and widen the bands so the WARN signal is
useful rather than noise.

## What we're NOT doing today

- Simple Lesson wizard (next session)
- B2C content factory (post-validation)
- Any new feature that doesn't have a pending validation gate above

---

_The risk to a multi-billion outcome isn't shipping less — it's shipping
unverified features to a district that pays for trust. Today is the day
the moat actually gets validated end-to-end._
