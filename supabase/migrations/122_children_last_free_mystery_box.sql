-- 122: daily free mystery box.
--
-- The mystery box is now free to open once every 24 hours (daily engagement
-- loop); extra opens within the window cost carrots. Track the last free
-- open on the child row so it can't be gamed by clearing localStorage.
-- Additive + safe.

alter table public.children
  add column if not exists last_free_mystery_box_at timestamptz;

comment on column public.children.last_free_mystery_box_at is
  'When the child last opened the FREE daily mystery box. Free again 24h later; extra opens within the window cost carrots.';
