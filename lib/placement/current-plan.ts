import { decideSpectrum } from "./spectrum-decision";
import type { SpectrumEvidence } from "./spectrum";
import { buildPlan } from "./plan";
import { narrate } from "./narration";
import type { PlacementResult } from "./types";

/** Old reports use the corrected rules without rewriting their measured evidence.
 * Old narration is replaced with captions, since its audio may promise unsafe skips. */
export function withCurrentPlan(
  result: PlacementResult,
  evidence?: { spectrum?: SpectrumEvidence },
): PlacementResult {
  const reviseSpectrum = result.decision.spectrum && result.decision.spectrum.version < 3 && evidence?.spectrum;
  if (!reviseSpectrum && (result.plan.version === 2 || result.plan.version === 3)) return result;
  if (reviseSpectrum)
    result = {
      ...result,
      decision: decideSpectrum(result.enrolled, reviseSpectrum, new Date(result.createdAt)),
    };
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
