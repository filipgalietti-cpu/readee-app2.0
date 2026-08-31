-- Dedupe key for notifications so the daily-nudge cron (and per-event inserts)
-- can't stack the same notification twice. NULLs are distinct in a unique
-- index (Postgres default), so non-deduped notifications are unaffected;
-- only rows that set the same (user_id, dedupe_key) collapse to one.
alter table notifications add column if not exists dedupe_key text;

create unique index if not exists notifications_user_dedupe_key
  on notifications (user_id, dedupe_key);
