-- Optional 4-digit "grown-up PIN" on the parent profile.
--
-- Used as the exit gate from kid play-mode. When set, exiting
-- /play/[childId] requires the PIN. When not set, it falls back to
-- the account password (Supabase reauth). Hashed with SHA-256 +
-- per-user salt — not bank-grade security, but adequate for "stop
-- a 6-year-old from clicking into /admin."

alter table public.profiles
  add column if not exists parent_pin_hash text,
  add column if not exists parent_pin_salt text;
