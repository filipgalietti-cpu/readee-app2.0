-- Close a live privilege-escalation hole: any signed-in parent could grant
-- themselves Readee+ from the browser console.
--
-- `profiles_update_own` is FOR UPDATE USING (auth.uid() = id) with no
-- WITH CHECK, and Postgres RLS cannot restrict WHICH columns an update touches.
-- Supabase's default grants gave `authenticated` UPDATE on every column, so
--   supabase.from('profiles').update({ plan: 'premium' }).eq('id', <own uid>)
-- succeeded against the publishable key. Verified on production Sep 5 2026.
--
-- Fix at the grant layer, which is where column scope actually lives. Every
-- legitimate writer of these columns (Stripe webhook, promo redeem, owner
-- actions, checkout, reset-premium) uses the service_role admin client, which
-- bypasses grants entirely - so this revokes nothing the app relies on.
--
-- `role` is deliberately NOT revoked: classroom/actions.ts lets a user set
-- their own role to 'educator' through the user session, so revoking it would
-- break teacher self-signup. Revisit when that surface is retired.
--
-- ‼️ INSUFFICIENT ON ITS OWN - see 137. Supabase also holds a TABLE-level
-- GRANT UPDATE ON profiles TO authenticated, and a column-level REVOKE cannot
-- cut into a table-level grant (in Postgres, table-level UPDATE implies every
-- column). Verified right after applying: has_column_privilege for 'plan' was
-- still true. 137 does the real work; this file is kept so the migration
-- history replays honestly.

revoke update (plan, stripe_customer_id, stripe_subscription_id, had_subscription)
  on public.profiles from authenticated;

revoke update (plan, stripe_customer_id, stripe_subscription_id, had_subscription)
  on public.profiles from anon;
