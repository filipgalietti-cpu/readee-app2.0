import { ASSESSMENT_VOICE } from "./assessment-voice";
import { speechTokens } from "./speech-script";

/** Candidate delivery release; independent of the current production voice manifest. */
export const ASSESSMENT_PCM = {
  version: "autonoe-pcm-reading-v2",
  model: ASSESSMENT_VOICE.model,
  direction: ASSESSMENT_VOICE.direction,
  encoding: "pcm_s16le",
  sampleRate: 24000,
  targetLufs: -19,
  peakCeilingDb: -3,
} as const;
export type PcmMeasurements = {
  seconds: number;
  lufs: number;
  truePeakDb: number;
  sampleRate: number;
  channels: number;
  codec: string;
};
export function pcmGain(lufs: number, peak: number): number {
  if (!Number.isFinite(lufs) || !Number.isFinite(peak)) throw Error("Audio is silent or invalid");
  return Math.min(ASSESSMENT_PCM.targetLufs - lufs, ASSESSMENT_PCM.peakCeilingDb - peak);
}
export function pcmQualityProblems(script: string, m: PcmMeasurements): string[] {
  const errors: string[] = [];
  if (![m.seconds, m.lufs, m.truePeakDb].every(Number.isFinite) || m.seconds <= 0)
    return ["invalid or silent audio"];
  if (
    m.codec !== ASSESSMENT_PCM.encoding ||
    m.sampleRate !== ASSESSMENT_PCM.sampleRate ||
    m.channels !== 1
  )
    errors.push("inconsistent delivery format");
  if (m.truePeakDb > -2.8) errors.push("insufficient peak headroom");
  if (m.lufs < -22 || m.lufs > -18.5) errors.push("uneven loudness");
  const count = speechTokens(script).length;
  const wpm = (count * 60) / m.seconds;
  // Short choices and isolated phonemes cannot be judged by sentence-rate norms.
  if (count >= 12 && (wpm > 175 || wpm < 85)) errors.push("pace outside assessment delivery range");
  if (m.seconds > 4 + count * 0.8) errors.push("unexpectedly long recording");
  return errors;
}
