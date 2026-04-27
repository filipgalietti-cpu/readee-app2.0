-- Track which leveled passage and level produced an assignment so we can
-- prevent assigning the same passage to the same class at two different
-- difficulties.

alter table public.assignments
  add column if not exists source_passage_id uuid references public.differentiated_passages(id) on delete set null,
  add column if not exists source_level text check (source_level is null or source_level in ('easy','on_level','advanced'));

-- One leveled passage can only be assigned to a class once (at one level).
-- Partial unique index — only enforces when source_passage_id is set, so
-- normal assignments (lessons, ad-hoc quizzes) are unaffected.
create unique index if not exists assignments_classroom_passage_uniq
  on public.assignments (classroom_id, source_passage_id)
  where source_passage_id is not null;
