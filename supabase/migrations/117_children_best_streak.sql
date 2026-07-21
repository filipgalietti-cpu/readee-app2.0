-- Track the child's longest day-streak ever (for the analytics "Best: N days"
-- tile). Backfill so best is at least the current streak.
alter table public.children
  add column if not exists best_streak integer not null default 0;

update public.children set best_streak = greatest(best_streak, streak_days) where streak_days > best_streak;

comment on column public.children.best_streak is
  'Longest day-streak the child has ever reached (max of streak_days over time).';
