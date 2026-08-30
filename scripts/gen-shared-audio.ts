/** Shared engine feedback clips (Autonoe): instant praise + nice-try. Run once. */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { generateSpeechVertex } from "../lib/ai/vertex-tts";

const OUT = path.resolve(process.cwd(), "public/audio/lessons-v2/_shared");
const CLIPS: [string, string][] = [
  ["praise-1", "That's right!"],
  ["praise-2", "You got it!"],
  ["praise-3", "Great job!"],
  ["nice-try", "Nice try! Let's keep going."],
  ["yes-1", "Yes!"],
  ["yes-2", "That's it!"],
  ["try-again", "Hmm, not quite. Try again!"],
];

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  for (const [id, text] of CLIPS) {
    const res = await generateSpeechVertex({ text, voice: "Autonoe" });
    if (!res.ok) { console.log(id, "FAIL", res.error.slice(0, 60)); continue; }
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "sh-"));
    const pcm = path.join(tmp, "a.pcm"), mp3 = path.join(OUT, `${id}.mp3`);
    await fs.writeFile(pcm, Buffer.from(res.pcmBase64, "base64"));
    spawnSync("ffmpeg", ["-y","-f","s16le","-ar","24000","-ac","1","-i",pcm,"-af","loudnorm=I=-18:TP=-2:LRA=7","-codec:a","libmp3lame","-qscale:a","2",mp3]);
    console.log(id, "ok");
  }
}
main();
