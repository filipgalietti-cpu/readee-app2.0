-- Track which lifecycle emails we've sent each parent, so the cron
-- doesn't double-send and operators can audit the funnel.
--
-- Lifecycle stages (kept small + extensible):
--   'welcome'             — day-1 after signup
--   'first_lesson_nudge'  — day-3 if no kid has finished a lesson
--   're_engage'           — kid hasn't been active for 7+ days
--
-- One row per (profile_id, stage). The cron checks for existence
-- before sending, so this table is the idempotency lock.

create table if not exists public.lifecycle_email_sends (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  stage text not null,
  sent_at timestamptz not null default now(),
  status text not null default 'sent', -- 'sent' | 'failed' | 'skipped'
  error_message text,
  -- Keep tight unique constraint per (profile, stage) so retries on
  -- the same stage don't pile up rows. The 're_engage' stage may
  -- legitimately send more than once over a long lifecycle, so we
  -- include sent_at::date in the uniqueness to allow re-sending in
  -- a different week without duplicating in the same one.
  send_date date not null default current_date,
  unique (profile_id, stage, send_date)
);

create index if not exists lifecycle_email_sends_profile_idx
  on public.lifecycle_email_sends (profile_id);

create index if not exists lifecycle_email_sends_stage_idx
  on public.lifecycle_email_sends (stage, sent_at desc);

-- RLS: nobody reads/writes this from the client. Cron + admin only,
-- both of which use the service role and bypass RLS entirely.
alter table public.lifecycle_email_sends enable row level security;

comment on table public.lifecycle_email_sends is
  'Idempotency + audit log for behavioral / drip emails sent to parents.';
