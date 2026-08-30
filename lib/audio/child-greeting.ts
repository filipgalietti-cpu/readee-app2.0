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
    const res = await generateSpeechVertex({
      text: `Welcome, ${name}! Time to warm up!`,
      voice: "Autonoe",
    });
    if (!res.ok) return;
    // PCM (24kHz mono s16le) -> WAV container so browsers can play it without ffmpeg.
    const pcm = Buffer.from(res.pcmBase64, "base64");
    const wav = pcmToWav(pcm, 24000);
    const admin = supabaseAdmin();
    const path = `greetings/${childId}.wav`;
    const { error } = await admin.storage.from("audio").upload(path, wav, {
      contentType: "audio/wav",
      upsert: true,
    });
    if (error) return;
    const { data } = admin.storage.from("audio").getPublicUrl(path);
    await admin.from("children").update({ greeting_audio_url: data.publicUrl }).eq("id", childId);
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
