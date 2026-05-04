-- Extend community_passages so a teacher's custom_quiz can be the source.
--
-- Three origin paths now exist:
--   1. parent_passage — source_content_id set (forked from child_ai_content)
--   2. teacher_quiz   — source_quiz_id set (forked from custom_quizzes)
--   3. readee_seed    — neither set (Readee-authored seed content)
--
-- We enforce "at most one source" rather than "exactly one" to keep
-- the seeded Readee rows valid (they have no upstream source).
-- source_parent_id was repurposed to mean "the human who shared this"
-- regardless of role, so the existing select/withdraw policies
-- continue to work for both parents and teachers.

alter table public.community_passages
  alter column source_content_id drop not null;

alter table public.community_passages
  add column if not exists source_quiz_id uuid
    references public.custom_quizzes(id) on delete cascade;

alter table public.community_passages
  add column if not exists source_kind text
    not null default 'parent_passage'
    check (source_kind in ('parent_passage', 'teacher_quiz', 'readee_seed'));

create index if not exists community_passages_source_quiz_idx
  on public.community_passages (source_quiz_id);

alter table public.community_passages
  drop constraint if exists community_passages_source_one_of;
alter table public.community_passages
  add constraint community_passages_source_one_of check (
    not (source_content_id is not null and source_quiz_id is not null)
  );
