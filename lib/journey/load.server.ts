import "server-only";
import { createClient } from "@/lib/supabase/server";
import { hasFullAccessFromProfile } from "@/lib/plan/access";
import { withCurrentPlan } from "@/lib/placement/current-plan";
import type { PlacementResult } from "@/lib/placement/types";
import type { JourneySnapshot } from "./types";

/** One authenticated snapshot: never paint a free paywall before billing resolves. */
export async function loadJourneySnapshot(childId?: string): Promise<JourneySnapshot | null> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  let childQuery = db.from("children").select("*").eq("parent_id", user.id);
  if (childId) childQuery = childQuery.eq("id", childId);
  const [childRow, profileRow] = await Promise.all([
    childQuery.order("created_at", { ascending: true }).limit(1).maybeSingle(),
    db.from("profiles").select("plan, created_at, had_subscription").eq("id", user.id).single(),
  ]);
  if (childRow.error || profileRow.error || !profileRow.data)
    throw new Error("Could not load your reading journey.");
  if (!childRow.data) return null;
  const child = childRow.data;
  const [practice, progress, placement] = await Promise.all([
    db.from("practice_results").select("standard_id, questions_correct").eq("child_id", child.id),
    db.from("lessons_progress").select("lesson_id, section, score").eq("child_id", child.id),
    db
      .from("placements")
      .select("id, enrolled, decision, evidence, moments, plan, duration_seconds, created_at")
      .eq("child_id", child.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (practice.error || progress.error || placement.error)
    throw new Error("Could not load your reading journey.");
  const row = placement.data;
  const result: PlacementResult | null = row
    ? withCurrentPlan(
        {
          id: row.id,
          childId: child.id,
          childName: child.first_name || "Reader",
          enrolled: row.enrolled,
          decision: row.decision,
          moments: row.moments ?? [],
          plan: row.plan,
          narration: [],
          passageRecordingPath: null,
          durationSeconds: row.duration_seconds ?? 0,
          createdAt: row.created_at,
        },
        row.evidence,
      )
    : null;
  return {
    child,
    result,
    practice: practice.data ?? [],
    lessonProgress: progress.data ?? [],
    billing: {
      fullAccess: hasFullAccessFromProfile(profileRow.data),
      eligibleForTrial: !profileRow.data.had_subscription,
      signupAt: profileRow.data.created_at,
    },
  };
}
