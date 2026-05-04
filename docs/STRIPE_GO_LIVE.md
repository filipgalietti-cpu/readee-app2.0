# Stripe go-live — 30-min checklist

Stripe is fully wired in code (since `4b222e0`, Mar 2026). The webhook
flips `profiles.plan`, checkout supports 7-day trials, the customer
portal lets users cancel. Test-mode keys are in `.env.local` today.

To accept real charges, run this checklist. ~30 min including
the test purchase.

## 1. Create live products in Stripe (10 min)

Stripe dashboard → switch to **Live mode** (top-right toggle).
Products → New:

| Product | SKU | Recurring | Price |
|---|---|---|---|
| Readee+ | `readee_plus_monthly` | $9.99 / month | save the price ID |
| Readee+ | `readee_plus_annual` | $79.99 / year | save the price ID |
| Teacher Solo | `teacher_solo_monthly` | $19.00 / month | save the price ID |
| Teacher Solo | `teacher_solo_annual` | $180.00 / year | save the price ID |

If you also want credit packs (one-time), create those under
"One-time" not "Recurring":

| Product | Price | metadata |
|---|---|---|
| 250 AI credits | $5.00 | `kind=ai_credit_pack` `credits=250` `pool=teacher` |
| 500 AI credits | $8.00 | same shape, `credits=500` |

Save the live price IDs (start with `price_1...`).

## 2. Configure the live webhook (5 min)

Stripe dashboard → Developers → Webhooks → **Add endpoint**:

- **URL:** `https://learn.readee.app/api/webhooks/stripe`
- **Events to send:**
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `checkout.session.completed`
- After creating, click into it and copy the **Signing secret**
  (`whsec_*`). You'll need this in Vercel.

## 3. Update Vercel env vars (5 min)

In Vercel → readee-app2-0 → Settings → Environment Variables:

Replace the test-mode keys with live-mode equivalents (Production
environment only; keep test keys in Preview):

```
STRIPE_SECRET_KEY              sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  pk_live_...
STRIPE_WEBHOOK_SECRET          whsec_... (the live one from step 2)
STRIPE_PRICE_MONTHLY           price_... (live monthly Readee+)
STRIPE_PRICE_ANNUAL            price_... (live annual Readee+)
STRIPE_PRICE_TEACHER_SOLO_MONTHLY  price_...
STRIPE_PRICE_TEACHER_SOLO_ANNUAL   price_...
STRIPE_PRICE_CREDITS_250       price_... (only if shipping credit packs)
STRIPE_PRICE_CREDITS_500       price_...
```

Redeploy after the env update so the new keys take effect.

## 4. Run the ship-readiness check (10 min)

End-to-end happy path:

1. Sign up as a brand-new parent (incognito, throwaway email)
2. Skip placement test, hit `/upgrade`
3. Click monthly Readee+ → Stripe checkout opens with $9.99/mo + 7-day trial
4. Pay with the card `4242 4242 4242 4242` exp `12/34` cvc `123` —
   wait, don't. That's the TEST card. Use a real card. Stripe
   will charge $0.00 because of the trial; just confirm the
   subscription is created.
5. Verify redirect lands on `/dashboard?checkout=success`
6. Verify the green success banner shows
7. Verify in Supabase: `select plan, stripe_customer_id from profiles where email='your-throwaway'` → `plan='premium'`
8. Hit `/billing` → "Manage subscription" → Stripe portal opens
9. Cancel from the portal → confirm webhook fires → `plan='free'` in DB

## 5. Edge cases to verify

- [ ] Promo code field accepts a working code (create one in Stripe
      dashboard → Coupons; e.g. `LAUNCH50` for 50% off first month)
- [ ] Webhook fails gracefully on signature mismatch (`sig` header
      missing returns 400, not 500)
- [ ] Trial conversion: after 7 days, Stripe auto-charges; webhook
      keeps `plan='premium'`
- [ ] Failed payment: Stripe retries; on final failure, subscription
      goes to past_due → eventually deleted → webhook flips to free

## 6. Smoke test in production

After the live flip, run one more end-to-end: sign up another
throwaway, do the trial, then **cancel before the trial ends**.
Confirm zero charge. That's your safety net for early customers
who don't want to commit.

## Done

You can now accept real revenue. The funnel is no longer theater.
