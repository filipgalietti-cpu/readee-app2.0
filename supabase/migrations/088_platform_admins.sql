-- Platform admins — Readee owners (Filip, Jen) who need access to
-- platform-level surfaces (batch QC queue, content audit, factory
-- runs). This is distinct from `admin_memberships` which is the B2B
-- district/school admin scope.
--
-- Why a separate table: admin_memberships requires either a
-- school_id or a district_id (CHECK constraint). Platform admins
-- aren't tied to any specific tenant.

create table if not exists platform_admins (
  profile_id uuid primary key references profiles(id) on delete cascade,
  added_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table platform_admins enable row level security;

-- Authenticated users can check their own row (so client-side gates
-- can short-circuit). They can't see anyone else's.
create policy platform_admins_self_read
  on platform_admins for select to authenticated
  using (profile_id = auth.uid());

-- Writes via service role only (we add admins manually via SQL).
