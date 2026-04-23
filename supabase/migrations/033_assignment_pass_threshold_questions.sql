-- Fleshed-out assignment: teacher can set a pass threshold (0-100)
-- and pick a specific subset of question IDs to include. Null =
-- default behavior (no threshold, all questions in the standard).

alter table public.assignments
  add column pass_threshold integer
    check (pass_threshold is null or (pass_threshold >= 0 and pass_threshold <= 100)),
  add column question_ids jsonb;
