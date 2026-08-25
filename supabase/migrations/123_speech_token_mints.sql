-- 123: Azure speech usage counter.
--
-- Every Azure Pronunciation Assessment stream (Luna reads, word checks,
-- lesson Speak steps) begins by minting a token at /api/luna/speech-token —
-- the single choke point. One row per mint gives call counts per user/surface
-- so pricing decisions (session caps etc.) are made on DATA, not estimates.
-- Server-only writes (service role); no client access by design.

create table if not exists public.speech_token_mints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  context text not null default 'other',
  created_at timestamptz not null default now()
);

create index if not exists speech_token_mints_created_idx
  on public.speech_token_mints (created_at);
create index if not exists speech_token_mints_user_idx
  on public.speech_token_mints (user_id, created_at);

-- RLS: enabled with NO policies on purpose — this is an internal metering
-- table. Clients (anon/authenticated) get no access; the API route writes
-- via the service role, which bypasses RLS.
alter table public.speech_token_mints enable row level security;
revoke all on public.speech_token_mints from anon, authenticated;

comment on table public.speech_token_mints is
  'One row per Azure speech token mint (Luna + lesson Speak). Internal metering; service-role writes only.';
