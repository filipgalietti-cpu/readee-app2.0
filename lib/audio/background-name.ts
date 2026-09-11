"use client";

import { reportFailure } from "@/lib/observability/critical";

export type NameRecording = { audioBase64: string; mimeType: string; name: string };

// Owned by the assessment session, not the short-lived name screen. No audio
// is stored in browser storage. The server saves the pronunciation before replying.
const pending = new Map<string, Promise<void>>();
export function startNamePronunciation(childId: string, recording: NameRecording): void {
  if (pending.has(childId)) return;
  const job = (async () => {
    try {
      const response = await fetch("/api/child-name/respell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(40000),
        body: JSON.stringify({ ...recording, childId }),
      });
      if (!response.ok) throw new Error("Name pronunciation could not save.");
    } catch (error) {
      // A name is not assessment evidence. Keep the written/previous name and
      // let reading continue if pronunciation inference or saving is unavailable.
      reportFailure("placement.name_pronunciation", error, { route: "/placement" });
    }
  })();
  pending.set(childId, job);
  void job.finally(() => { if (pending.get(childId) === job) pending.delete(childId); });
}

/** Complete must read the saved pronunciation before generating report narration. */
export async function settleNamePronunciation(childId: string): Promise<void> {
  await pending.get(childId);
}
