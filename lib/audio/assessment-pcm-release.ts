import { ASSESSMENT_PCM, pcmQualityProblems, type PcmMeasurements } from "./assessment-pcm-quality";
import { speechMatchesScript } from "./speech-script";
export type PcmReviewEntry = {
  script: string;
  sourceHash: string;
  audioSha256: string;
  transcript: string;
  measurements: PcmMeasurements;
  gainDb: number;
  status: string;
  listeningReview: string;
};
/** Technical eligibility is distinct from listening approval. Neither implies the other. */
export function pcmReleaseProblems(input: {
  scripts: Record<string, string>;
  entries: Record<string, PcmReviewEntry>;
  sourceHashes: Record<string, string>;
  audioHashes: Record<string, string>;
}): string[] {
  const errors: string[] = [];
  for (const [id, script] of Object.entries(input.scripts)) {
    const entry = input.entries[id];
    if (!entry) {
      errors.push(`${id}: missing recording`);
      continue;
    }
    if (entry.script !== script || entry.sourceHash !== input.sourceHashes[id])
      errors.push(`${id}: stale script or voice recipe`);
    if (entry.audioSha256 !== input.audioHashes[id] || !input.audioHashes[id])
      errors.push(`${id}: missing or altered audio`);
    if (
      entry.status !== "technical-pass" ||
      !speechMatchesScript(script, entry.transcript, ["Readee", "Luna", "Nia", "Nee-ah", "Kai"])
    )
      errors.push(`${id}: transcript verification required`);
    for (const issue of pcmQualityProblems(script, entry.measurements))
      errors.push(`${id}: ${issue}`);
  }
  for (const id of Object.keys(input.entries))
    if (!(id in input.scripts)) errors.push(`${id}: unknown recording`);
  return errors;
}
export const pcmReviewUrl = (id: string) =>
  `/audio/assessment-voice/${ASSESSMENT_PCM.version}/${id}.wav`;
