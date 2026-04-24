-- Expose the live quiz tables to Supabase Realtime so the teacher's
-- host view can stream participant joins + answer submissions without
-- polling. Students sync via broadcast channels instead (they have no
-- Supabase auth JWT so postgres_changes RLS wouldn't work for them).

alter publication supabase_realtime add table public.live_quiz_sessions;
alter publication supabase_realtime add table public.live_quiz_participants;
alter publication supabase_realtime add table public.live_quiz_answers;
