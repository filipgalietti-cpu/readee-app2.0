import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { loadJourneySnapshot } from "@/lib/journey/load.server";
import { UNIT_VERSION, isApprovedId, UNIT_ONE } from "./catalogue";
import { unitHasAccess } from "./entitlement";
export const unitOneEnabled = () => process.env.APPROVED_K_UNIT_ONE_ENABLED === "true";
export async function unitAccess(child: string, lesson: string) {
  if (!unitOneEnabled() || !isApprovedId(lesson)) return { error: 404 as const };
  const db = await createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return { error: 401 as const };
  const snapshot = await loadJourneySnapshot(child);
  if (!snapshot) return { error: 404 as const };
  if (!unitHasAccess(snapshot, lesson)) return { error: 403 as const };
  if (lesson === "k-unit-1-checkpoint") {
    const { data: rows, error } = await db
      .from("approved_unit_sessions")
      .select("lesson_id,completed")
      .eq("child_id", child)
      .eq("release_id", UNIT_VERSION)
      .eq("completed", true);
    if (error) return { error: 503 as const };
    if (!UNIT_ONE.every((l) => rows?.some((r) => r.lesson_id === l.id)))
      return { error: 409 as const };
  }
  return { user, db, admin: supabaseAdmin() };
}
