-- Per-child completion of a Daily Readee, so the /daily archive can mark a
-- day "read" (green outline). Keyed by (child, daily date) — one per daily.
create table if not exists public.daily_reads (
  child_id uuid not null references public.children(id) on delete cascade,
  daily_date date not null,
  completed_at timestamptz not null default now(),
  primary key (child_id, daily_date)
);

alter table public.daily_reads enable row level security;

-- A parent may read completion for their own children (the archive reads this
-- via the user client). Writes go through the API with the service role.
drop policy if exists daily_reads_select on public.daily_reads;
create policy daily_reads_select on public.daily_reads for select
  using (exists (
    select 1 from public.children c
    where c.id = daily_reads.child_id and c.parent_id = auth.uid()
  ));
