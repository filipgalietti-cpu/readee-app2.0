-- 121: persist active carrot powerups on the child row.
--
-- Until now the mystery-box "2x carrots" reward lived only in localStorage
-- (practice-store) and was applied only in the Practice runner + Lesson
-- flow. That meant it didn't survive across devices/sessions and never
-- applied to Stories. Persisting it on `children` lets every carrot-award
-- surface read one source of truth.
--
-- Additive + safe: two nullable/defaulted columns, no RLS change (children
-- RLS already locked down in migrations 115/116).

alter table public.children
  add column if not exists active_multiplier numeric not null default 1,
  add column if not exists active_multiplier_expires_at timestamptz;

comment on column public.children.active_multiplier is
  'Active carrot multiplier from a powerup (e.g. mystery-box 2x). 1 = none. Only in effect until active_multiplier_expires_at.';
comment on column public.children.active_multiplier_expires_at is
  'When the active_multiplier powerup expires (UTC). Null = no active powerup.';
