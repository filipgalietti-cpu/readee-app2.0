import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateVerifiedSpeech, verifySpeech } from "@/lib/audio/verified-speech";
import { spokenNameOf } from "@/lib/audio/name-spoken";
import { withSpokenName } from "@/lib/audio/name-spoken";
import { reportFailure } from "@/lib/observability/critical";
import type { NarrationLine } from "./types";

const jobs = new Map<string, Promise<void>>();
/** Two workers, serialized atomic merges. A failed line remains retryable; existing clips survive. */
export function generatePlacementNarration(placementId: string, childName: string, saidAs?: string | null): Promise<void> {
  const running = jobs.get(placementId);
  if (running) return running;
  const job = generate(placementId, childName, saidAs).finally(() => jobs.delete(placementId));
  jobs.set(placementId, job);
  return job;
}
async function generate(placementId: string, childName: string, saidAs?: string | null) {
  const admin = supabaseAdmin();
  const { data: row, error } = await admin.from("placements").select("child_id,narration").eq("id", placementId).single();
  if (error || !row) throw new Error("Narration unavailable");
  const childId = String(row.child_id);
  const deadline = Date.now() + 60000;
  const lines = row.narration as NarrationLine[];
  const missing = lines.filter(line => !line.audioPath || line.audioVerified !== "script-v1");
  const generated = new Map<string, { text: string; path: string }>();
  let next = 0;
  let saves = Promise.resolve();
  async function worker() {
    while (next < missing.length && Date.now() < deadline) {
      const line = missing[next++];
      try {
        const script = withSpokenName(line.text, childName, saidAs);
        const names = [childName, spokenNameOf(childName, saidAs)];
        if (line.audioPath) {
          const { data: existing } = await admin.storage.from("child-audio").download(line.audioPath);
          if (existing && await verifySpeech(Buffer.from(await existing.arrayBuffer()), script, names)) {
            generated.set(line.id, { text: line.text, path: line.audioPath });
            saves = saves.catch(() => {}).then(persist);
            await saves;
            continue;
          }
        }
        const audio = await generateVerifiedSpeech(script, names);
        const path = `placement/${childId}/narr-${placementId.slice(0, 8)}-${line.id}.mp3`;
        const { error } = await admin.storage.from("child-audio").upload(path, audio, { contentType: "audio/mpeg", upsert: true });
        if (error) throw error;
        generated.set(line.id, { text: line.text, path });
        saves = saves.catch(() => {}).then(persist);
        await saves;
      } catch (error) {
        reportFailure("placement.narration", error, { route: "/api/placement/narration", eventType: line.id });
      }
    }
  }
  async function persist() {
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: latest, error: readError } = await admin.from("placements").select("narration").eq("id", placementId).single();
      if (readError || !latest) throw new Error("Narration unavailable");
      const narration = (latest.narration as NarrationLine[]).map(line => {
        const fresh = generated.get(line.id);
        return line.audioVerified !== "script-v1" && fresh?.text === line.text ? { ...line, audioPath: fresh.path, audioVerified: "script-v1" as const } : line;
      });
      // Compare-and-swap protects clips supplied by another server instance.
      const { data: saved, error: saveError } = await admin.from("placements").update({ narration }).eq("id", placementId).eq("narration", JSON.stringify(latest.narration)).select("id");
      if (saveError) throw new Error("Narration could not be saved");
      if (saved?.length) return;
    }
    throw new Error("Narration changed while saving");
  }
  await Promise.all([worker(), worker()]);
  await saves;
}
