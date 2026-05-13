-- QC run telemetry. One row per content piece per QC cycle. Captures
-- whether a piece passed first try, was healed (and by which healers),
-- or got quarantined after exhausting attempts. Feeds the
-- /owner/qc-health dashboard so we can tell whether the auto-heal
-- loop is actually keeping up at the current scale before we ramp
-- daily content production.

create table if not exists public.qc_runs (
  id uuid primary key default gen_random_uuid(),
  -- Free-form content type ('daily_question', 'discovery_article',
  -- 'leveled_passage', 'animal_of_the_day', etc.). Keeps the schema
  -- forward-compatible without enum migrations every time we add a
  -- new content type.
  content_type text not null,
  -- The id (or date slug, or composite key) of the underlying row.
  -- Stored as text so callers can use whatever id they want.
  content_id text not null,
  -- 'passed_first_try' | 'healed' | 'quarantined'
  outcome text not null,
  -- 1..N. For 'passed_first_try' this is always 1.
  attempts_used int not null default 1,
  -- Findings BEFORE any heal action. Array of { name, severity, message }.
  -- Empty array when outcome = 'passed_first_try'.
  initial_findings jsonb not null default '[]'::jsonb,
  -- Findings AFTER all attempts. Empty array when outcome != 'quarantined'.
  final_findings jsonb not null default '[]'::jsonb,
  -- Ordered list of healer names that ran (e.g.
  -- ['image', 'passage', 'audio']). Empty for first-try passes.
  healer_sequence text[] not null default '{}',
  -- Total milliseconds spent in the heal loop.
  duration_ms int,
  -- Optional extras — content URL, regen prompts used, etc.
  meta jsonb,
  created_at timestamptz not null default now()
);

-- Most common dashboard queries: by content_type, by date.
create index if not exists qc_runs_type_created_idx
  on public.qc_runs (content_type, created_at desc);
create index if not exists qc_runs_content_idx
  on public.qc_runs (content_type, content_id);
create index if not exists qc_runs_outcome_idx
  on public.qc_runs (outcome, created_at desc);

-- RLS: telemetry table, service role only. The /owner/qc-health
-- dashboard runs as an admin server action so this stays locked
-- down to non-clients.
alter table public.qc_runs enable row level security;

comment on table public.qc_runs is
  'Telemetry log of every QC + auto-heal cycle. Feeds /owner/qc-health.';
