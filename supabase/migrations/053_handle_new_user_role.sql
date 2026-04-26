-- Fix handle_new_user trigger: default role to 'parent' (was 'student'),
-- and respect a `role` hint in auth.users.raw_user_meta_data so the
-- signup form can pass a teacher signal via supabase.auth.signUp's
-- `options.data` field.
--
-- Why this matters:
--   - The trigger was minting every new account with role='student',
--     which is the B2B classroom-owned-kid value. Real signups are
--     parents or educators using consumer/teacher entry points.
--   - There was no teacher signup path at all — every new email got
--     stuck as 'student' until manually flipped via the dev role-flip
--     endpoint.
--   - Now: signup form can pass `{ role: 'educator' }` (or 'parent')
--     in raw_user_meta_data, the trigger respects it, default falls
--     back to 'parent' for anyone who didn't specify.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'parent');
  if v_role not in ('parent', 'educator') then
    v_role := 'parent';
  end if;
  insert into public.profiles (id, email, role, onboarding_complete, created_at)
  values (new.id, new.email, v_role, false, now())
  on conflict (id) do nothing;
  return new;
end;
$$;
