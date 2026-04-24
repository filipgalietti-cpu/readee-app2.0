-- Trusted-parent auto-approval for community submissions.
--
-- Once a parent has had N submissions approved (TRUSTED_THRESHOLD = 5),
-- their subsequent community_passages submissions are auto-approved —
-- they skip the human queue and go live immediately. Admins can still
-- audit; auto-approved rows are tagged so moderation UI can surface
-- them for random sampling.
--
-- An admin can also explicitly demote a parent: set is_trusted=false
-- in a profile_trust_flags row and future submissions go through the
-- normal queue again. No data model for bans — that's a social problem,
-- not a schema problem.

alter table public.community_passages
  add column if not exists auto_approved boolean not null default false;

create table if not exists public.profile_trust_flags (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  is_trusted_parent boolean not null default false,
  flagged_by uuid references public.profiles(id) on delete set null,
  flagged_at timestamptz,
  notes text,
  updated_at timestamptz not null default now()
);

alter table public.profile_trust_flags enable row level security;

-- Parents can see their own trust status (UI on dashboard shows "Trusted
-- contributor" badge). Admins can read + update any row.
create policy "User sees their own trust flag"
  on public.profile_trust_flags for select to authenticated
  using (profile_id = auth.uid());

create policy "Admins read all trust flags"
  on public.profile_trust_flags for select to authenticated
  using (
    exists (
      select 1 from public.admin_memberships
      where profile_id = auth.uid()
    )
  );

create policy "Admins update trust flags"
  on public.profile_trust_flags for update to authenticated
  using (
    exists (
      select 1 from public.admin_memberships
      where profile_id = auth.uid()
    )
  );

-- Helper function: count approved submissions for a parent. Used by
-- submitForCommunityReview() to decide whether auto-approval applies.
create or replace function public.parent_approved_submission_count(p_parent_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.community_passages
  where source_parent_id = p_parent_id
    and status = 'approved';
$$;
