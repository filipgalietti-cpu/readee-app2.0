-- Adaptive production caps. One row per content type. The cron asks
-- getCap(contentType) for today's target before generating. A nightly
-- review reads qc_runs metrics, computes a suggested target, and
-- either applies it (auto_apply = true) or stages it for the operator
-- to click in /owner/qc-health.
--
-- The math:
--   14d all-green  → suggest min(target * 2, daily_max)
--   7d all-green   → suggest target + 1
--   yellow slip    → suggest target - 1
--   quarantine > 0 → freeze (suggest current)
--
-- daily_max is the absolute ceiling — even auto-apply can never go
-- past it. Lets us bound cost + QC blast radius regardless of the
-- adaptive engine's behavior.

create table if not exists public.content_production_caps (
  content_type text primary key,
  daily_target int not null default 1,
  daily_max int not null default 10,
  auto_apply boolean not null default false,
  -- Last applied change. 'human' | 'auto' | 'seed'.
  last_adjusted_by text,
  last_adjusted_at timestamptz,
  -- Most recent adaptive review's suggestion (read by the dashboard).
  suggested_target int,
  suggested_reason text,
  suggested_at timestamptz,
  notes text,
  updated_at timestamptz not null default now()
);

-- Service role only — dashboard reads via admin client.
alter table public.content_production_caps enable row level security;

-- Seed the content types that exist today. New types (Animal of the
-- Day, Comic Strip, etc.) insert their own row when they first run.
insert into public.content_production_caps
  (content_type, daily_target, daily_max, last_adjusted_by)
values
  ('daily_question',    1, 1,  'seed'),
  ('discovery_article', 3, 10, 'seed'),
  ('leveled_passage',   1, 5,  'seed'),
  ('calibrated_mcq',    1, 5,  'seed')
on conflict (content_type) do nothing;

comment on table public.content_production_caps is
  'Per-content-type daily production caps with adaptive QC-driven adjustment.';
