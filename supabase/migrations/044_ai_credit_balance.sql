-- AI credit top-up balance.
--
-- When a user hits their monthly Readee.ai cap (teacher 500/mo, parent
-- 200/mo), they can purchase one-time credit packs via Stripe Checkout.
-- This table stores the purchased balance, which sits ALONGSIDE the
-- monthly entitlement (not instead of it):
--
--   effective_remaining = max(0, monthly_entitlement - monthly_used)
--                       + balance (top-up)
--
-- Each credit purchase creates a row. Balance is decremented by the
-- orchestrator when consumed *beyond* the monthly entitlement. Rows
-- older than 1 year auto-expire (set the `expires_at` column on insert).
-- For v1 we don't expire — kinder UX and our liability is small.
--
-- `pool` distinguishes teacher-surface credits (quiz wizard,
-- live quiz, classroom image gen) from parent-surface credits (Ask
-- Readee), so a teacher can't accidentally deplete their classroom
-- pool by sharing with their kid's parent account.

create table if not exists public.ai_credit_balance (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  pool text not null check (pool in ('teacher', 'parent')),
  balance integer not null check (balance >= 0),
  source text not null check (source in ('purchase', 'promo', 'referral', 'refund', 'adjustment')),

  -- Provenance of the balance row.
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  amount_paid_usd_cents integer,
  notes text,

  created_at timestamptz not null default now(),
  expires_at timestamptz,

  -- Idempotency guard on Stripe webhook retries.
  constraint ai_credit_balance_session_unique unique (stripe_checkout_session_id)
);

create index ai_credit_balance_profile_pool_idx
  on public.ai_credit_balance (profile_id, pool)
  where balance > 0;

alter table public.ai_credit_balance enable row level security;

-- Users can see their own balances. Cannot insert — that's webhook-only
-- via supabaseAdmin.
create policy "Users read their own credit balance"
  on public.ai_credit_balance for select to authenticated
  using (profile_id = auth.uid());
