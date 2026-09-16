import { UNIT_VERSION, UNIT_ONE } from "@/lib/approved-unit/catalogue";
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { hasFullAccessFromProfile } from "@/lib/plan/access";
import { withCurrentPlan } from "@/lib/placement/current-plan";
import type { PlacedBand } from "@/lib/placement/ladder";
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
  const approvedUnitEnabled = process.env.APPROVED_K_UNIT_ONE_ENABLED === "true";
  const [practice, progress, placement, approved] = await Promise.all([
    db.from("practice_results").select("standard_id, questions_correct").eq("child_id", child.id),
    db.from("lessons_progress").select("lesson_id, section, score").eq("child_id", child.id),
    db
      .from("placements")
      .select("id, enrolled, decision, evidence, moments, plan, duration_seconds, created_at")
      .eq("child_id", child.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    approvedUnitEnabled
      ? db
          .from("approved_unit_sessions")
          .select("lesson_id,readiness:result->readiness")
          .eq("child_id", child.id)
          .eq("release_id", UNIT_VERSION)
          .eq("completed", true)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (practice.error || progress.error || placement.error || approved.error)
    throw new Error("Could not load your reading journey.");
  const row = placement.data;
  const enrolled = row ? Number(row.enrolled) : null;
  if (
    row &&
    (row.enrolled == null || !Number.isInteger(enrolled) || enrolled! < 0 || enrolled! > 4)
  )
    throw new Error("Could not load the enrollment grade.");
  const result: PlacementResult | null = row
    ? withCurrentPlan(
        {
          id: row.id,
          childId: child.id,
          childName: child.first_name || "Reader",
          enrolled: enrolled as PlacedBand,
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
  const readiness = approved.data?.find((a) => a.lesson_id === "k-unit-1-checkpoint")?.readiness;
  const examStatus =
    readiness && typeof readiness === "object" && !Array.isArray(readiness)
      ? readiness.status
      : undefined;
  return {
    child,
    approvedUnitEnabled,
    unitOneExamStatus:
      examStatus === "ready" || examStatus === "practice" || examStatus === "more-evidence"
        ? examStatus
        : undefined,
    completedStandards: UNIT_ONE.filter((l) =>
      approved.data?.some((a) => a.lesson_id === l.id),
    ).map((l) => l.standard),
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
