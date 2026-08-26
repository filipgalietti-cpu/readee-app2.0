/** Post-quiz summary voice set (Autonoe) → public/audio/quizzes-v2/_shared. Run once. */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { generateSpeechVertex } from "../lib/ai/vertex-tts";

const OUT = path.resolve(process.cwd(), "public/audio/quizzes-v2/_shared");
const CLIPS: [string, string][] = [
  ["sum-perfect-1", "Boo yah! A perfect score! Every single one right. You are unstoppable!"],
  ["sum-perfect-2", "Perfect score! Wow! Your bunny is doing a happy dance just for you!"],
  ["sum-perfect-3", "Incredible! You got them all! Give yourself a big high five!"],
  ["sum-great-1", "Great work! You were so close to perfect. Keep it up, superstar!"],
  ["sum-great-2", "Wow, awesome job! Just one tricky one. You're getting so strong!"],
  ["sum-great-3", "So good! Your bunny is super proud of you!"],
  ["sum-good-1", "Good effort! Every try makes your reading muscles stronger!"],
  ["sum-good-2", "Nice work today! Practice makes perfect, and you're on your way!"],
  ["sum-try-1", "That was a tough one, but you kept going, and that's what matters. Let's try again!"],
  ["sum-try-2", "Good try! Your bunny believes in you. One more hop and you've got this!"],
];

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  for (const [id, text] of CLIPS) {
    const res = await generateSpeechVertex({ text, voice: "Autonoe" });
    if (!res.ok) { console.log(id, "FAIL", res.error.slice(0, 60)); continue; }
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "qs-"));
    const pcm = path.join(tmp, "a.pcm"), mp3 = path.join(OUT, `${id}.mp3`);
    await fs.writeFile(pcm, Buffer.from(res.pcmBase64, "base64"));
    spawnSync("ffmpeg", ["-y","-f","s16le","-ar","24000","-ac","1","-i",pcm,"-af","loudnorm=I=-18:TP=-2:LRA=7","-codec:a","libmp3lame","-qscale:a","2",mp3]);
    console.log(id, "ok");
  }
}
main();
