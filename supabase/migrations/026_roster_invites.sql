-- Week 1.5: roster invites so teachers can pre-populate a class with
-- student names and fire email invites to parents. Parents click the
-- invite link, log in, pick which of their kids the named placeholder
-- represents, and the pending row flips to a real classroom_membership.

create table public.roster_invites (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  invited_by uuid not null references profiles(id) on delete cascade,
  student_first_name text not null,
  student_last_initial text,
  parent_email text,
  invite_token text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'joined', 'revoked')),
  source text not null default 'manual'
    check (source in ('manual', 'csv', 'google_classroom')),
  claimed_by_child_id uuid references children(id) on delete set null,
  claimed_at timestamptz,
  email_sent_at timestamptz,
  email_send_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index roster_invites_classroom_status_idx
  on public.roster_invites (classroom_id, status);

create index roster_invites_parent_email_idx
  on public.roster_invites (lower(parent_email))
  where parent_email is not null;

alter table public.roster_invites enable row level security;

create policy "Teachers manage invites in their classrooms"
  on public.roster_invites
  for all
  to authenticated
  using (public.auth_is_classroom_teacher(classroom_id))
  with check (public.auth_is_classroom_teacher(classroom_id));

create or replace function public.get_invite_by_token(p_token text)
returns table (
  invite_id uuid,
  classroom_id uuid,
  classroom_name text,
  teacher_email text,
  student_first_name text,
  student_last_initial text,
  parent_email text,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id as invite_id,
    i.classroom_id,
    c.name as classroom_name,
    p.email as teacher_email,
    i.student_first_name,
    i.student_last_initial,
    i.parent_email,
    i.status
  from roster_invites i
  join classrooms c on c.id = i.classroom_id
  join profiles p on p.id = c.teacher_id
  where i.invite_token = p_token
  limit 1;
$$;

grant execute on function public.get_invite_by_token(text) to anon, authenticated;

create or replace function public.claim_roster_invite(p_token text, p_child_id uuid)
returns table (ok boolean, classroom_id uuid, error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite roster_invites%rowtype;
  v_owns boolean;
begin
  select * into v_invite from roster_invites where invite_token = p_token;
  if not found then
    return query select false, null::uuid, 'Invite not found.'::text;
    return;
  end if;
  if v_invite.status <> 'pending' then
    return query select false, null::uuid, 'This invite is no longer active.'::text;
    return;
  end if;

  select exists (
    select 1 from children where id = p_child_id and parent_id = auth.uid()
  ) into v_owns;
  if not v_owns then
    return query select false, null::uuid, 'You can only claim with your own child.'::text;
    return;
  end if;

  insert into classroom_memberships (classroom_id, child_id)
  values (v_invite.classroom_id, p_child_id)
  on conflict (classroom_id, child_id) do nothing;

  update roster_invites
    set status = 'joined',
        claimed_by_child_id = p_child_id,
        claimed_at = now()
    where id = v_invite.id;

  return query select true, v_invite.classroom_id, null::text;
end;
$$;

grant execute on function public.claim_roster_invite(text, uuid) to authenticated;
