-- Multi-select grades for teacher onboarding step 2.
-- profiles.default_grade stays for backward compat (the primary
-- pick), and profiles.default_grades holds the full set selected.
alter table public.profiles
  add column if not exists default_grades text[];
