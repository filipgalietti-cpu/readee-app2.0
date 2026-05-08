-- Preserve original JSON array ordering across questions, standards,
-- and lessons so the DB→JSON sync round-trip is byte-stable.
--
-- Without this, the sync produces churn on every run because
-- Postgres ordering doesn't match curriculum ordering. With it,
-- the JSON only changes when the content actually changes.

alter table public.questions_db
  add column if not exists ordinal integer;
alter table public.ccss_standards
  add column if not exists ordinal integer;
alter table public.lessons_db
  add column if not exists ordinal integer;

create index if not exists questions_db_ordinal_idx
  on public.questions_db (grade, ordinal);
create index if not exists ccss_standards_ordinal_idx
  on public.ccss_standards (grade, ordinal);
create index if not exists lessons_db_ordinal_idx
  on public.lessons_db (grade, ordinal);
