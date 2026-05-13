-- published_state = the operator-visible publication state of a
-- content row. Distinct from qc_overall (which is the automated
-- judgment of quality). A piece can be qc='pass' but published_state
-- ='hidden' (operator pulled it for editorial reasons). A piece can
-- be qc='fail' and published_state='live' only if the operator
-- explicitly overrode the gate — but that's not the default path.
--
-- Default 'live' for backward compatibility. The post-migration UPDATE
-- demotes any qc_overall='fail' rows to 'hidden' so the existing
-- fail-rate doesn't surface publicly.

alter table public.discovery_articles
  add column if not exists published_state text not null default 'live';

alter table public.daily_questions
  add column if not exists published_state text not null default 'live';

alter table public.differentiated_passages
  add column if not exists published_state text not null default 'live';

-- One-shot demotion of currently-failing content. Auto-heal can
-- re-promote them later.
update public.discovery_articles
  set published_state = 'hidden'
  where qc_overall = 'fail' and published_state = 'live';
update public.daily_questions
  set published_state = 'hidden'
  where qc_overall = 'fail' and published_state = 'live';
update public.differentiated_passages
  set published_state = 'hidden'
  where qc_overall = 'fail' and published_state = 'live';

create index if not exists discovery_articles_published_state_idx
  on public.discovery_articles (published_state);
create index if not exists daily_questions_published_state_idx
  on public.daily_questions (published_state);
create index if not exists differentiated_passages_published_state_idx
  on public.differentiated_passages (published_state);

comment on column public.discovery_articles.published_state is
  'Operator publication state: live | hidden | archived. Filters public reads.';
comment on column public.daily_questions.published_state is
  'Operator publication state: live | hidden | archived. Filters public reads.';
comment on column public.differentiated_passages.published_state is
  'Operator publication state: live | hidden | archived. Filters public reads.';
