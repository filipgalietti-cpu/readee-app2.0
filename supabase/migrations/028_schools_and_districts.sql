-- B2B pivot: districts and schools as first-class entities so we can
-- sell at that level and surface rollup dashboards. Classrooms
-- optionally link to a school (and through it to a district) for
-- scoped admin views.

create table public.districts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  district_id uuid references public.districts(id) on delete set null,
  city text,
  state text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create table public.admin_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  scope text not null check (scope in ('school', 'district')),
  school_id uuid references public.schools(id) on delete cascade,
  district_id uuid references public.districts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint admin_memberships_scope_target check (
    (scope = 'school' and school_id is not null and district_id is null)
    or (scope = 'district' and district_id is not null and school_id is null)
  ),
  constraint admin_memberships_unique_school unique (profile_id, school_id),
  constraint admin_memberships_unique_district unique (profile_id, district_id)
);

create index schools_district_idx on public.schools (district_id);
create index admin_memberships_profile_idx on public.admin_memberships (profile_id);

alter table public.classrooms
  add column school_id uuid references public.schools(id) on delete set null;

create index classrooms_school_idx on public.classrooms (school_id);

alter table public.districts enable row level security;
alter table public.schools enable row level security;
alter table public.admin_memberships enable row level security;

create or replace function public.auth_is_school_admin(p_school_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from admin_memberships
    where profile_id = auth.uid()
      and (
        (scope = 'school' and school_id = p_school_id)
        or (scope = 'district' and district_id = (
          select district_id from schools where id = p_school_id
        ))
      )
  );
$$;

create or replace function public.auth_is_district_admin(p_district_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from admin_memberships
    where profile_id = auth.uid()
      and scope = 'district'
      and district_id = p_district_id
  );
$$;

grant execute on function public.auth_is_school_admin(uuid) to authenticated;
grant execute on function public.auth_is_district_admin(uuid) to authenticated;

create policy "Users see their own admin memberships"
  on public.admin_memberships for select to authenticated
  using (profile_id = auth.uid());

create policy "District admins read their district"
  on public.districts for select to authenticated
  using (public.auth_is_district_admin(id));

create policy "School admins read their school"
  on public.schools for select to authenticated
  using (public.auth_is_school_admin(id));

create policy "School admins read classrooms in their school"
  on public.classrooms for select to authenticated
  using (
    school_id is not null
    and public.auth_is_school_admin(school_id)
  );

create or replace function public.auth_admin_sees_child(c_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from classroom_memberships cm
    join classrooms cl on cl.id = cm.classroom_id
    where cm.child_id = c_id
      and cl.school_id is not null
      and public.auth_is_school_admin(cl.school_id)
  );
$$;

grant execute on function public.auth_admin_sees_child(uuid) to authenticated;

create policy "Admins read children in their school"
  on public.children for select to authenticated
  using (public.auth_admin_sees_child(id));

create policy "Admins read practice results in their school"
  on public.practice_results for select to authenticated
  using (public.auth_admin_sees_child(child_id));

create policy "Admins read lesson progress in their school"
  on public.lessons_progress for select to authenticated
  using (public.auth_admin_sees_child(child_id));

create policy "Admins read assignment submissions in their school"
  on public.assignment_submissions for select to authenticated
  using (public.auth_admin_sees_child(child_id));
