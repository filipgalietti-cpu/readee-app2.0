"use server";

import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { createClient } from "@/lib/supabase/server";

/**
 * Saving a founder review.
 *
 * ‼️ EVERY export in a "use server" file is a callable RPC endpoint reachable by
 * any authenticated user who knows its name - that is how two unguarded modules
 * got into the September security audit. So both actions re-check the platform
 * admin gate themselves. The page-level gate protects the page, not the action.
 *
 * Writes are keyed on (lesson_slug, scene_id, reviewer_id) and upserted, so
 * flipping a thumb back and forth updates one row instead of accumulating
 * history. scene_id = "" is the lesson-level verdict.
 */

type Verdict = "up" | "down" | "";

async function requireAdmin() {
  const profile = await requireProfile();
  if (!profile || !(await isPlatformAdmin(profile.id))) {
    throw new Error("Not authorised.");
  }
  return profile;
}

/** Set or clear one category thumb on one scene (or the lesson, sceneId ""). */
export async function setVerdict(
  lessonSlug: string,
  sceneId: string,
  category: string,
  verdict: Verdict,
): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireAdmin();
  const supabase = await createClient();

  // Read-modify-write on the jsonb: a scene holds several categories and we are
  // only touching one of them.
  const { data: existing } = await supabase
    .from("lesson_reviews")
    .select("verdicts")
    .eq("lesson_slug", lessonSlug)
    .eq("scene_id", sceneId)
    .eq("reviewer_id", profile.id)
    .maybeSingle();

  const verdicts: Record<string, string> = { ...((existing?.verdicts as object) ?? {}) };
  if (verdict) verdicts[category] = verdict;
  else delete verdicts[category];

  const { error } = await supabase.from("lesson_reviews").upsert(
    {
      lesson_slug: lessonSlug,
      scene_id: sceneId,
      reviewer_id: profile.id,
      verdicts,
    },
    { onConflict: "lesson_slug,scene_id,reviewer_id" },
  );
  // supabase-js RESOLVES on an RLS denial rather than throwing, so the error has
  // to be read and returned - otherwise a refused write looks like a save.
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Set the free-text note on one scene (or the lesson, sceneId ""). */
export async function setNote(
  lessonSlug: string,
  sceneId: string,
  note: string,
): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("lesson_reviews").upsert(
    {
      lesson_slug: lessonSlug,
      scene_id: sceneId,
      reviewer_id: profile.id,
      note: note.trim() || null,
    },
    { onConflict: "lesson_slug,scene_id,reviewer_id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
