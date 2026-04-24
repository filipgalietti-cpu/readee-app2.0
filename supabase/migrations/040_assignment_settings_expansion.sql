-- More assignment-level controls teachers asked for:
-- - shuffle_questions: randomize Q order per student (default off, so all kids
--   experience the same sequence unless teacher opts in)
-- - shuffle_choices: randomize choice order (default ON — prevents gaming by
--   memorizing "always pick B")
-- - reveal_correct_immediately: after each check, show what was correct
--   (default ON). Off = no per-question feedback, just the final score.
-- - attempts_allowed: null = unlimited, 1 = single attempt. Students can
--   keep taking it until they pass (matches current behavior with pass_threshold).

alter table public.assignments
  add column shuffle_questions boolean not null default false,
  add column shuffle_choices boolean not null default true,
  add column reveal_correct_immediately boolean not null default true,
  add column attempts_allowed integer
    check (attempts_allowed is null or attempts_allowed > 0);
