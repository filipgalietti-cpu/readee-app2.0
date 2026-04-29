-- Per-kid running record log. Each row is one teacher-led recording
-- of a single student reading a target passage aloud. Replaces the
-- group-diarization fantasy of the original "Coach Mode" with the
-- workflow teachers actually do: 1:1 running records.
--
-- Stored long-term so a teacher can scroll Marcus's WCPM trend over
-- 8 weeks. Miscues stored as JSONB for flexible schema (we evolve
-- the analysis output without migrations).

create table if not exists running_records (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references profiles(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  classroom_id uuid references classrooms(id) on delete set null,
  passage_text text not null,
  passage_word_count int not null,
  grade_level text,
  duration_seconds int,
  transcript text,
  wcpm int,
  accuracy_pct int,
  miscues jsonb,
  focus_area text,
  teacher_note text,
  created_at timestamptz not null default now()
);

create index if not exists running_records_child_idx
  on running_records (child_id, created_at desc);
create index if not exists running_records_teacher_idx
  on running_records (teacher_id, created_at desc);

alter table running_records enable row level security;

create policy running_records_owner_select
  on running_records for select
  using (teacher_id = auth.uid());

create policy running_records_owner_insert
  on running_records for insert
  with check (teacher_id = auth.uid());

create policy running_records_owner_delete
  on running_records for delete
  using (teacher_id = auth.uid());
