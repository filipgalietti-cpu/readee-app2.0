-- Live classroom quiz: teacher starts a real-time-ish session, students
-- join with a short session code, everyone answers in sync, teacher
-- advances from one question to the next, leaderboard at the end.
--
-- v1 uses polling on the client (every ~2s) rather than Supabase
-- Realtime. That's intentionally crude — Realtime is a drop-in upgrade
-- once the shape settles. Plumbing is designed so only the client
-- needs to swap.

create table public.live_quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  source_kind text not null check (source_kind in ('readee_lesson', 'custom_quiz')),
  source_id text not null,
  title text not null,
  question_ids jsonb not null,
  session_code text not null unique,
  status text not null default 'lobby'
    check (status in ('lobby', 'running', 'ended')),
  current_question_idx integer not null default 0,
  current_question_started_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index live_quiz_sessions_classroom_idx
  on public.live_quiz_sessions (classroom_id, created_at desc);

create table public.live_quiz_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_quiz_sessions(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  constraint live_quiz_participants_session_child_key unique (session_id, child_id)
);

create index live_quiz_participants_session_idx
  on public.live_quiz_participants (session_id);

create table public.live_quiz_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_quiz_sessions(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  question_idx integer not null,
  answer text,
  is_correct boolean not null,
  ms_to_answer integer,
  answered_at timestamptz not null default now(),
  constraint live_quiz_answers_session_child_question_key
    unique (session_id, child_id, question_idx)
);

create index live_quiz_answers_session_idx
  on public.live_quiz_answers (session_id, question_idx);

alter table public.live_quiz_sessions enable row level security;
alter table public.live_quiz_participants enable row level security;
alter table public.live_quiz_answers enable row level security;

create policy "Teachers own their live quiz sessions"
  on public.live_quiz_sessions for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Admins read live sessions in their school"
  on public.live_quiz_sessions for select to authenticated
  using (
    exists (
      select 1 from classrooms c
      where c.id = live_quiz_sessions.classroom_id
        and c.school_id is not null
        and public.auth_is_school_admin(c.school_id)
    )
  );

create policy "Teachers read their session participants"
  on public.live_quiz_participants for select to authenticated
  using (
    exists (
      select 1 from live_quiz_sessions s
      where s.id = live_quiz_participants.session_id
        and s.teacher_id = auth.uid()
    )
  );

create policy "Teachers read their session answers"
  on public.live_quiz_answers for select to authenticated
  using (
    exists (
      select 1 from live_quiz_sessions s
      where s.id = live_quiz_answers.session_id
        and s.teacher_id = auth.uid()
    )
  );

create or replace function public.find_live_session_by_code(p_code text)
returns table (
  id uuid,
  classroom_id uuid,
  title text,
  status text,
  current_question_idx integer
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.classroom_id, s.title, s.status, s.current_question_idx
  from live_quiz_sessions s
  where s.session_code = upper(p_code)
  limit 1;
$$;

grant execute on function public.find_live_session_by_code(text) to anon, authenticated;
