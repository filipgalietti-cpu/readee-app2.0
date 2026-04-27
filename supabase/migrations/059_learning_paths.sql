-- AI-generated personalized learning paths — applied via MCP.

create table public.learning_paths (
  child_id uuid primary key references public.children(id) on delete cascade,
  source_assessment_id uuid references public.assessments(id) on delete set null,
  grade_level text not null,
  reading_level text,
  items jsonb not null default '[]'::jsonb,
  next_index integer not null default 0,
  qc_overall text not null default 'pass'
    check (qc_overall in ('pass', 'warn', 'fail')),
  qc_report jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index learning_paths_assessment_idx
  on public.learning_paths (source_assessment_id);

alter table public.learning_paths enable row level security;

create policy "Children read their own path"
  on public.learning_paths for select to authenticated
  using (child_id in (
    select id from public.children where parent_id = auth.uid()
  ));

create policy "Teachers read paths for their classroom kids"
  on public.learning_paths for select to authenticated
  using (child_id in (
    select cm.child_id
    from public.classroom_memberships cm
    join public.classrooms c on c.id = cm.classroom_id
    where c.teacher_id = auth.uid()
  ));

create or replace function public.touch_learning_paths_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger learning_paths_updated_at
  before update on public.learning_paths
  for each row
  execute function public.touch_learning_paths_updated_at();
