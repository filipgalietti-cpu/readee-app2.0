# Punch list — Apr 27 2026

_Concrete things that are actually broken or missing. Replaces the
earlier checklists. Stop adding "nice to have." If something below is
wrong or missing, edit this file._

## What's already done (today)

- ✅ AI QC engine + admin dashboard (`/admin/qc`)
- ✅ Daily question of the day system (cron + widgets + `/today` SEO)
- ✅ Image gen 404 fix (`gemini-2.5-flash-image` GA)
- ✅ Image brief two-step
- ✅ Audio CSP fix (Supabase media-src)
- ✅ Hint audio removed from runtime (text popups only)
- ✅ Per-question regenerate button
- ✅ Reports drill-down + Live quiz hub
- ✅ Inline assign-to-class flow
- ✅ Pivot QC source of truth → per-grade files

## 🔴 Content issues to fix

### 1. Hints that give away the answer
Per-grade files only. Run audit, judge each hint vs its question +
grade, rewrite the failures, apply, done. Don't touch hint audio.

```
GEMINI_API_KEY=... node scripts/audit-hints.js --rewrite
# review scripts/hint-audit.csv with Jennifer
node scripts/apply-hint-rewrites.js
```

Expected: ~15 min, ~$1-2.

### 2. RF.1.1a-Q3 duplicate ✅
Already fixed in commit 61f18e1.

## 🟡 Reliability gaps

### 3. Daily question must not show a failed row
If QC marks today's daily as `fail`, the widget still shows it.
Update the widget query to skip `qc_overall = 'fail'` so the kid view
silently falls back to yesterday's last good day.

- `app/_components/DailyQuestionCard.tsx` — add filter
- `app/today/page.tsx` — same filter on the `/today` index redirect

### 4. Daily question cron has never actually run
Operator action, not code:
- Set `DAILY_QUESTION_TEACHER_ID` in Vercel
- Confirm `CRON_SECRET` in Vercel
- Manually trigger once: `curl -H "Authorization: Bearer $CRON_SECRET" "https://learn.readee.app/api/cron/daily-question?force=1"`
- Verify `/today` and the widgets show it

### 5. Voice samples in prod — never retested after the CSP fix
Open the wizard in prod, click each voice's play button, confirm
audio plays. If broken, the new error UI will tell us the cause.

### 6. Hint-audio paths in per-grade files are now stale
The data files still have `hint_audio_url` fields pointing at audio
that's never played. Cosmetic, but a future engineer will be
confused. **Decision:** leave them. Removing creates a big diff
across 5 files for zero user impact.

## 🟡 UI / UX rough edges

### 7. Wizard self-test (Filip runs this)
Walk through `docs/WIZARD_SCENARIOS.md` in incognito on prod. 9
scenarios, ~30 min. Note every deviation. Decides whether the
wizard is "real teacher ready."

### 8. Account page on every account shape
- Pure parent (no classroom)
- Pure teacher (no children)
- Hybrid (both)

5 minutes on each. Confirms the capability gating actually works.

### 9. Force-regenerate button on `/admin/qc`
~30-line UI: date picker + button that hits the cron endpoint with
`?force=1&date=YYYY-MM-DD`. Lets Jennifer fix a bad daily before
parents see it. **Defer until needed** — only matters if a daily
actually goes out broken.

## 🟢 Marketing surface (separate sprint, not today)

### 10. `readee.app` landing page rebuild
Hero copy is still old positioning. Needs district-admin frame:
"K-4 reading specialist + AI", Jennifer credentials above fold,
60-second wizard demo embed, two CTAs (Try free / Book demo).

### 11. SEO sweep — OG cards, sitemap, /standards/* meta descriptions

## ❌ NOT today (deferred)

- Stripe live env vars + webhook to prod (no revenue push until
  everything above is green)
- Real teacher E2E walkthrough (waits on #7 first)
- Simple Lesson wizard (after launch)
- B2C content factory script (after launch)

---

## Order to actually do this

1. Now: kick off hint audit in background (cheap, ~15 min).
2. While that runs: fix #3 daily-question fallback (10 min code change).
3. When hint audit finishes: review CSV with Jennifer, apply approved rewrites.
4. End of day: operator items #4, #5, #7, #8.
5. Tomorrow: marketing items.

That's it. No new features until this is empty.
