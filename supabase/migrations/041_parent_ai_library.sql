-- Parent-side AI content library.
--
-- Parents create personalized reading content for their own kids via the
-- "Ask Readee" wizard. Each generation saves here, scoped to one child,
-- so the content persists on the kid's journey / practice hub as a "My
-- AI library" shelf.
--
-- The `shared` column is future-proofing for Layer 4 community sharing:
-- a parent can opt-in to contribute sanitized versions of their content
-- back to a shared Readee library that benefits all families.  Layer 4
-- builds the moderation pipeline + the community_passages destination
-- table; this column captures intent from day one so we don't need a
-- backfill.

create table if not exists public.child_ai_content (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  kind text not null check (kind in ('passage', 'practice_set')),

  -- What the parent asked for.
  topic text not null,
  grade_level text,
  phonics_pattern text,

  -- The generated artifacts (any can be null if that modality wasn't
  -- requested).
  title text,
  passage_text text,
  questions jsonb,         -- [{prompt, choices, correct, hint}, ...]
  image_url text,
  audio_url text,

  -- Completion / access tracking.
  last_played_at timestamptz,
  play_count integer not null default 0,

  -- Intent signal for Layer 4. Default false; UI may toggle true when
  -- parent opts in. The actual community push is handled by Layer 4.
  shared boolean not null default false,
  shared_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index child_ai_content_parent_idx on public.child_ai_content (parent_id);
create index child_ai_content_child_idx on public.child_ai_content (child_id, created_at desc);
create index child_ai_content_shared_idx on public.child_ai_content (shared) where shared = true;

alter table public.child_ai_content enable row level security;

-- Parents own and can fully manage their children's AI content.
create policy "Parents manage their children's AI content"
  on public.child_ai_content for all to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- The child (if they have their own Supabase session via the student-
-- session cookie flow) can read content targeted at them. Classroom
-- students don't currently authenticate via Supabase auth so this path
-- is a no-op for them, but we future-proof it.
create policy "Children read their own AI content"
  on public.child_ai_content for select to authenticated
  using (
    exists (
      select 1 from public.children c
      where c.id = child_ai_content.child_id
        and c.id::text = auth.uid()::text
    )
  );

-- updated_at trigger
create or replace function public.tg_child_ai_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_child_ai_content_updated_at on public.child_ai_content;
create trigger set_child_ai_content_updated_at
  before update on public.child_ai_content
  for each row execute function public.tg_child_ai_content_updated_at();
