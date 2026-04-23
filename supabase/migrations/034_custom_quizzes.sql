-- Teacher-authored custom quizzes and questions.
-- A custom_quiz belongs to a teacher (not a classroom) so teachers can
-- reuse the same quiz across multiple classes. custom_quiz_questions
-- is an ordered junction so teachers control the question order.

create table public.custom_quizzes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  grade_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.custom_questions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('multiple_choice', 'true_false', 'fill_in_blank')),
  prompt text not null,
  choices jsonb,
  correct jsonb not null,
  hint text,
  image_url text,
  audio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.custom_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.custom_quizzes(id) on delete cascade,
  question_id uuid not null references public.custom_questions(id) on delete cascade,
  position integer not null,
  created_at timestamptz not null default now(),
  constraint custom_quiz_questions_quiz_question_key unique (quiz_id, question_id)
);

create index custom_quizzes_teacher_idx on public.custom_quizzes (teacher_id);
create index custom_questions_teacher_idx on public.custom_questions (teacher_id);
create index custom_quiz_questions_quiz_idx on public.custom_quiz_questions (quiz_id, position);

alter table public.custom_quizzes enable row level security;
alter table public.custom_questions enable row level security;
alter table public.custom_quiz_questions enable row level security;

create policy "Teachers own custom_quizzes"
  on public.custom_quizzes for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Teachers own custom_questions"
  on public.custom_questions for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Teachers own custom_quiz_questions"
  on public.custom_quiz_questions for all to authenticated
  using (
    exists (
      select 1 from custom_quizzes q
      where q.id = custom_quiz_questions.quiz_id
        and q.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from custom_quizzes q
      where q.id = custom_quiz_questions.quiz_id
        and q.teacher_id = auth.uid()
    )
  );

create policy "Students read assigned custom_quizzes"
  on public.custom_quizzes for select to authenticated
  using (
    exists (
      select 1
      from assignments a
      join classroom_memberships cm on cm.classroom_id = a.classroom_id
      where a.kind = 'custom_quiz'
        and a.source_id = custom_quizzes.id::text
        and public.auth_owns_child(cm.child_id)
    )
  );

create policy "Students read assigned custom_quiz_questions"
  on public.custom_quiz_questions for select to authenticated
  using (
    exists (
      select 1
      from assignments a
      join classroom_memberships cm on cm.classroom_id = a.classroom_id
      where a.kind = 'custom_quiz'
        and a.source_id = custom_quiz_questions.quiz_id::text
        and public.auth_owns_child(cm.child_id)
    )
  );

create policy "Students read assigned custom_questions"
  on public.custom_questions for select to authenticated
  using (
    exists (
      select 1
      from custom_quiz_questions cqq
      join assignments a on a.kind = 'custom_quiz' and a.source_id = cqq.quiz_id::text
      join classroom_memberships cm on cm.classroom_id = a.classroom_id
      where cqq.question_id = custom_questions.id
        and public.auth_owns_child(cm.child_id)
    )
  );
