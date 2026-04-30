-- Persistent findings from the content-audit script.
--
-- One row per (target × finding_type). Examples:
--   * question RL.K.1-Q3 fails q.no_self_leak (the answer is in the prompt)
--   * lesson RF.K.3a slide 4 has phonemeLetterIndices [0,3] but the word is "cat" (3 letters)
--   * question RL.2.5-Q1 should be a sentence_build, not multiple_choice
--
-- Findings are append-only; resolution = update status field. The
-- audit script is idempotent on (target_kind, target_id, finding_type)
-- via unique index so re-running doesn't duplicate.

create table if not exists content_audit_findings (
  id uuid primary key default gen_random_uuid(),
  target_kind text not null check (
    target_kind in ('lesson', 'question', 'lesson_slide')
  ),
  -- Stable identifier for the target: lesson standardId, question id
  -- (e.g. "RL.K.1-Q3"), or "{lessonStandardId}#slide-{position}".
  target_id text not null,
  -- Free-text grade tag for filtering (K, 1st, 2nd, 3rd, 4th).
  grade text,
  finding_type text not null,
  severity text not null check (severity in ('pass', 'warn', 'fail')),
  message text not null,
  -- Suggested fix or alternative. For "better_format" findings, this
  -- is the recommended question type. For structural fixes, this is
  -- a one-line patch hint.
  suggestion text,
  -- Snapshot of the target at audit time so we can re-render the
  -- before/after even after the source data changes.
  target_snapshot jsonb,
  -- Reviewer state (admin triages findings just like batch-qc).
  status text not null default 'open' check (
    status in ('open', 'fixed', 'wont_fix', 'duplicate')
  ),
  resolved_by uuid references profiles(id) on delete set null,
  resolved_at timestamptz,
  resolver_note text,
  audit_run_id uuid,
  created_at timestamptz not null default now()
);

create unique index if not exists content_audit_findings_unique_idx
  on content_audit_findings (target_kind, target_id, finding_type);

create index if not exists content_audit_findings_status_idx
  on content_audit_findings (status, severity, target_kind);
create index if not exists content_audit_findings_grade_idx
  on content_audit_findings (grade, target_kind);
create index if not exists content_audit_findings_run_idx
  on content_audit_findings (audit_run_id);

alter table content_audit_findings enable row level security;

create policy content_audit_findings_admin_read
  on content_audit_findings for select
  using (
    exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  );
create policy content_audit_findings_admin_update
  on content_audit_findings for update
  using (
    exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  )
  with check (
    exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  );

-- INSERTs come from the audit script via service role.

-- Run log so we know when the last audit fired + how it went.
create table if not exists content_audit_runs (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  questions_scanned int not null default 0,
  lessons_scanned int not null default 0,
  findings_pass int not null default 0,
  findings_warn int not null default 0,
  findings_fail int not null default 0,
  credits_used int not null default 0,
  status text not null default 'running' check (
    status in ('running', 'completed', 'failed', 'aborted')
  ),
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table content_audit_runs enable row level security;
create policy content_audit_runs_admin_read
  on content_audit_runs for select
  using (
    exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  );
