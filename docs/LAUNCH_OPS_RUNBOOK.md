# Launch ops runbook

Three operator-only P0s from `DAILY_CHECKLIST.md`. Do them in this
order, copy-paste exactly, no reading between the lines. After each
section there's a verification step — don't skip it.

---

## 1. Stripe SKUs (Teacher Solo + credit packs)

### What the code expects (env var contract)

| Env var | Stripe object | What it represents | Pricing |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | API key | Secret key from Stripe → Developers → API keys | — |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Set after creating the webhook endpoint (step 1.4) | — |
| `STRIPE_PRICE_MONTHLY` | Price ID | Readee+ monthly | $9.99/mo |
| `STRIPE_PRICE_ANNUAL` | Price ID | Readee+ annual | $83.88/yr ($6.99/mo) |
| `STRIPE_PRICE_TEACHER_SOLO_MONTHLY` | Price ID | Teacher Solo monthly | $19.00/mo |
| `STRIPE_PRICE_TEACHER_SOLO_ANNUAL` | Price ID | Teacher Solo annual | $180.00/yr |
| `STRIPE_PRICE_CREDITS_250` | Price ID | One-time credit top-up | $5.00 (250 credits) |
| `STRIPE_PRICE_CREDITS_500` | Price ID | One-time credit top-up | $8.00 (500 credits) |

### 1.1 Create the products

Stripe dashboard → **Product catalog → Add product**. Repeat for
each row below. For the two subscriptions, set "Recurring"; for
credit packs, set "One-time".

| Product name | Description | Prices to create |
|---|---|---|
| Readee+ | Reading practice for families | Monthly $9.99, Annual $83.88 |
| Teacher Solo | Individual-teacher AI tools | Monthly $19.00, Annual $180.00 |
| Readee AI credits, 250 | Top-up | One-time $5.00 |
| Readee AI credits, 500 | Top-up | One-time $8.00 |

For each price, copy the resulting `price_...` ID — you'll paste
those into Vercel.

### 1.2 Configure the webhook

Stripe → **Developers → Webhooks → Add endpoint**:
- Endpoint URL: `https://learn.readee.app/api/webhooks/stripe`
- Listen to events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `checkout.session.completed`
- After creating, click "Reveal signing secret" → copy that string.
  That's `STRIPE_WEBHOOK_SECRET`.

### 1.3 Paste into Vercel

Vercel → readee-app2.0 → **Settings → Environment Variables**.
Add each one for **Production** (and Preview if you want previews
to work too):

```
STRIPE_SECRET_KEY = sk_live_...
STRIPE_WEBHOOK_SECRET = whsec_...
STRIPE_PRICE_MONTHLY = price_...
STRIPE_PRICE_ANNUAL = price_...
STRIPE_PRICE_TEACHER_SOLO_MONTHLY = price_...
STRIPE_PRICE_TEACHER_SOLO_ANNUAL = price_...
STRIPE_PRICE_CREDITS_250 = price_...
STRIPE_PRICE_CREDITS_500 = price_...
```

Redeploy after adding (Vercel → Deployments → … → Redeploy).

### 1.4 Verify

1. Open `https://learn.readee.app/upgrade` in a private window,
   click "Subscribe". You should get redirected to Stripe Checkout.
2. Use a Stripe test card (or pay $1 with a real card if you're on
   live mode and want to confirm end-to-end).
3. After checkout, query Supabase:
   ```sql
   select id, email, plan, stripe_customer_id, stripe_subscription_id
   from profiles where email = 'YOUR_TEST_EMAIL';
   ```
   `plan` should now be `premium` (or `teacher_solo` if you bought
   that SKU). If it's still `free`, the webhook didn't fire — check
   Stripe → Developers → Webhooks → your endpoint → recent attempts.

---

## 2. CRON_SECRET in Vercel

A fresh secret was generated for this runbook:

```
CRON_SECRET = 27e707c6bb291c2f0b8c97d728924e61c5392d42e9b7220d3982f6221c624057
```

(If you want a different value, run `openssl rand -hex 32` locally.)

### 2.1 Paste into Vercel

Vercel → Settings → Environment Variables → Production:

```
CRON_SECRET = 27e707c6bb291c2f0b8c97d728924e61c5392d42e9b7220d3982f6221c624057
```

### 2.2 Configure Vercel Cron auth

`vercel.json` already declares the cron schedules
(`/api/cron/parent-digest` Mondays 13:00 UTC,
`/api/cron/daily-question` daily 09:00 UTC). Vercel Cron sends a
`Authorization: Bearer ${CRON_SECRET}` header automatically when
the env var is named `CRON_SECRET` — nothing else to wire.

### 2.3 Verify

Trigger the daily-question route manually with curl:

```bash
curl -X POST https://learn.readee.app/api/cron/daily-question \
  -H "Authorization: Bearer 27e707c6bb291c2f0b8c97d728924e61c5392d42e9b7220d3982f6221c624057"
```

- `401` → secret didn't take, redeploy and retry.
- `500 "DAILY_QUESTION_TEACHER_ID env var is required"` → CRON_SECRET
  is fine, you're now blocked on section 3 below.
- `200 {"ok":true,...}` → both env vars are set, daily question is live.

For parent-digest the same pattern works against
`/api/cron/parent-digest` (POST or GET).

---

## 3. DAILY_QUESTION_TEACHER_ID in Vercel

This is the Supabase `profiles.id` of the teacher account that
"owns" the system-generated daily question. The cron bills against
that profile so the existing rate-limit + log infra has someone to
charge. Should be your platform-admin teacher account.

### 3.1 Find the right profile id

Run this in Supabase SQL editor (project: readee, prod):

```sql
select id, email, role, plan
from profiles
where email = 'filip.galietti@readee.app';
```

If that account doesn't exist yet, sign up at
`https://learn.readee.app` with that email (teacher role), then re-run
the query. The `id` column is what you need (a UUID).

### 3.2 Paste into Vercel

```
DAILY_QUESTION_TEACHER_ID = <the UUID from step 3.1>
```

### 3.3 Verify

Re-run the curl from section 2.3. You should get
`200 {"ok":true,"date":"2026-04-29",...}`. Then visit
`https://learn.readee.app/today` — the daily question should render.

If you get `{"ok":false,"error":"..."}`, the cron ran but the
build failed. Check `lib/daily/build-daily.ts` to see which step
threw (passage, image, TTS, or QC).

---

## After all three are done

- [ ] Smoke-test signup → checkout → premium gate clears.
- [ ] Smoke-test buying a 250 credit pack → balance increments.
- [ ] Force-fire daily-question cron → `/today` shows today's question.
- [ ] Tick the matching boxes in `docs/DAILY_CHECKLIST.md`.

If any of the smoke tests fail, file the failing step here so the
runbook stays current for the next operator pass.
