-- Google Classroom OAuth connection per teacher. access_token and
-- refresh_token are stored server-side and never exposed to clients;
-- RLS restricts a teacher to reading only their own row. Tokens are
-- plain text in storage (encrypted-at-rest in Postgres) — we never
-- return them via the client SDK.

create table public.google_classroom_connections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  google_email text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz not null,
  scope text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.google_classroom_connections enable row level security;

create policy "Teachers see own GC connection metadata"
  on public.google_classroom_connections for select to authenticated
  using (profile_id = auth.uid());

create policy "Teachers delete own GC connection"
  on public.google_classroom_connections for delete to authenticated
  using (profile_id = auth.uid());
