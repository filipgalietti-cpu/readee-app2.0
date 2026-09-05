-- What the catalogue drew for a day, so the next draw can avoid it.
--
-- The old avoid-list reconstructed intent by reading passage titles and
-- openings back out of the text, which is why it could not tell that five
-- different animals were having one identical cave experience. Recording the
-- draw makes avoidance exact: bucket, subject and medium are what was chosen,
-- not what a later reader infers.
--
-- All nullable: every row written before this migration has none of them, and
-- the draw treats a missing value as "nothing to avoid".
alter table public.daily_questions
  add column if not exists bucket  text,
  add column if not exists subject text,
  add column if not exists medium  text;

create index if not exists daily_questions_date_desc_idx
  on public.daily_questions (date desc);
