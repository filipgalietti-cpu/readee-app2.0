-- Teachers don't have SELECT access on schools by default. This
-- SECURITY DEFINER lookup lets a logged-in teacher find a school by
-- its join code so they can link their classroom to it — no admin
-- scope needed.

create or replace function public.find_school_by_join_code(p_code text)
returns table (id uuid, name text, district_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.name, s.district_id
  from schools s
  where s.join_code = upper(p_code)
  limit 1;
$$;

grant execute on function public.find_school_by_join_code(text) to authenticated;
