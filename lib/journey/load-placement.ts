import type { PlacementPlan } from "@/lib/placement/types";

export async function loadJourneyPlacement(childId: string): Promise<PlacementPlan | null> {
  const response = await fetch(`/api/placement/result?child=${encodeURIComponent(childId)}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
  const body = await response.json();
  if (!response.ok || !body.ok) throw new Error("Could not load the reading plan.");
  return body.result?.plan ?? null;
}
