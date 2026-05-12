-- Marketing-site newsletter capture.
--
-- The EmailCapture form on readee.app posts here for parents who
-- aren't ready to sign up but want the free daily reading by email.
-- Lower-commitment than the 7-day trial — captures intent we'd
-- otherwise lose forever when they bounce.
--
-- One row per email. Re-submitting the same address is a no-op (we
-- bump updated_at and that's it). The `source` column lets us see
-- where the capture happened — "marketing-site-footer", "homepage-
-- cta", etc. — so we can A/B copy placement later.
--
-- Unsubscribe is a soft delete (unsubscribed_at) so we don't lose
-- the audit trail or accidentally re-subscribe people who asked
-- to leave.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

create index if not exists newsletter_subscribers_active_idx
  on public.newsletter_subscribers (created_at desc)
  where unsubscribed_at is null;

alter table public.newsletter_subscribers enable row level security;

-- Only the service role (server-side API routes) reads/writes this
-- table. No public select — emails are PII.
create policy newsletter_subscribers_service_only
  on public.newsletter_subscribers for all
  to service_role
  using (true)
  with check (true);

create or replace function public.tg_newsletter_subscribers_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger newsletter_subscribers_updated_at
  before update on public.newsletter_subscribers
  for each row execute function public.tg_newsletter_subscribers_updated_at();
