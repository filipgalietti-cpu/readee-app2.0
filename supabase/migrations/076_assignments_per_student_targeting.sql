-- Adds per-student targeting to assignments. When assigned_child_ids
-- is NULL or empty, the assignment is whole-class (existing behavior).
-- When populated, only the listed child IDs see it on the student
-- dashboard.
--
-- GIN index so the @> / && containment lookups (used by the student
-- fetcher) stay fast at scale.

alter table assignments
  add column if not exists assigned_child_ids uuid[];

comment on column assignments.assigned_child_ids is
  'When NULL or empty, the assignment is visible to every student in the classroom. When populated, only the listed child IDs see it.';

create index if not exists assignments_assigned_child_ids_idx
  on assignments using gin (assigned_child_ids);
