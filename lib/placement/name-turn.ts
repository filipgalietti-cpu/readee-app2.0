/** Capture an optional name with the assessment's already-open microphone.
 * No recognizer, second stream, or assessment evidence belongs to this turn. */
export async function captureNameTurn(
  mic: { level: () => number; startRecording: () => void; stopRecording: () => Blob | null },
  action: () => string | null,
  cancelled: () => boolean,
  clock = { now: () => Date.now(), wait: (ms: number) => new Promise<void>((r) => setTimeout(r, ms)) },
): Promise<{ kind: "recorded"; recording: Blob } | { kind: "quiet" } | { kind: "skip" } | { kind: "cancelled" }> {
  const start = clock.now();
  let firstVoice: number | null = null;
  let lastVoice = start;
  let voicedTicks = 0;
  let recording: Blob | null = null;
  let outcome: "recorded" | "quiet" | "skip" | "cancelled" = "cancelled";
  mic.startRecording();
  try {
    while (!cancelled()) {
      const now = clock.now();
      if (mic.level() > 0.12) {
        firstVoice ??= now;
        lastVoice = now;
        voicedTicks++;
      }
      const choice = action();
      if (choice === "skip") { outcome = "skip"; break; }
      if (choice === "done" || (voicedTicks >= 3 && now - lastVoice >= 1800 && now - firstVoice! >= 2500)) {
        outcome = voicedTicks >= 3 ? "recorded" : "quiet";
        break;
      }
      if (now - start >= 30000) { outcome = "quiet"; break; }
      await clock.wait(100);
    }
  } finally {
    // Stop just this recording, keeping the stream alive for the reading turn.
    recording = mic.stopRecording();
  }
  return outcome === "recorded"
    ? recording?.size ? { kind: "recorded", recording } : { kind: "quiet" }
    : { kind: outcome };
}
