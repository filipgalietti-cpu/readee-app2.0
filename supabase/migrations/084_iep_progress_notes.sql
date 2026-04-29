-- Persisted IEP progress notes with formal status code + audit trail.
-- Replaces the throw-away nature of the old /classroom/tools/iep-note
-- output. A note row IS the audit log — case managers need provenance
-- (who drafted, when, against which goal) for IEP team meetings.

create table if not exists iep_progress_notes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  goal_id uuid references student_iep_goals(id) on delete set null,
  reporting_period text not null,
  -- IDEA-aligned progress code. Districts vary on labels but these
  -- five cover the universe.
  progress_status text not null check (
    progress_status in (
      'on_track',
      'adequate_progress',
      'insufficient_progress',
      'mastered',
      'not_yet_introduced'
    )
  ),
  plop text,
  evidence text,
  progress_toward_goal text,
  recommended_supports text,
  one_line_summary text,
  -- Snapshot of inputs at draft-time (annual goal text the teacher saw,
  -- metrics block, mastery block) so the note can be re-rendered later
  -- even if the goal record is edited or deleted.
  input_snapshot jsonb,
  created_at timestamptz not null default now()
);

create index if not exists iep_progress_notes_child_idx
  on iep_progress_notes (child_id, created_at desc);
create index if not exists iep_progress_notes_teacher_idx
  on iep_progress_notes (teacher_id, created_at desc);
create index if not exists iep_progress_notes_goal_idx
  on iep_progress_notes (goal_id) where goal_id is not null;

alter table iep_progress_notes enable row level security;

create policy iep_progress_notes_classroom_select
  on iep_progress_notes for select
  using (
    teacher_id = auth.uid()
    or exists (
      select 1
      from classroom_memberships cm
      join classrooms c on c.id = cm.classroom_id
      where cm.child_id = iep_progress_notes.child_id
        and c.teacher_id = auth.uid()
    )
  );

-- Notes are append-only (audit trail) — no update policy. Owners can
-- delete their own draft if they made a mistake.
create policy iep_progress_notes_owner_insert
  on iep_progress_notes for insert
  with check (teacher_id = auth.uid());

create policy iep_progress_notes_owner_delete
  on iep_progress_notes for delete
  using (teacher_id = auth.uid());
