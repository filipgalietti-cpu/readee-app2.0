-- Per-question teacher feedback on Readee.ai-generated MCQs.
-- One row per (teacher, question). Approve = thumbs-up, reject = thumbs-down
-- with a reason that drives a regenerate. Used as QC training signal.

create table public.question_feedback (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.custom_questions(id) on delete cascade,
  verdict text not null check (verdict in ('approved','rejected')),
  reason text,
  -- Snapshot of the question text at the moment of feedback so we can
  -- audit later even after the question is regenerated.
  prompt_snapshot text,
  -- If we regenerated as a result of this feedback, link the new
  -- question so we can build a feedback chain.
  replacement_question_id uuid references public.custom_questions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (teacher_id, question_id)
);

create index question_feedback_teacher_idx
  on public.question_feedback (teacher_id, created_at desc);

create index question_feedback_question_idx
  on public.question_feedback (question_id);

alter table public.question_feedback enable row level security;

create policy "Teachers manage their own question feedback"
  on public.question_feedback for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Admins read all question feedback"
  on public.question_feedback for select to authenticated
  using (exists (select 1 from public.admin_memberships am where am.profile_id = auth.uid()));
