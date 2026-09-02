-- Placement results: one row per completed reading placement. Holds the
-- decision, the evidence, the exam moments, the curated plan and the parent
-- narration (with private-bucket audio paths). Written only by the service
-- role from /api/placement/complete; parents read their own children's rows.
create table if not exists public.placements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  enrolled text not null,
  decision jsonb not null,
  evidence jsonb not null,
  moments jsonb not null default '[]'::jsonb,
  plan jsonb not null,
  narration jsonb not null default '[]'::jsonb,
  passage_recording_path text,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists placements_child_created_idx on public.placements (child_id, created_at desc);

alter table public.placements enable row level security;

-- Parents can read their own children's placements. No client inserts or
-- updates: the complete route writes with the service role (same rule as
-- assessments today, tightened).
drop policy if exists "Parents can view own children placements" on public.placements;
create policy "Parents can view own children placements"
  on public.placements for select
  using (child_id in (select id from public.children where parent_id = auth.uid()));
