-- Pin the search_path on award_carrots. Supabase's linter flags a mutable
-- search_path (0011_function_search_path_mutable) because a caller can set a
-- schema ahead of public and shadow the objects a function references. Every
-- other function in this database already pins it.
alter function public.award_carrots(uuid, integer, boolean) set search_path = public;
