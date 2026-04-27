-- Allow 'fluency' as an assignment kind + create fluency_passages
-- (reusable passage rows assigned to classrooms). See DDL via MCP.

alter table public.assignments
  drop constraint if exists assignments_kind_check;
alter table public.assignments
  add constraint assignments_kind_check
  check (kind in ('readee_lesson', 'custom_quiz', 'fluency'));

create table public.fluency_passages (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  text text not null,
  grade_level text,
  created_at timestamptz not null default now()
);

create index fluency_passages_teacher_idx
  on public.fluency_passages (teacher_id, created_at desc);

alter table public.fluency_passages enable row level security;

create policy "Teachers manage their own fluency passages"
  on public.fluency_passages for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Assigned students read the passage"
  on public.fluency_passages for select to authenticated
  using (
    id::text in (
      select source_id from public.assignments a
      join public.classroom_memberships cm on cm.classroom_id = a.classroom_id
      where a.kind = 'fluency' and cm.child_id in (
        select id from public.children where parent_id = auth.uid()
      )
    )
  );

alter table public.fluency_readings
  add column if not exists assignment_id uuid references public.assignments(id) on delete set null;
