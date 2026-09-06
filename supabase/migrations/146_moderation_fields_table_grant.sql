-- 145 was a no-op, for the same reason 136 was: a column-level REVOKE cannot
-- carve an exception out of a TABLE-level grant, because in Postgres table-level
-- UPDATE implies every column. Verified after applying - has_column_privilege
-- for parent_testimonials.approved was still true.
--
-- The working shape, as in 137: drop the table grant, then grant back every
-- column except the moderation ones. Grant-back-everything-except rather than an
-- allowlist, so a column nobody enumerated does not silently lose its write.

do $$
declare cols text;
begin
  -- parent_testimonials: the owner writes their testimonial, never its verdict.
  select string_agg(quote_ident(column_name), ', ' order by column_name) into cols
    from information_schema.columns
   where table_schema = 'public' and table_name = 'parent_testimonials'
     and column_name not in ('id', 'user_id', 'approved', 'approved_at', 'approved_by');

  revoke update, insert on public.parent_testimonials from authenticated;
  revoke update, insert on public.parent_testimonials from anon;
  execute format('grant update (%s) on public.parent_testimonials to authenticated', cols);
  -- INSERT still needs user_id so the self_insert policy can match it.
  execute format('grant insert (%s, user_id) on public.parent_testimonials to authenticated', cols);

  -- community_passages: the owner writes the passage, never its status.
  select string_agg(quote_ident(column_name), ', ' order by column_name) into cols
    from information_schema.columns
   where table_schema = 'public' and table_name = 'community_passages'
     and column_name not in ('id', 'status', 'qc_status', 'auto_approved');

  revoke update, insert on public.community_passages from authenticated;
  revoke update, insert on public.community_passages from anon;
  execute format('grant update (%s) on public.community_passages to authenticated', cols);
  execute format('grant insert (%s) on public.community_passages to authenticated', cols);
end $$;
