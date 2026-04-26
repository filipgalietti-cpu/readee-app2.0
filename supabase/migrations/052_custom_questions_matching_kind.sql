-- Allow `matching_pairs` as a custom_questions.kind value.
--
-- Previously matching pairs were forced into multiple_choice via
-- pairsToMCQs because there was no UI for the matching gameplay.
-- Now the wizard generates real matching questions; data model:
--   kind = 'matching_pairs'
--   choices = the LEFT column items (string[])
--   correct = jsonb { pairs: [{left, right}, ...] }  (also serves as
--             the answer key — student's connections are checked
--             pair-by-pair against this).

alter table public.custom_questions
  drop constraint if exists custom_questions_kind_check;

alter table public.custom_questions
  add constraint custom_questions_kind_check
  check (kind in ('multiple_choice', 'true_false', 'fill_in_blank', 'matching_pairs'));
