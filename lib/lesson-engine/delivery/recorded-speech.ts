/** Authoring plan for explicit recorded sound units. Never send /phoneme/ to TTS. */
export type RecordedUnit = {
  src: string;
  sha256: string;
  sourcePath: string;
  reviewStatus: string;
};
export type SpeechPart =
  | { kind: "text"; text: string }
  | { kind: "recording"; text: string; unit: RecordedUnit };
export type RecordedComposition = {
  src: string;
  audioSha256: string;
  parts: Array<{
    kind: "text" | "recording";
    text: string;
    src: string;
    sha256: string;
    start: number;
    end: number;
  }>;
};
export function recordedCompositionIssue(
  text: string,
  track: RecordedComposition | undefined,
  manifest: Record<string, string>,
  units?: Record<string, RecordedUnit>,
): string | null {
  if (
    !track ||
    track.src !== manifest[text] ||
    !/^[a-f0-9]{64}$/.test(track.audioSha256) ||
    !Array.isArray(track.parts) ||
    !track.parts.length
  )
    return "Missing or stale recorded-speech composition";
  const expected = [...text.matchAll(/\/[^/\s]+\//g)].map((m) => m[0]);
  if (
    JSON.stringify(expected) !==
    JSON.stringify(track.parts.filter((p) => p.kind === "recording").map((p) => p.text))
  )
    return "Recorded sounds differ from the authored sequence";
  for (let i = 0; i < track.parts.length; i++) {
    const p = track.parts[i];
    if (p.kind !== "text" && p.kind !== "recording") return "Unknown speech component";
    if (
      p.kind === "recording" &&
      units &&
      (p.src !== units[p.text]?.src || p.sha256 !== units[p.text]?.sha256)
    )
      return "Recorded sound source changed";
    if (
      !/^[a-f0-9]{64}$/.test(p.sha256) ||
      !p.src.startsWith("/lesson-studio/") ||
      !Number.isFinite(p.start) ||
      !Number.isFinite(p.end) ||
      p.start < 0 ||
      p.end <= p.start ||
      (i > 0 && p.start < track.parts[i - 1].end)
    )
      return "Invalid recorded-speech boundary";
  }
  return null;
}
export function recordedSpeechParts(
  text: string,
  units: Record<string, RecordedUnit>,
): SpeechPart[] {
  const parts: SpeechPart[] = [];
  let cursor = 0;
  for (const m of text.matchAll(/\/[^/\s]+\//g)) {
    const prefix = text
      .slice(cursor, m.index)
      .replace(/^[\s.,!?;:]+/, "")
      .trim();
    if (prefix && /[a-z0-9]/i.test(prefix)) parts.push({ kind: "text", text: prefix });
    const unit = units[m[0]];
    if (!unit || !unit.src.startsWith("/lesson-studio/") || !/^[a-f0-9]{64}$/.test(unit.sha256))
      throw Error("Missing pinned recording for " + m[0]);
    parts.push({ kind: "recording", text: m[0], unit });
    cursor = m.index! + m[0].length;
  }
  const tail = text
    .slice(cursor)
    .replace(/^[\s.,!?;:]+/, "")
    .trim();
  if (tail && /[a-z0-9]/i.test(tail)) parts.push({ kind: "text", text: tail });
  if (
    parts.some((p) => p.kind === "recording") &&
    parts.some((p) => p.kind === "text" && !/[.!?]$/.test(p.text))
  )
    throw Error("Use complete spoken sentences around recorded sounds: " + text);
  return parts;
}
