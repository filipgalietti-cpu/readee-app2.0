-- Journey rewards: track which treasure chests / the trophy a child has already
-- opened, so each one pays out carrots exactly once. Holds chest node ids
-- (e.g. "chest1") plus the literal "__trophy__" for the end-of-journey trophy.
alter table public.children
  add column if not exists opened_chests text[] not null default '{}';

comment on column public.children.opened_chests is
  'Journey reward chests/trophy the child has already opened (chest node ids + the literal __trophy__). Used so each reward pays carrots exactly once.';
