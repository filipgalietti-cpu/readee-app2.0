/**
 * What every parent email needs to know about a child, in one query bundle:
 * the next lesson on their journey, the latest placement's level, top need
 * and next milestone, and their streak. Server-only (admin client).
 */
import { supabaseAdmin } from "@/lib/supabase/admin";
import { computeJourneyProgress } from "@/lib/journey/next-lesson";
import { BAND_LABEL, type PlacedBand } from "@/lib/placement/ladder";
import type { PlacementDecision } from "@/lib/placement/decide";
import type { PlacementPlan } from "@/lib/placement/types";

export type ChildJourneyContext = {
  childId: string;
  firstName: string;
  grade: string | null;
  streak: number;
  /** The next lesson on the journey (title + unit), or null when the catalog is done. */
  nextLesson: { title: string; unit: string; standardId: string } | null;
  /** From the latest placement, when there is one. */
  placement: {
    levelLabel: string; // "2nd grade"
    readingLevelName: string; // "Growing Reader"
    topNeed: string | null; // "3rd-grade words"
    nextMilestone: { label: string; month: string } | null;
    lessons: number;
    weeks: number;
  } | null;
};

const UNIT_NAME: Record<string, string> = { RL: "Story Treasures", RI: "Fact Finders", RF: "Sound Workshop", L: "Word Magic" };
function unitOf(domain: string, grade: string): string {
  const d = domain.toLowerCase();
  const key = d.includes("literature") ? "RL" : d.includes("inform") ? "RI" : d.includes("foundational") ? "RF" : "L";
  return `${grade} ${UNIT_NAME[key]}`;
}

export async function childJourneyContext(childId: string): Promise<ChildJourneyContext | null> {
  const admin = supabaseAdmin();
  const { data: child } = await admin.from("children").select("id, first_name, grade, reading_level, streak_days").eq("id", childId).maybeSingle();
  if (!child) return null;
  const [{ data: practice }, { data: progress }, { data: placement }] = await Promise.all([
    admin.from("practice_results").select("standard_id, questions_correct").eq("child_id", childId),
    admin.from("lessons_progress").select("lesson_id, section, score").eq("child_id", childId),
    admin.from("placements").select("decision, plan").eq("child_id", childId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const journey = computeJourneyProgress({
    practice: (practice ?? []) as { standard_id: string; questions_correct: number }[],
    lessonProgress: (progress ?? []) as { lesson_id: string; section: string; score: number }[],
    readingLevel: (child.reading_level as string | null) ?? null,
  });
  const cur = journey.current;
  let placementCtx: ChildJourneyContext["placement"] = null;
  if (placement?.decision && placement?.plan) {
    const d = placement.decision as PlacementDecision;
    const p = placement.plan as PlacementPlan;
    const band = d.placedBand as PlacedBand;
    placementCtx = {
      levelLabel: band === 0 ? "kindergarten" : `${BAND_LABEL[band]} grade`,
      readingLevelName: d.readingLevelName,
      topNeed: d.needs[0] ?? null,
      nextMilestone: p.milestones[0] ? { label: p.milestones[0].label, month: p.milestones[0].month } : null,
      lessons: p.lessons,
      weeks: p.weeksAt10Min,
    };
  }
  return {
    childId,
    firstName: (String(child.first_name ?? "").split(" ")[0]) || "your reader",
    grade: (child.grade as string | null) ?? null,
    streak: Number(child.streak_days ?? 0),
    nextLesson: cur ? { title: cur.title, unit: unitOf(cur.domain, cur.grade), standardId: cur.standardId } : null,
    placement: placementCtx,
  };
}

/** The parent's first child's context (B2C: one reader per parent). */
export async function firstChildContext(parentId: string): Promise<ChildJourneyContext | null> {
  const admin = supabaseAdmin();
  const { data: kids } = await admin.from("children").select("id").eq("parent_id", parentId).order("created_at", { ascending: true }).limit(1);
  const id = (kids?.[0] as { id?: string } | undefined)?.id;
  return id ? childJourneyContext(id) : null;
}
