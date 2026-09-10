import "server-only";
import { createClient } from "@/lib/supabase/server";
import { decideSpectrum } from "./spectrum-decision";
import type { SpectrumEvidence } from "./spectrum";
import type { PlacedBand } from "./ladder";
import { buildPlan } from "./plan";
import type { PlacementDecision } from "./decide";
import type { Moment, PlacementPlan } from "./types";

/** Read the saved plan under the signed-in parent's ownership, never from URL claims. */
export async function loadOwnedPlacementPlan(childId: string): Promise<PlacementPlan | null> {
  if (!/^[0-9a-f-]{36}$/i.test(childId)) return null;
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const child = await db
    .from("children")
    .select("id")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .maybeSingle();
  if (child.error) throw new Error("Could not load the reader. Please retry.");
  if (!child.data) return null;
  const saved = await db
    .from("placements")
    .select("plan, decision, evidence, enrolled, moments, created_at")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (saved.error) throw new Error("Could not load the reading plan. Please retry.");
  if (!saved.data) return null;
  const plan = saved.data.plan as PlacementPlan;
  const decision = saved.data.decision as PlacementDecision;
  if (decision?.spectrum && decision.spectrum.version < 3 && saved.data.evidence?.spectrum) {
    return buildPlan({
      decision: decideSpectrum(
        Number(saved.data.enrolled) as PlacedBand,
        saved.data.evidence.spectrum as SpectrumEvidence,
        new Date(saved.data.created_at),
      ),
      moments: (saved.data.moments ?? []) as Moment[],
      today: new Date(saved.data.created_at),
    });
  }
  return plan.version === 2 || plan.version === 3
    ? plan
    : buildPlan({
        decision: saved.data.decision as PlacementDecision,
        moments: (saved.data.moments ?? []) as Moment[],
        today: new Date(saved.data.created_at),
      });
}
