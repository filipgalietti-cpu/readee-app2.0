-- The actual fix for the privilege-escalation hole 136 aimed at and missed.
--
-- Postgres: a TABLE-level `GRANT UPDATE` implies update on every column, and a
-- column-level REVOKE cannot carve an exception out of it. Supabase ships that
-- table-level grant by default, so 136's column REVOKE was a silent no-op -
-- `has_column_privilege('authenticated','profiles','plan','UPDATE')` stayed true.
--
-- The only way to scope columns is: drop the table-level grant, then grant back
-- the columns that should be writable.
--
-- Granting back "everything except the sensitive four" rather than an
-- enumerated allowlist is deliberate. An allowlist silently breaks any
-- user-session write that was missed in the audit (onboarding, ToS, teacher
-- setup all write profiles); this form cannot, while still closing the hole.
-- A new sensitive column would need adding here, which is the tradeoff taken.
--
-- `id` is excluded: it is the PK and the FK to auth.users, and nothing updates it.
-- `role` is intentionally left writable - classroom/actions.ts lets a user set
-- their own role to 'educator' via the user session (teacher self-signup), so
-- revoking it would break that flow. Revisit when that surface is retired.
--
-- To revert: grant update on public.profiles to authenticated, anon;

do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by column_name)
    into cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'profiles'
    and column_name not in (
      'id', 'plan', 'stripe_customer_id', 'stripe_subscription_id', 'had_subscription'
    );

  revoke update on public.profiles from authenticated;
  revoke update on public.profiles from anon;

  execute format('grant update (%s) on public.profiles to authenticated', cols);
end $$;
