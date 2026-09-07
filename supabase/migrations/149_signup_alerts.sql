-- Net-new signup alerts: one row per profile we have told the team about.
--
-- Filip asked to be notified when someone creates a Readee account. The obvious
-- shape is "email every profile created since the last run", keyed off a
-- timestamp watermark - but a watermark loses rows created *during* the query
-- window, and double-sends whenever a run fails after emailing. A row per
-- profile makes the send idempotent by construction: the insert either wins or
-- it does not, so a given account can be announced exactly once no matter how
-- often the cron fires or how it fails.
--
-- Mirrors `lifecycle_email_sends`: RLS on with NO policies, so only the service
-- role reaches it. Nothing client-side ever reads or writes this table, and a
-- policy that let a signed-in user see it would leak the existence of other
-- accounts. (The house rule is never to enable RLS without policies in the same
-- migration; the point of that rule is not locking out legitimate access, and
-- here there is none to lock out.)
create table if not exists public.signup_alerts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  sent_at    timestamptz not null default now(),
  -- 'sent' | 'backfill'. Backfilled rows are accounts that existed before this
  -- feature shipped: recorded as already-announced so the first cron run does
  -- not email Filip about every account he already has.
  reason     text not null default 'sent'
);

alter table public.signup_alerts enable row level security;

-- The cron scans for profiles with no alert row, so the lookup is by absence.
create index if not exists signup_alerts_sent_at_idx
  on public.signup_alerts (sent_at desc);

-- ‼️ Backfill BEFORE the cron is ever scheduled. Without this, the first run
-- treats every existing account as brand new. The lib also refuses to announce
-- anything older than SIGNUP_ALERT_MAX_AGE_DAYS as a second line of defence,
-- but that belt only works if this brace is fastened first.
insert into public.signup_alerts (profile_id, reason)
select id, 'backfill' from public.profiles
on conflict (profile_id) do nothing;
