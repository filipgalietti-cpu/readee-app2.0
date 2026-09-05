-- V2 journey progress: one row per completed warm-up / lesson / questions /
-- exam / graduation exam on the roadmap spine. Every attempt is kept (an exam
-- can be retaken); the journey reads the best one.
--
-- Writes go through /api/journey/complete with the service role after an
-- ownership check (same rule as placements). Parents can read their own
-- children's rows. RLS is enabled WITH its policy in the same migration.

create table if not exists public.journey_v2_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  item_type text not null check (item_type in ('warmup', 'lesson', 'quiz', 'exam', 'final')),
  item_id text not null,
  unit_id text not null,
  score integer check (score is null or (score >= 0 and score <= 100)),
  passed boolean not null default true,
  completed_at timestamptz not null default now()
);

create index if not exists journey_v2_progress_child_idx on public.journey_v2_progress (child_id, completed_at desc);
create index if not exists journey_v2_progress_item_idx on public.journey_v2_progress (child_id, item_type, item_id);

alter table public.journey_v2_progress enable row level security;

drop policy if exists "Parents can view own children journey progress" on public.journey_v2_progress;
create policy "Parents can view own children journey progress"
  on public.journey_v2_progress for select
  using (child_id in (select id from public.children where parent_id = (select auth.uid())));
