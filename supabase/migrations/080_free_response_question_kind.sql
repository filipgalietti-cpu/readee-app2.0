-- Add 'free_response' to custom_questions.kind so the authoring
-- wizard + custom quizzes can include AI-graded writing prompts.
-- Drives the Writing Coach question type, kid types a response,
-- AI rubric-scores it, teacher sees the graded result, parent sees
-- the trend in the dashboard.

alter table custom_questions drop constraint if exists custom_questions_kind_check;
alter table custom_questions add constraint custom_questions_kind_check
  check (kind = any (array[
    'multiple_choice'::text,
    'true_false'::text,
    'fill_in_blank'::text,
    'matching_pairs'::text,
    'free_response'::text
  ]));

-- Per-question scoring detail for kinds that need richer-than-bool
-- feedback. Free-response writing scores live here; future things
-- like long-answer rubrics will too. Shape (per question id):
--   { rubric: {ideas, organization, voice, conventions},
--     overallBand: string, strength: string, growthTip: string,
--     finalText: string, revisions: number }
alter table assignment_submissions
  add column if not exists question_scores jsonb;
comment on column assignment_submissions.question_scores is
  'Per-question scoring detail for kinds that need richer-than-bool feedback (free_response writing rubric, etc). Shape: { [questionId]: { rubric: {ideas,organization,voice,conventions}, strength, growthTip, finalText, revisions } }.';
