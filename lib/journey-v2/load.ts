/**
 * V2 JOURNEY LOADER — server-only. Reads the child, the latest placement, the
 * V2 progress rows, and the account's access, then builds the map.
 *
 * Where the walk starts: the placement's entry band (plan.entryBand, the band
 * the decision placed the child in). Without a placement, the enrolled grade.
 * The placement's tailoring (plan.tailoring: credits, difficulty, priority,
 * the "why" lines) and its dated milestones ride along. The V2 spine is K-2
 * content today, so a walk that starts above that stays on the legacy journey
 * (isV2Journey === false) until the factory lands 3rd and 4th grade.
 */
import { createClient } from "@/lib/supabase/server";
import { getServerAccess } from "@/lib/plan/check-access";
import { gradeFinal, journeyCatalog } from "./catalog";
import { bandFromGrade, buildJourney, V2_MAX_START_BAND } from "./journey";
import type { Band } from "./roadmap.gen";
import type { JourneyTailoring } from "./tailor";
import type { JourneyView, ProgressRow, RoadMilestone } from "./types";

export interface JourneyChild {
  id: string;
  firstName: string;
  grade: string | null;
  readingLevel: string | null;
  outfitId: string | null;
  carrots: number;
}

export interface LoadedJourney {
  child: JourneyChild;
  startBand: Band;
  enrolledBand: Band;
  hasPlacement: boolean;
  /** False when the child belongs on the legacy journey (start band above the V2 content). */
  isV2Journey: boolean;
  view: JourneyView;
  /** The placement's cut, when the child has one. */
  tailoring: JourneyTailoring | null;
  milestones: RoadMilestone[];
}

type Sb = Awaited<ReturnType<typeof createClient>>;

/** The signed-in parent's child: the one asked for, else the first one (multi-child is deprecated; children[0] rules). */
export async function resolveChild(supabase: Sb, parentId: string, childId: string | null): Promise<JourneyChild | null> {
  let q = supabase.from("children").select("id, first_name, grade, reading_level, equipped_items, carrots, created_at").eq("parent_id", parentId);
  q = childId ? q.eq("id", childId) : q.order("created_at", { ascending: true }).limit(1);
  const { data } = await q.maybeSingle();
  if (!data) return null;
  const row = data as { id: string; first_name: string | null; grade: string | null; reading_level: string | null; equipped_items?: { outfit?: string | null } | null; carrots?: number | null };
  return {
    id: row.id,
    firstName: (row.first_name ?? "").split(" ")[0] || "Reader",
    grade: row.grade,
    readingLevel: row.reading_level,
    outfitId: row.equipped_items?.outfit ?? null,
    carrots: row.carrots ?? 0,
  };
}

type LatestPlacement = { entryBand: Band | null; tailoring: JourneyTailoring | null; milestones: RoadMilestone[] };

async function latestPlacement(supabase: Sb, childId: string): Promise<LatestPlacement> {
  const none: LatestPlacement = { entryBand: null, tailoring: null, milestones: [] };
  const { data } = await supabase.from("placements").select("plan, decision").eq("child_id", childId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!data) return none;
  const plan = (data as { plan?: { entryBand?: number; tailoring?: JourneyTailoring; milestones?: RoadMilestone[] } }).plan;
  const decision = (data as { decision?: { placedBand?: number } }).decision;
  const b = plan?.entryBand ?? decision?.placedBand;
  return {
    entryBand: typeof b === "number" && b >= 0 && b <= 4 ? (b as Band) : null,
    tailoring: plan?.tailoring?.version === 1 ? plan.tailoring : null,
    milestones: Array.isArray(plan?.milestones) ? plan!.milestones!.map((m) => ({ label: m.label, month: m.month, date: m.date })) : [],
  };
}

export async function loadProgress(supabase: Sb, childId: string): Promise<ProgressRow[]> {
  const { data } = await supabase.from("journey_v2_progress").select("item_type, item_id, unit_id, score, passed, completed_at, source").eq("child_id", childId);
  return (data ?? []) as ProgressRow[];
}

/**
 * Build the journey for one of the signed-in parent's children. Returns null
 * when there is no such child. `fullAccess` may be passed by callers that
 * already resolved it (the dashboard does); otherwise it is read here.
 */
export async function loadJourney(opts: { parentId: string; childId: string | null; fullAccess?: boolean }): Promise<LoadedJourney | null> {
  const supabase = await createClient();
  const child = await resolveChild(supabase, opts.parentId, opts.childId);
  if (!child) return null;
  const [placement, progress, access] = await Promise.all([
    latestPlacement(supabase, child.id),
    loadProgress(supabase, child.id),
    opts.fullAccess === undefined ? getServerAccess() : Promise.resolve(null),
  ]);
  const enrolledBand = bandFromGrade(child.grade);
  const startBand = placement.entryBand ?? enrolledBand;
  const fullAccess = opts.fullAccess ?? access?.hasFullAccess ?? false;
  const catalog = journeyCatalog();
  const t = placement.tailoring;
  const view = buildJourney({
    childId: child.id,
    catalog,
    finals: { 0: gradeFinal(0), 1: gradeFinal(1), 2: gradeFinal(2), 3: gradeFinal(3), 4: gradeFinal(4) },
    startBand,
    enrolledBand,
    progress,
    fullAccess,
    difficulty: t?.difficulty,
    priorityDomains: t?.priorityDomains,
    why: t?.why,
    milestones: placement.milestones,
  });
  return { child, startBand, enrolledBand, hasPlacement: placement.entryBand !== null, isV2Journey: startBand <= V2_MAX_START_BAND, view, tailoring: t, milestones: placement.milestones };
}
