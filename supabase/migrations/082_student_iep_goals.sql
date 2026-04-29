-- Persistent IEP / 504 annual goals per student. Replaces the
-- copy-paste-each-time workflow in /classroom/tools/iep-note. A goal
-- lives on the kid record so progress notes, intervention plans, and
-- audit trails all reference the same canonical text.

create table if not exists student_iep_goals (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  goal_text text not null,
  goal_type text check (
    goal_type in (
      'reading_fluency',
      'comprehension',
      'phonics',
      'vocabulary',
      'writing',
      'speaking',
      'behavioral',
      'other'
    )
  ),
  baseline text,
  target_criterion text,
  target_date date,
  status text not null default 'active' check (
    status in ('active', 'mastered', 'archived', 'superseded')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_iep_goals_child_idx
  on student_iep_goals (child_id, status);
create index if not exists student_iep_goals_teacher_idx
  on student_iep_goals (teacher_id, created_at desc);

alter table student_iep_goals enable row level security;

-- Teachers can read goals for any kid in their classrooms (so a
-- co-teacher / case manager swap doesn't lock out the active teacher).
create policy student_iep_goals_classroom_select
  on student_iep_goals for select
  using (
    teacher_id = auth.uid()
    or exists (
      select 1
      from classroom_memberships cm
      join classrooms c on c.id = cm.classroom_id
      where cm.child_id = student_iep_goals.child_id
        and c.teacher_id = auth.uid()
    )
  );

-- Only the authoring teacher can mutate. Other teachers fork a new goal.
create policy student_iep_goals_owner_insert
  on student_iep_goals for insert
  with check (teacher_id = auth.uid());

create policy student_iep_goals_owner_update
  on student_iep_goals for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy student_iep_goals_owner_delete
  on student_iep_goals for delete
  using (teacher_id = auth.uid());

-- updated_at trigger
create or replace function tg_student_iep_goals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger student_iep_goals_updated_at
  before update on student_iep_goals
  for each row execute function tg_student_iep_goals_updated_at();
