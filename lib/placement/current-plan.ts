import { buildPlan } from "./plan";
import { narrate } from "./narration";
import type { PlacementResult } from "./types";

/** Old reports use the corrected rules without rewriting their measured evidence.
 * Old narration is replaced with captions, since its audio may promise unsafe skips. */
export function withCurrentPlan(result: PlacementResult): PlacementResult {
  if (result.plan.version === 2 || result.plan.version === 3) return result;
  const today = new Date(result.createdAt);
  const plan = buildPlan({ decision: result.decision, moments: result.moments, today });
  return {
    ...result,
    plan,
    narration: narrate({
      childName: result.childName,
      pronoun: "they",
      decision: result.decision,
      moments: result.moments,
      plan,
      today,
    }),
  };
}
