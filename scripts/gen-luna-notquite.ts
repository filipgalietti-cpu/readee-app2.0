/**
 * Generate the dedicated "Hmm, not quite" Luna clips (notquite-1..4) and
 * upload to Supabase storage audio/luna/. Previously the reader reused the
 * `reread` clips ("read the whole sentence again") for a wrong first try,
 * which mismatched the moment. Same Vertex/Autonoe + ffmpeg pattern as
 * build-story-karaoke.ts.
 *
 * Usage: npx tsx scripts/gen-luna-notquite.ts
 * Requires .env.local (SUPABASE) + Vertex/Google ADC + ffmpeg.
 */
import { config as loadEnv } from "dotenv";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { generateSpeechVertex } from "@/lib/ai/vertex-tts";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Missing SUPABASE env in .env.local");
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const VOICE = "Autonoe";
const STYLE =
  "in a calm, warm reading-teacher voice to a young child. Gentle and encouraging - a soft 'almost!' tone, never disappointed or scolding";

const LINES = [
  "Hmm, not quite. Let's take another look.",
  "Oops, not quite. Give it one more go!",
  "So close! Let's try that once more.",
  "Almost! Let's look at it together.",
];

async function ttsToMp3(text: string, outMp3: string, tmp: string) {
  for (let attempt = 0; ; attempt++) {
    const res = await generateSpeechVertex({ text, voice: VOICE, style: STYLE });
    if (res.ok) {
      const pcm = path.join(tmp, "clip.pcm");
      fs.writeFileSync(pcm, Buffer.from(res.pcmBase64, "base64"));
      const ff = spawnSync(
        "ffmpeg",
        ["-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm, "-codec:a", "libmp3lame", "-qscale:a", "2", outMp3],
        { encoding: "utf-8" },
      );
      if (ff.status !== 0) throw new Error(`ffmpeg: ${ff.stderr?.slice(0, 160)}`);
      return;
    }
    if (/429|RESOURCE_EXHAUSTED|Quota/i.test(res.error || "") && attempt < 6) {
      await new Promise((r) => setTimeout(r, 12000 + attempt * 8000));
      continue;
    }
    throw new Error(`TTS: ${res.error}`);
  }
}

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "luna-notquite-"));
  for (let i = 0; i < LINES.length; i++) {
    const key = `notquite-${i + 1}`;
    const localMp3 = path.join(tmp, `${key}.mp3`);
    process.stdout.write(`▸ ${key}: "${LINES[i]}" … `);
    await ttsToMp3(LINES[i], localMp3, tmp);
    const up = await sb.storage.from("audio").upload(`luna/${key}.mp3`, fs.readFileSync(localMp3), {
      contentType: "audio/mpeg",
      upsert: true,
    });
    if (up.error) throw new Error(`upload ${key}: ${up.error.message}`);
    console.log(`ok → audio/luna/${key}.mp3`);
  }
  console.log("done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
