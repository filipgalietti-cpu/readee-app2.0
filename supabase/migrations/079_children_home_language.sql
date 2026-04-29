-- Add per-kid home language so the app can route parent comms to L1
-- and offer a one-tap "Show in home language" toggle inside student-
-- facing readers. Drives Multilingual Family Mode.
--
-- Codes match SUPPORTED_LANGUAGES in lib/ai/translate.ts:
--   en (default English), es, zh, vi, ar, fr, ht, pt, tl, ru, ko.
-- NULL means English-only / unknown.

alter table children
  add column if not exists home_language text;

comment on column children.home_language is
  'ISO-style code (en/es/zh/vi/ar/fr/ht/pt/tl/ru/ko) of the family''s home language. Drives auto-translation of parent comms, passage display in L1, and ELL workflows. NULL means English-only or unknown.';

create index if not exists children_home_language_idx
  on children (home_language)
  where home_language is not null;
