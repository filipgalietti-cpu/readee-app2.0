-- Stage 1 of QC autonomy plan: move the 201 lessons + 911 questions
-- from app/data/*.json into Postgres so AI workers can write back.
-- This migration is purely ADDITIVE — JSON files remain canonical
-- until the renderer flips. Backfill happens via a separate idempotent
-- script (scripts/backfill-content-db.ts).
--
-- Schema notes:
--   - Lessons keep their rich nested structure as jsonb on the
--     `slides` column. The shape (slides → steps → displayParts →
--     highlightPills) is too irregular to flatten into relational
--     tables without losing renderer fidelity. The trade-off: we
--     lose per-step queries, but the row-level qc_status / version
--     / lineage gives us 90% of the value.
--   - Question IDs are kept as text (existing format "RL.K.1-Q1")
--     to avoid renumbering anything. They've been keyed off this
--     in audit findings, kid_feedback, and storage paths for
--     months — changing the key would cascade everywhere.
--   - language column is mandatory (default 'en') to support the
--     existing *-es.json Spanish content as we migrate it later.
--   - Per-row metadata: qc_status, qc_attempt_count, content_hash,
--     lineage_id, version, source. These are what Filip needs to
--     know "what changed when, by what agent, against what bar."

create table if not exists public.lessons_db (
  id uuid primary key default gen_random_uuid(),
  standard_id text not null,
  grade text not null,
  domain text,
  title text not null,
  slides jsonb not null default '[]'::jsonb,
  qc_status text not null default 'pass'
    check (qc_status in ('pass','warn','fail','quarantined','retired')),
  qc_attempt_count integer not null default 0,
  content_hash text,
  lineage_id uuid references public.lessons_db(id) on delete set null,
  version integer not null default 1,
  source text not null default 'authored'
    check (source in ('authored','ai_enrich','ai_factory','ai_regen')),
  language text not null default 'en'
    check (language in ('en','es')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (standard_id, language)
);

create index if not exists lessons_db_grade_idx
  on public.lessons_db (grade, qc_status);
create index if not exists lessons_db_standard_idx
  on public.lessons_db (standard_id);
create index if not exists lessons_db_qc_status_idx
  on public.lessons_db (qc_status) where qc_status != 'pass';
create index if not exists lessons_db_lineage_idx
  on public.lessons_db (lineage_id) where lineage_id is not null;

alter table public.lessons_db enable row level security;

create policy lessons_db_read_all
  on public.lessons_db for select to authenticated, anon
  using (true);

create policy lessons_db_admin_all
  on public.lessons_db for all to authenticated
  using (
    exists (select 1 from public.admin_memberships am
            where am.profile_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.admin_memberships am
            where am.profile_id = (select auth.uid()))
  );

create or replace function public.tg_lessons_db_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists set_lessons_db_updated_at on public.lessons_db;
create trigger set_lessons_db_updated_at
  before update on public.lessons_db
  for each row execute function public.tg_lessons_db_updated_at();

-- ──────────────────────────────────────────────────────────────────

create table if not exists public.questions_db (
  id text primary key,
  standard_id text not null,
  grade text not null,
  domain text,
  type text not null,
  prompt text not null,
  choices jsonb not null default '[]'::jsonb,
  correct text,
  hint text,
  difficulty integer,
  audio_url text,
  hint_audio_url text,
  image_url text,
  incorrect_audio_url text,
  qc_status text not null default 'pass'
    check (qc_status in ('pass','warn','fail','quarantined','retired')),
  qc_attempt_count integer not null default 0,
  content_hash text,
  lineage_id text references public.questions_db(id) on delete set null,
  version integer not null default 1,
  source text not null default 'authored'
    check (source in ('authored','ai_enrich','ai_factory','ai_regen')),
  language text not null default 'en'
    check (language in ('en','es')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists questions_db_standard_idx
  on public.questions_db (standard_id);
create index if not exists questions_db_grade_idx
  on public.questions_db (grade, qc_status);
create index if not exists questions_db_qc_status_idx
  on public.questions_db (qc_status) where qc_status != 'pass';
create index if not exists questions_db_lineage_idx
  on public.questions_db (lineage_id) where lineage_id is not null;
create index if not exists questions_db_type_idx
  on public.questions_db (type);

alter table public.questions_db enable row level security;

create policy questions_db_read_all
  on public.questions_db for select to authenticated, anon
  using (true);

create policy questions_db_admin_all
  on public.questions_db for all to authenticated
  using (
    exists (select 1 from public.admin_memberships am
            where am.profile_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.admin_memberships am
            where am.profile_id = (select auth.uid()))
  );

create or replace function public.tg_questions_db_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists set_questions_db_updated_at on public.questions_db;
create trigger set_questions_db_updated_at
  before update on public.questions_db
  for each row execute function public.tg_questions_db_updated_at();

-- ──────────────────────────────────────────────────────────────────

create table if not exists public.ccss_standards (
  id text primary key,
  grade text not null,
  domain text,
  description text not null,
  parent_tip text,
  created_at timestamptz not null default now()
);

create index if not exists ccss_standards_grade_idx
  on public.ccss_standards (grade);

alter table public.ccss_standards enable row level security;
create policy ccss_standards_read_all
  on public.ccss_standards for select to authenticated, anon
  using (true);
