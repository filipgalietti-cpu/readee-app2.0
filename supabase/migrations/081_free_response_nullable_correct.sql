-- Free-response questions don't have a predetermined correct answer
-- (the AI rubric grades the kid's text at submit time), so the
-- NOT NULL constraint on custom_questions.correct was blocking
-- inserts of the new kind.

alter table custom_questions alter column correct drop not null;
comment on column custom_questions.correct is
  'Answer key. Required for multiple_choice / true_false / fill_in_blank / matching_pairs. NULL for free_response, which is rubric-graded by AI at submit time.';
