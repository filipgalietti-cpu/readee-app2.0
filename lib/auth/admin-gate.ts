/**
 * Shared admin gates.
 *
 * Three audiences, three checks:
 *
 * - hasAnyAdminAccess: anyone with admin scope at all (platform OR
 *   B2B district/school). Used for platform-tools that we let any
 *   admin into (batch QC queue, content audit findings).
 *
 * - isPlatformAdmin: ONLY Readee owners (platform_admins table).
 *   Used to scope the owner / business dashboard. School / district
 *   admins are NOT this — they get their own tenant-scoped admin
 *   pages at /admin/school/[id] or /admin/district/[id].
 */

import { createClient } from "@/lib/supabase/server";

export async function isPlatformAdmin(profileId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_admins")
    .select("profile_id")
    .eq("profile_id", profileId)
    .maybeSingle();
  return !!data;
}

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
