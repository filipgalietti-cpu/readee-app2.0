/**
 * Personal greeting synthesis — runs once, server-side, the moment a child's
 * name is submitted (child creation). "Welcome, Maya! Time to warm up!" is
 * recorded with the same Autonoe voice as everything else, uploaded to the
 * audio bucket, and stored on the children row. Zero live TTS afterward.
 *
 * Fire-and-forget by design: greeting synthesis must never block or fail a
 * child-creation request. Callers invoke `void synthesizeChildGreeting(...)`.
 */
import { generateSpeechVertex } from "@/lib/ai/vertex-tts";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function synthesizeChildGreeting(childId: string, firstName: string): Promise<void> {
  try {
    const name = (firstName ?? "").trim().slice(0, 24);
    if (!name) return;
    let res = await generateSpeechVertex({
      text: `Welcome, ${name}! Time to warm up!`,
      voice: "Autonoe",
    });
    if (!res.ok) {
      // one paced retry — Vertex 429s are transient (the batch backfill proved it)
      await new Promise((r) => setTimeout(r, 4000));
      res = await generateSpeechVertex({ text: `Welcome, ${name}! Time to warm up!`, voice: "Autonoe" });
      if (!res.ok) return;
    }
    // PCM (24kHz mono s16le) -> WAV container so browsers can play it without ffmpeg.
    const pcm = Buffer.from(res.pcmBase64, "base64");
    const wav = pcmToWav(pcm, 24000);
    const admin = supabaseAdmin();
    const path = `greetings/${childId}.wav`;
    // PRIVATE bucket — this is a clip speaking the child's real first name;
    // it must not be world-readable (COPPA). Store the PATH; the reader signs
    // a short-TTL URL behind an ownership check via /api/child-audio.
    const { error } = await admin.storage.from("child-audio").upload(path, wav, {
      contentType: "audio/wav",
      upsert: true,
    });
    if (error) return;
    await admin.from("children").update({ greeting_audio_url: path }).eq("id", childId);
  } catch {
    // greeting is a garnish; the child record must never suffer for it
  }
}

function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/**
 * PLACEMENT NAME PACK — the two lines of the placement that say the child's
 * name, synthesized once per child into the same private bucket. Idempotent:
 * skips clips that already exist. Fire-and-forget like the greeting; the
 * runner falls back to the generic clips when a pack clip is missing.
 *
 *   greetings/<childId>-hi.wav     "Hi, Maya!"
 *   greetings/<childId>-climb.wav  "Wow, Maya, look how far you climbed."
 */
export const NAME_PACK_LINES: Record<"hi" | "climb", (name: string) => string> = {
  hi: (name) => `Hi, ${name}!`,
  climb: (name) => `Wow, ${name}, look how far you climbed.`,
};

export async function synthesizeChildNamePack(childId: string, firstName: string): Promise<void> {
  const name = (firstName ?? "").trim().split(" ")[0]?.slice(0, 24) ?? "";
  if (!name || !/^[0-9a-f-]{36}$/.test(childId)) return;
  const admin = supabaseAdmin();
  for (const key of ["hi", "climb"] as const) {
    const path = `greetings/${childId}-${key}.wav`;
    try {
      const { data: existing } = await admin.storage.from("child-audio").list("greetings", { search: `${childId}-${key}.wav`, limit: 1 });
      if (existing && existing.length > 0) continue;
      let res = await generateSpeechVertex({ text: NAME_PACK_LINES[key](name), voice: "Autonoe" });
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 4000));
        res = await generateSpeechVertex({ text: NAME_PACK_LINES[key](name), voice: "Autonoe" });
        if (!res.ok) continue;
      }
      const wav = pcmToWav(Buffer.from(res.pcmBase64, "base64"), 24000);
      await admin.storage.from("child-audio").upload(path, wav, { contentType: "audio/wav", upsert: true });
    } catch {
      // a missing pack clip only costs the child a generic greeting
    }
  }
}
