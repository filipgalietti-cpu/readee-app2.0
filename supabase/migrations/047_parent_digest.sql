-- Parent weekly digest preferences + delivery log.
--
-- Every parent with at least one child is auto-opted in to the Monday
-- 8am ET weekly digest. Preference stored on profiles; one-click
-- unsubscribe via a signed token in the email footer.
--
-- Delivery log is small (one row per parent per week) so we can
-- dedupe if the cron fires twice and debug "did Jennifer get last
-- Monday's email?" questions.

alter table public.profiles
  add column if not exists email_weekly_digest boolean not null default true;

create table if not exists public.parent_digest_sends (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  sent_at timestamptz not null default now(),
  week_start date not null,
  children_count integer not null default 0,
  error text,
  constraint parent_digest_sends_week_unique unique (parent_id, week_start)
);

create index parent_digest_sends_parent_idx on public.parent_digest_sends (parent_id, week_start desc);

alter table public.parent_digest_sends enable row level security;

create policy "Parent sees their own digest sends"
  on public.parent_digest_sends for select to authenticated
  using (parent_id = auth.uid());
