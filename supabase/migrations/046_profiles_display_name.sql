-- Restore display_name column on profiles.
--
-- Several legacy code paths (account page, ProfileContext, NavAuth,
-- promo redeem) referenced `profiles.display_name` but the column had
-- been dropped at some point. This re-adds it as nullable text and
-- backfills from the email username so existing users get a readable
-- fallback name immediately.
--
-- Future: surface an edit field in /account so teachers can override
-- their display name.

alter table public.profiles add column if not exists display_name text;

update public.profiles
set display_name = split_part(email, '@', 1)
where display_name is null and email is not null;
