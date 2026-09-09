import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Subscribe first, so an initial lookup cannot restore an identity after logout. */
export function bindErrorIdentity(auth: SupabaseClient["auth"]): () => void {
  let live = true;
  let changed = false;
  const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
    changed = true;
    if (live) Sentry.setUser(session?.user ? { id: session.user.id } : null);
  });
  void auth.getUser().then(({ data }) => {
    if (live && !changed) Sentry.setUser(data.user ? { id: data.user.id } : null);
  }).catch(() => { if (live && !changed) Sentry.setUser(null); });
  return () => { live = false; subscription.unsubscribe(); Sentry.setUser(null); };
}
