-- Week 1.5: let teachers read data for kids in their classrooms.
-- SECURITY DEFINER helper avoids RLS recursion between children,
-- classroom_memberships, and classrooms (the same pattern migration
-- 024 established).

create or replace function public.auth_is_teacher_of_child(c_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from classroom_memberships cm
    join classrooms cl on cl.id = cm.classroom_id
    where cm.child_id = c_id
      and cl.teacher_id = auth.uid()
      and cl.archived_at is null
  );
$$;

grant execute on function public.auth_is_teacher_of_child(uuid) to authenticated;

-- children: teachers can read kids in their classrooms.
create policy "Teachers can view children in their classrooms"
  on public.children
  for select
  to authenticated
  using (public.auth_is_teacher_of_child(id));

-- practice_results: teachers can read results for kids they teach.
create policy "Teachers can view practice results for their students"
  on public.practice_results
  for select
  to authenticated
  using (public.auth_is_teacher_of_child(child_id));

-- lessons_progress: teachers can read lesson progress for their students.
create policy "Teachers can view lesson progress for their students"
  on public.lessons_progress
  for select
  to authenticated
  using (public.auth_is_teacher_of_child(child_id));
