-- Fluency readings — see DDL applied via MCP.

create table public.fluency_readings (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  audio_url text,
  passage_text text not null,
  passage_grade_level text,
  transcript text,
  word_annotations jsonb not null default '[]'::jsonb,
  words_total integer not null default 0,
  words_correct integer not null default 0,
  duration_seconds numeric(8, 2),
  wcpm numeric(8, 2),
  encouragement text,
  teacher_summary text,
  created_at timestamptz not null default now()
);

create index fluency_readings_child_idx
  on public.fluency_readings (child_id, created_at desc);

alter table public.fluency_readings enable row level security;

create policy "Parents read their kid's recordings"
  on public.fluency_readings for select to authenticated
  using (child_id in (
    select id from public.children where parent_id = auth.uid()
  ));

create policy "Teachers read recordings for kids in their classrooms"
  on public.fluency_readings for select to authenticated
  using (child_id in (
    select cm.child_id from public.classroom_memberships cm
    join public.classrooms c on c.id = cm.classroom_id
    where c.teacher_id = auth.uid()
  ));
