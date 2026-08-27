-- Curate the leaderboard: hide dev/test/non-genuine accounts without deleting
-- real data. Default false (everyone shows); set true to drop a child off the
-- board. The leaderboard API filters on this.
alter table public.children
  add column if not exists exclude_from_leaderboard boolean not null default false;
