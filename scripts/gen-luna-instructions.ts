/**
 * Generate Luna's mini-lesson INSTRUCTION clips — the spoken directions that
 * tell the kid exactly what to do at each step (captions alone don't work:
 * early readers can't read them). Same Vertex/Autonoe + ffmpeg pattern as
 * gen-luna-notquite.ts. Upload to Supabase storage audio/luna/.
 *
 * Usage: npx tsx scripts/gen-luna-instructions.ts
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
  "in a calm, warm reading-teacher voice to a young child. Clear and inviting, like guiding a five-year-old through a fun game";

const CLIPS: Record<string, string> = {
  "echome-1": "Say each sound after me!",
  "yourturn-1": "Now you say the word!",
  "wholeline-1": "Great! Now read the whole line again.",
  "listenline-1": "That was a tricky one! Listen to the whole line first.",
};

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
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "luna-instr-"));
  for (const [key, line] of Object.entries(CLIPS)) {
    const localMp3 = path.join(tmp, `${key}.mp3`);
    process.stdout.write(`▸ ${key}: "${line}" … `);
    await ttsToMp3(line, localMp3, tmp);
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
