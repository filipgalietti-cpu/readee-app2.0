-- Add payload jsonb to questions_db. Many K-4 question types
-- (sentence_build, sound_machine, tap_to_pair, missing_word,
-- category_sort, space_insertion, etc.) have type-specific fields
-- the indexed columns don't capture. Store the full original
-- question JSON in payload so the DB→JSON sync can round-trip
-- without data loss.
--
-- The indexed columns stay for cheap queries (find all
-- type=multiple_choice questions, etc); payload is the canonical
-- content the renderer cares about.

alter table public.questions_db
  add column if not exists payload jsonb;
