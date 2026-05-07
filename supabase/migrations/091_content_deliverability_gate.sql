-- ⚠ Recreated locally on 2026-05-06 to match remote schema.
-- This migration was applied directly to prod via MCP and never
-- checked into the local repo. Local file written from
-- information_schema introspection so future devs can `supabase db
-- reset` without drift.
--
-- Deliverability gate Phase A: shippability state for static catalog
-- questions + a regen log shared by every QC bot worker.
--
-- The 911 question catalog lives in app/data/*-standards-questions
-- .json (immutable at runtime). Their pass/warn/quarantine state
-- needs a writable home, and the QC bot runs need an audit trail.
--
-- Two tables:
--   question_qc_status — one row per static question id (e.g.
--     "K-RL.K.1-Q1"). qc_status drives whether a question reaches
--     a kid (lib/data/qc-filter.ts ALLOW_WARN gate).
--   content_qc_log — append-only ledger of every regen / dismiss /
--     verify / format-rescue action. Powers /owner/qc-bot.
--
-- Both are admin-only; RLS added in 097_qc_admin_only_rls.sql.
-- Service role (cron + supabaseAdmin()) bypasses RLS by default.

create table if not exists public.question_qc_status (
  target_id text primary key,
  qc_status text not null default 'pass',
  qc_attempt_count integer not null default 0,
  last_finding_id uuid,
  updated_at timestamptz not null default now()
);

-- (RLS + admin-read policy added in 097_qc_admin_only_rls.sql.)

create table if not exists public.content_qc_log (
  id uuid primary key default gen_random_uuid(),
  target_kind text not null,
  target_id text not null,
  change_type text not null,
  before jsonb,
  after jsonb,
  reason text,
  finding_id uuid,
  agent text not null,
  created_at timestamptz not null default now()
);

create index if not exists content_qc_log_target_idx
  on public.content_qc_log (target_kind, target_id, created_at desc);

create index if not exists content_qc_log_change_type_idx
  on public.content_qc_log (change_type, created_at desc);

-- (RLS + admin-read policy added in 097_qc_admin_only_rls.sql.)

-- child_ai_content gets qc_status (and an attempt counter) so the
-- deliverability gate can fence off Ask-Readee passages that fail
-- judging before the kid sees them.
alter table public.child_ai_content
  add column if not exists qc_status text default 'pass',
  add column if not exists qc_attempt_count integer default 0;
