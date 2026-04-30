/**
 * Shared admin gate. Admin status comes from EITHER:
 *   - platform_admins (Readee owners) OR
 *   - admin_memberships (B2B district/school admins)
 *
 * Pages can call hasAnyAdminAccess(profileId) → boolean.
 */

import { createClient } from "@/lib/supabase/server";

export async function hasAnyAdminAccess(profileId: string): Promise<boolean> {
  const supabase = await createClient();
  const [pa, am] = await Promise.all([
    supabase.from("platform_admins").select("profile_id").eq("profile_id", profileId).maybeSingle(),
    supabase.from("admin_memberships").select("id").eq("profile_id", profileId).limit(1),
  ]);
  if (pa.data) return true;
  if (am.data && am.data.length > 0) return true;
  return false;
}
