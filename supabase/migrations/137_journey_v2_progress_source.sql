-- Placement credits: a lesson the placement already proved is written as a
-- progress row with source = 'placement', so the journey can hide it from
-- the child's map (the map stays a curated route, not a crossed-out one)
-- and the parent can be told how many lessons were set aside.

alter table public.journey_v2_progress
  add column if not exists source text not null default 'play'
  check (source in ('play', 'placement'));
