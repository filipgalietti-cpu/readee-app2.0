-- `role` was the last sensitive profiles column a session could write.
--
-- Migration 137 revoked plan and the Stripe columns but deliberately left role
-- alone, because classroom teacher signup set it through the user's session. A
-- signed-in account could therefore promote itself to 'educator' straight
-- through PostgREST, with no teacher signup involved.
--
-- Two things changed. B2B is switched off, so being an educator now reaches
-- nothing. And the three legitimate writers (the OAuth callback's first-sign-in
-- stamp, and the two classroom role actions) now use the service role, so the
-- decision is still theirs but the write is server-side.
--
-- Revoking rather than leaving it inert on purpose: "harmless because the doors
-- are shut" stops being true the moment someone opens a door.
revoke update (role) on public.profiles from authenticated;
revoke update (role) on public.profiles from anon;
