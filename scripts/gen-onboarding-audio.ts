/** Onboarding welcome clips (Autonoe) → Supabase storage audio/onboarding/welcome-{n}.mp3.
 *  Run: npx tsx scripts/gen-onboarding-audio.ts */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { generateSpeechVertex } from "../lib/ai/vertex-tts";
import { supabaseAdmin } from "../lib/supabase/admin";

const CLIPS: [string, string][] = [
  ["welcome-2", "Welcome to Readee! What is your name?"],
];

async function main() {
  const admin = supabaseAdmin();
  for (const [id, text] of CLIPS) {
    const res = await generateSpeechVertex({ text, voice: "Autonoe" });
    if (!res.ok) { console.log(id, "TTS FAIL", res.error.slice(0, 80)); continue; }
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "ob-"));
    const pcm = path.join(tmp, "a.pcm"), mp3 = path.join(tmp, `${id}.mp3`);
    await fs.writeFile(pcm, Buffer.from(res.pcmBase64, "base64"));
    const ff = spawnSync("ffmpeg", ["-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm, "-af", "loudnorm=I=-18:TP=-2:LRA=7", "-codec:a", "libmp3lame", "-qscale:a", "2", mp3]);
    if (ff.status !== 0) { console.log(id, "ffmpeg FAIL"); continue; }
    const buf = await fs.readFile(mp3);
    const { error } = await admin.storage.from("audio").upload(`onboarding/${id}.mp3`, buf, { contentType: "audio/mpeg", upsert: true });
    console.log(id, error ? "UPLOAD FAIL " + error.message : `uploaded (${buf.length} bytes)`);
  }
}
main();
