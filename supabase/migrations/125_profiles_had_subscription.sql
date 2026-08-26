-- Reverse-trial + win-back: track whether an account has ever held a paid
-- subscription, so a later cancel is recognized as "lapsed" (win-back messaging)
-- rather than a never-paid free user. Set by the Stripe webhook on subscribe;
-- backfilled for existing subscribers.
alter table public.profiles
  add column if not exists had_subscription boolean not null default false;

comment on column public.profiles.had_subscription is
  'True once the account has ever started a paid subscription (or trial checkout). Drives win-back (lapsed) vs never-paid free messaging.';

update public.profiles
set had_subscription = true
where (plan in ('premium','teacher_solo') or stripe_subscription_id is not null)
  and had_subscription = false;
