-- Multi-select intents for the teacher onboarding step 3.
-- profiles.intent stays for backward compat (the primary pick), and
-- profiles.intents holds the full set selected. Each item in the
-- array must match the same allowed values as profiles.intent.
alter table public.profiles
  add column if not exists intents text[];
