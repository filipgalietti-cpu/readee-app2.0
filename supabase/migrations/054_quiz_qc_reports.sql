-- AI quality-control reports for custom quizzes.
--
-- Every Build with AI run lands a row here. The orchestrator runs the
-- QC suite (lib/ai/qc.ts) right after generation and stores the
-- structured report. Gates eligibility for community publication and
-- powers the admin queue at /admin/qc.
--
-- The "checks" payload is the QcReport from lib/ai/qc.ts. We mirror
-- the rolled-up severity into a top-level column so we can index it
-- and filter the queue without unpacking JSON.

create table public.quiz_qc_reports (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.custom_quizzes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  overall text not null check (overall in ('pass', 'warn', 'fail')),
  checks jsonb not null,
  credits_used integer not null default 0,
  ran_at timestamptz not null default now(),
  -- Editorial workflow: Jennifer (or any admin) marks a flagged report
  -- as reviewed once she's eyeballed it. Null = still in the queue.
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  reviewer_note text,
  created_at timestamptz not null default now()
);

create index quiz_qc_reports_quiz_idx
  on public.quiz_qc_reports (quiz_id, created_at desc);

-- The admin queue is "everything that warrants review and isn't
-- already reviewed" — partial index makes that filter free.
create index quiz_qc_reports_queue_idx
  on public.quiz_qc_reports (created_at desc)
  where overall in ('warn', 'fail') and reviewed_at is null;

alter table public.quiz_qc_reports enable row level security;

create policy "Teachers read their own QC reports"
  on public.quiz_qc_reports for select to authenticated
  using (teacher_id = auth.uid());

-- Admins (Filip, Jennifer) read everything via the existing admin scope
-- helper. Same shape as other admin policies in the project.
create policy "Admins read all QC reports"
  on public.quiz_qc_reports for select to authenticated
  using (exists (select 1 from public.admin_memberships am where am.profile_id = auth.uid()));

create policy "Admins update QC reports for review workflow"
  on public.quiz_qc_reports for update to authenticated
  using (exists (select 1 from public.admin_memberships am where am.profile_id = auth.uid()))
  with check (exists (select 1 from public.admin_memberships am where am.profile_id = auth.uid()));

-- Service role inserts (the orchestrator runs server-side via admin
-- client) — no policy needed since the admin client bypasses RLS.
