-- Universal kid feedback signal.
--
-- Every kid-facing AI asset gets a thumbs-up / thumbs-down. One row
-- per (child_id, asset_kind, asset_id). Re-voting overwrites.
--
-- Why polymorphic instead of per-table foreign keys:
--   - Static questions (app/data/*.json) have string IDs like "K-RL.K.1-Q1"
--     that can't FK to a Postgres column.
--   - Daily questions key by date, not UUID.
--   - We want one ledger to compute "asset reception" everywhere.
--
-- The QC bot reads aggregates from kid_feedback_agg. When down_count
-- crosses an internal threshold AND >= 2 distinct kids have downvoted,
-- the bot opens a content_audit_findings row of type 'kid_feedback'
-- so existing regen workers triage it. Code in lib/feedback/kid-thumbs.ts.

create table if not exists public.kid_feedback (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  -- Loose enum — see lib/feedback/kid-thumbs.ts AssetKind for the
  -- canonical list. Kept as text so we can add new surfaces without a
  -- schema migration. Validate at the app layer.
  asset_kind text not null,
  asset_id text not null,
  verdict text not null check (verdict in ('up', 'down')),
  reason text,
  -- Optional context. The kid may not be authed via Supabase auth, so
  -- we record the parent who launched the surface for traceability.
  parent_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  -- One vote per kid per asset; re-voting updates the row in place.
  unique (child_id, asset_kind, asset_id)
);

create index if not exists kid_feedback_asset_idx
  on public.kid_feedback (asset_kind, asset_id);

create index if not exists kid_feedback_child_idx
  on public.kid_feedback (child_id, created_at desc);

alter table public.kid_feedback enable row level security;

-- Parents read + write their own children's votes.
create policy "Parents manage their kids' feedback"
  on public.kid_feedback for all to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- Admins read everything for the operator dashboard.
create policy "Admins read all kid feedback"
  on public.kid_feedback for select to authenticated
  using (
    exists (select 1 from public.admin_memberships am where am.profile_id = auth.uid())
  );

-- Aggregate view consumed by /owner/assets and the auto-quarantine
-- check. We use a regular view (not materialized) — kid_feedback is
-- low-volume relative to read traffic, and we want fresh counts.
create or replace view public.kid_feedback_agg as
select
  asset_kind,
  asset_id,
  count(*) filter (where verdict = 'up') as up_count,
  count(*) filter (where verdict = 'down') as down_count,
  count(distinct child_id) filter (where verdict = 'down') as distinct_down_kids,
  count(distinct child_id) as distinct_kids,
  max(created_at) as last_voted_at
from public.kid_feedback
group by asset_kind, asset_id;

grant select on public.kid_feedback_agg to authenticated;

-- ── content_audit_findings.target_kind expansion ────────────────────
--
-- The audit-findings table was originally bound to {lesson, question,
-- lesson_slide}. Auto-quarantine off kid feedback writes findings for
-- the broader asset surface (community passages, daily questions,
-- ask-readee output, etc.). Drop the old constraint and replace with
-- the wider set so the inserts don't violate the check.

alter table public.content_audit_findings
  drop constraint if exists content_audit_findings_target_kind_check;

alter table public.content_audit_findings
  add constraint content_audit_findings_target_kind_check
  check (target_kind in (
    'lesson',
    'question',
    'lesson_slide',
    'sample_question',
    'sample_lesson',
    'story',
    'daily_question',
    'ask_readee',
    'community_passage',
    'custom_lesson',
    'custom_book',
    'personalized_story',
    'leveled_passage'
  ));
