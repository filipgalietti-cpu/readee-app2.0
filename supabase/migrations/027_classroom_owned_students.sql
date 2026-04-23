-- B2B pivot foundation: allow children to be owned by a classroom
-- instead of (or in addition to) a parent. Parent-owned children stay
-- unchanged; new classroom-owned children are created by teachers and
-- do not require a parent account or email.

alter table public.children alter column parent_id drop not null;

alter table public.children
  add column owner_type text not null default 'parent'
    check (owner_type in ('parent', 'classroom')),
  add column owner_classroom_id uuid
    references public.classrooms(id) on delete cascade,
  add column created_by_teacher uuid
    references public.profiles(id) on delete set null;

-- Invariant: exactly one owner, matching the discriminator.
alter table public.children
  add constraint children_owner_exclusive check (
    (owner_type = 'parent' and parent_id is not null and owner_classroom_id is null)
    or (owner_type = 'classroom' and parent_id is null and owner_classroom_id is not null)
  );

create index children_owner_classroom_idx
  on public.children (owner_classroom_id)
  where owner_type = 'classroom';

-- Teachers can manage classroom-owned students in their classrooms.
-- auth_is_classroom_teacher() is defined in migration 024.
create policy "Teachers manage classroom-owned students"
  on public.children
  for all
  to authenticated
  using (
    owner_type = 'classroom'
    and owner_classroom_id is not null
    and public.auth_is_classroom_teacher(owner_classroom_id)
  )
  with check (
    owner_type = 'classroom'
    and owner_classroom_id is not null
    and public.auth_is_classroom_teacher(owner_classroom_id)
  );
