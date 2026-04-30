-- Calibrated MCQ bank. Each row is one factory-generated multiple-
-- choice question pinned to a CCS standard at a specific difficulty
-- band (1-5). Powers two future plays:
--
--   1. Adaptive practice: kid getting RF.1.3a right twice → bump to
--      band 4 from this bank instead of re-seeing the same 5 questions
--      from app/data/*-standards-questions.json.
--   2. Per-standard breadth: 5 difficulty bands × 200 standards =
--      ~1,000 questions in v1, growing nightly.

create table if not exists calibrated_items (
  id uuid primary key default gen_random_uuid(),
  standard_id text not null,
  grade_level text not null,
  target_difficulty int not null check (target_difficulty between 1 and 5),
  -- The judge's after-the-fact difficulty rating; usually matches
  -- target but may drift +/- 1 if the AI couldn't hit the band exactly.
  difficulty_actual int check (difficulty_actual between 1 and 5),
  prompt text not null,
  choices jsonb not null,
  correct text not null,
  hint text,
  blooms_level text,
  skill_microlabel text,
  passage_anchor_id uuid, -- optional pointer to a leveled passage if anchored
  source text not null default 'batch_v1',
  prompt_version text,
  qc_overall text check (qc_overall in ('pass', 'warn', 'fail')),
  qc_report jsonb,
  -- Toggle off without deleting; lets us soft-hide a row that
  -- production telemetry says is broken.
  visible_to_students boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists calibrated_items_lookup_idx
  on calibrated_items (standard_id, target_difficulty, visible_to_students)
  where visible_to_students;
create index if not exists calibrated_items_grade_idx
  on calibrated_items (grade_level, target_difficulty);
create index if not exists calibrated_items_recent_idx
  on calibrated_items (created_at desc);

alter table calibrated_items enable row level security;

-- Authenticated users (kids included) can read items that are
-- visible. Writes come exclusively from the cron via service role,
-- which bypasses RLS — no insert policy needed.
create policy calibrated_items_read
  on calibrated_items for select to authenticated
  using (visible_to_students = true);

-- Admins can read EVERYTHING (including soft-hidden items) for the
-- dashboard and for prompt-tuning analysis.
create policy calibrated_items_admin_read_all
  on calibrated_items for select
  using (
    exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  );
create policy calibrated_items_admin_update
  on calibrated_items for update
  using (
    exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  )
  with check (
    exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  );
