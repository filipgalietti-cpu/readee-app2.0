-- Community-shared parent-generated content.
--
-- When a parent opts into sharing a piece of child_ai_content, we run it
-- through name-anonymization + the safety filter, then land it here as a
-- NEW row (the original stays private on child_ai_content). A human
-- reviewer (Jennifer) approves before it's visible to other families.
--
-- Approved content shows up on a "Community library" shelf accessible
-- from the practice hub / journey — zero incremental Gemini cost to
-- Readee, growing value to paying subscribers.

create table if not exists public.community_passages (
  id uuid primary key default gen_random_uuid(),

  -- Provenance. Original child_ai_content row this was forked from —
  -- kept for audit + so we can unshare if the parent changes their mind.
  source_content_id uuid not null references public.child_ai_content(id) on delete cascade,
  source_parent_id uuid not null references public.profiles(id) on delete cascade,

  -- Sanitized content.
  title text not null,
  passage_text text not null,
  questions jsonb,
  image_url text,
  audio_url text,

  -- Classification.
  grade_level text not null,
  topic text not null,
  phonics_pattern text,

  -- Moderation lifecycle. Content is INVISIBLE to other families until
  -- status = 'approved'. Rejections carry a reason for the reviewer's
  -- notes and potential future automation training data.
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,

  -- Engagement signals for surfacing popular content on the community
  -- shelf. Updated by /api/community/track-play.
  view_count integer not null default 0,
  play_count integer not null default 0,
  completion_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index community_passages_status_idx on public.community_passages (status);
create index community_passages_grade_idx on public.community_passages (grade_level) where status = 'approved';
create index community_passages_parent_idx on public.community_passages (source_parent_id);

alter table public.community_passages enable row level security;

-- Original parent can see + withdraw their own submissions regardless
-- of moderation status.
create policy "Parents see their own community submissions"
  on public.community_passages for select to authenticated
  using (source_parent_id = auth.uid());

create policy "Parents withdraw their own community submissions"
  on public.community_passages for update to authenticated
  using (source_parent_id = auth.uid())
  with check (source_parent_id = auth.uid());

-- Any authenticated user (parent, teacher, admin) can read approved
-- content. Pending/rejected stays hidden from non-owners.
create policy "Approved community content is public to authenticated"
  on public.community_passages for select to authenticated
  using (status = 'approved');

-- Only admins (via admin_memberships) can moderate. This is a simple
-- role check; if you need a dedicated moderator role later, add a
-- moderator_memberships table and check it here.
create policy "Admins moderate community content"
  on public.community_passages for update to authenticated
  using (
    exists (
      select 1 from public.admin_memberships am
      where am.profile_id = auth.uid()
    )
  );

-- updated_at trigger
create or replace function public.tg_community_passages_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_community_passages_updated_at on public.community_passages;
create trigger set_community_passages_updated_at
  before update on public.community_passages
  for each row execute function public.tg_community_passages_updated_at();
