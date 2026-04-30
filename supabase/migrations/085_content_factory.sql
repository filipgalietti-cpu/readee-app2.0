-- Content factory infrastructure. Two tables that turn the existing
-- one-shot AI generators into a daily pipeline:
--
-- content_review_queue: every batched asset gets a row with QC verdict,
-- review status, and a link back to the live content table where the
-- asset actually lives. Admin reviewers triage from here.
--
-- factory_runs: per-night, per-asset-type log so crons are idempotent
-- (run twice in one day = no duplicate generation) and so we can see
-- "did the leveled-passage cron actually fire last night?" at a glance.

create table if not exists content_review_queue (
  id uuid primary key default gen_random_uuid(),
  -- Which kind of asset this row represents.
  asset_kind text not null check (
    asset_kind in (
      'leveled_passage',
      'calibrated_mcq',
      'decodable_book',
      'themed_story',
      'vocab_card',
      'multi_voice_audio'
    )
  ),
  -- Pointer back to the actual content row. JSON-shaped because
  -- different asset kinds live in different tables, and we don't
  -- want a separate FK column per kind.
  -- Shape: { "table": "differentiated_passages", "id": "<uuid>" }
  asset_ref jsonb not null,
  -- Source generation run + prompt version, for rollback / A-B sampling
  -- when we tune prompts.
  source text not null default 'batch_v1',
  prompt_version text,
  generation_run_id uuid,
  -- CCS standard the asset claims to target. NULL only for free-reading
  -- themed stories that don't anchor to a standard.
  standard_id text,
  -- Status: ready (visible to teachers), needs_review (hidden, waits
  -- for human), rejected (shadow row, prompt-tune signal).
  status text not null default 'needs_review' check (
    status in ('ready', 'needs_review', 'rejected')
  ),
  -- Snapshot of QC engine output so the dashboard renders it without
  -- re-running QC.
  qc_overall text check (qc_overall in ('pass', 'warn', 'fail')),
  qc_report jsonb,
  -- Denormalized so the queue dashboard renders fast.
  title text,
  thumbnail_url text,
  reviewer_id uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  reviewer_verdict text check (
    reviewer_verdict in ('approve', 'reject', 'needs_edit')
  ),
  reviewer_note text,
  created_at timestamptz not null default now()
);

create index if not exists content_review_queue_status_idx
  on content_review_queue (status, asset_kind, created_at desc);
create index if not exists content_review_queue_qc_idx
  on content_review_queue (qc_overall, status);
create index if not exists content_review_queue_run_idx
  on content_review_queue (generation_run_id);

alter table content_review_queue enable row level security;

-- Admins (anyone with an admin_memberships row) can read + mutate.
create policy content_review_queue_admin_read
  on content_review_queue for select
  using (
    exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  );
create policy content_review_queue_admin_update
  on content_review_queue for update
  using (
    exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  )
  with check (
    exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  );

-- INSERTs come from the cron via service role (supabaseAdmin), which
-- bypasses RLS. No insert policy needed.

-- ──────────────────────────────────────────────────────────────────

create table if not exists factory_runs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null,
  asset_kind text not null,
  requested_count int not null default 0,
  generated_count int not null default 0,
  pass_count int not null default 0,
  warn_count int not null default 0,
  fail_count int not null default 0,
  credits_used int not null default 0,
  prompt_version text,
  -- Reference back to the Gemini Batch API job (when applicable).
  batch_job_id text,
  status text not null default 'running' check (
    status in ('running', 'completed', 'failed', 'aborted')
  ),
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- One run per asset_kind per day. The cron checks for an existing row
-- before generating; if found, returns early without spending credits.
create unique index if not exists factory_runs_per_day_unique
  on factory_runs (run_date, asset_kind);

create index if not exists factory_runs_recent_idx
  on factory_runs (asset_kind, run_date desc);

alter table factory_runs enable row level security;

create policy factory_runs_admin_read
  on factory_runs for select
  using (
    exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  );

-- INSERTs / UPDATEs come from the cron via service role.
