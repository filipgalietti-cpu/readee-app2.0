/**
 * Teacher voice cloning via ElevenLabs.
 *
 * Margin: ElevenLabs Creator plan is $5/mo for 30K characters. At our
 * ~$0.30/1K char passthrough, a teacher generating 20 short reads/day
 * burns ~$3/mo of voice spend. Charge $9.99/mo "Cloned Voice" upcharge
 * over Teacher Solo and the unit is comfortably margin-positive.
 *
 * To enable: set ELEVENLABS_API_KEY on the server. The cloning endpoint
 * accepts a 30-90s sample of the teacher reading, returns a voice_id we
 * persist on profiles.voice_clone_id.
 */

import { trackError } from "@/lib/observability/track";

export type VoiceCloneResult =
  | { ok: true; voiceId: string }
  | { ok: false; error: string };

/**
 * Submits an audio sample to ElevenLabs Instant Voice Clone and returns
 * the new voice_id.
 *
 * audioBlob: caller passes a Blob/File of teacher's recorded sample
 *            (mp3/wav/m4a). 30-90 seconds works best.
 * name: human-readable label (we use "Readee — {teacher email}").
 */
export async function cloneTeacherVoice(input: {
  audio: Blob;
  name: string;
  description?: string;
}): Promise<VoiceCloneResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "Voice cloning requires ELEVENLABS_API_KEY. Set it in Vercel.",
    };
  }
  try {
    const form = new FormData();
    form.append("name", input.name.slice(0, 100));
    if (input.description) form.append("description", input.description.slice(0, 500));
    form.append("files", input.audio, "sample.mp3");
    const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: form,
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `ElevenLabs ${res.status}: ${body.slice(0, 240)}` };
    }
    const json = (await res.json()) as { voice_id?: string };
    if (!json.voice_id) {
      return { ok: false, error: "No voice_id returned." };
    }
    return { ok: true, voiceId: json.voice_id };
  } catch (e: any) {
    trackError(e, { route: "voice-clone.cloneTeacherVoice" });
    return { ok: false, error: e?.message ?? "Voice cloning failed." };
  }
}
