-- 126: generic rate-limit ledger for the central limiter (lib/security/
-- rate-limit.ts). One row per attempt on an abuse-prone unauthenticated
-- endpoint (contact, newsletter, login-hint); the limiter counts rows in a
-- short window per (bucket, key). Works across serverless instances, unlike
-- in-memory. Service-role writes only; RLS deny-all.

create table if not exists public.rate_limit_hits (
  id bigserial primary key,
  bucket text not null,
  key text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_limit_hits_lookup_idx
  on public.rate_limit_hits (bucket, key, created_at);

alter table public.rate_limit_hits enable row level security;
revoke all on public.rate_limit_hits from anon, authenticated;

comment on table public.rate_limit_hits is
  'Attempt ledger for lib/security/rate-limit.ts. Service-role writes only; RLS deny-all. Prune rows older than ~1 day periodically.';
