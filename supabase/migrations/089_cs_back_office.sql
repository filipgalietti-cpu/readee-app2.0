-- Customer-service back-office tables. Powers the /admin/owner
-- drill-down view's "internal notes" section and the action audit
-- log every CS intervention writes to.

-- Free-text notes pinned to a profile by an admin.
create table if not exists cs_notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete set null,
  body text not null check (length(body) > 0 and length(body) <= 4000),
  created_at timestamptz not null default now()
);

create index if not exists cs_notes_profile_idx
  on cs_notes (profile_id, created_at desc);

alter table cs_notes enable row level security;

create policy cs_notes_admin_read
  on cs_notes for select
  using (
    exists (select 1 from platform_admins pa where pa.profile_id = auth.uid())
    or exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  );
-- Mutations via service role only (server actions).

-- Audit trail of every CS intervention. Useful for "who comp'd what
-- last quarter" + "did anyone change this user's plan" investigations.
create table if not exists cs_actions_log (
  id uuid primary key default gen_random_uuid(),
  target_profile_id uuid not null references profiles(id) on delete cascade,
  admin_id uuid not null references profiles(id) on delete set null,
  action_kind text not null check (
    action_kind in (
      'credit_grant',
      'plan_change',
      'password_reset',
      'suspend',
      'unsuspend',
      'note_added',
      'refund_requested'
    )
  ),
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cs_actions_log_target_idx
  on cs_actions_log (target_profile_id, created_at desc);
create index if not exists cs_actions_log_admin_idx
  on cs_actions_log (admin_id, created_at desc);

alter table cs_actions_log enable row level security;

create policy cs_actions_log_admin_read
  on cs_actions_log for select
  using (
    exists (select 1 from platform_admins pa where pa.profile_id = auth.uid())
    or exists (select 1 from admin_memberships am where am.profile_id = auth.uid())
  );
-- Inserts via service role only.
