/** Optional authored demonstration cues. Validation proves identity/ranges, not phonological quality. */
export type ModelCueTrack = {
  src: string;
  audioSha256: string;
  wordOffset: number;
  wordDuration: number;
  syllables: Array<{ start: number; end: number }>;
};
export function modelCueIssue(
  model: { script: string; count: number },
  track: ModelCueTrack | undefined,
  manifest: Record<string, string>,
  timings: Record<string, { src: string; audioSha256: string }>,
): string | null {
  if (
    !track ||
    track.src !== manifest[model.script] ||
    track.src !== timings[model.script]?.src ||
    !/^[a-f0-9]{64}$/.test(track.audioSha256) ||
    track.audioSha256 !== timings[model.script]?.audioSha256
  )
    return "Missing or stale demonstration audio";
  if (
    !Number.isFinite(track.wordOffset) ||
    track.wordOffset < 0 ||
    !Number.isFinite(track.wordDuration) ||
    track.wordDuration <= 0 ||
    !Array.isArray(track.syllables) ||
    track.syllables.length !== model.count
  )
    return "Missing or invalid demonstration boundaries";
  for (let i = 0; i < track.syllables.length; i++) {
    const s = track.syllables[i];
    if (
      !Number.isFinite(s.start) ||
      !Number.isFinite(s.end) ||
      s.end <= s.start ||
      s.start < track.wordOffset - 0.001 ||
      s.end > track.wordOffset + track.wordDuration + 0.001 ||
      (i > 0 && s.start < track.syllables[i - 1].end - 0.001)
    )
      return "Demonstration cues fall outside the spoken word or overlap";
  }
  return null;
}
