-- Adds save & resume support to assignment_submissions. The
-- progress_state column holds the in-flight runner snapshot
-- (current question index, answers so far, running correct count).
-- Cleared on completion.

alter table assignment_submissions
  add column if not exists progress_state jsonb;

comment on column assignment_submissions.progress_state is
  'Save & resume snapshot for in-progress quizzes/lessons. Cleared on completion. Shape: { idx: number, answers: any[], correct: number, updatedAt: string }.';
