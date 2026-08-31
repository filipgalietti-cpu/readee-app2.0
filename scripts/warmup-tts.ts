/**
 * Warm-Up Arcade TTS — Autonoe clips for a warm-up's intro, calls, celebrate.
 *
 *   npx tsx scripts/warmup-tts.ts --warmup=sound-switch-hunt
 *   npx tsx scripts/warmup-tts.ts --warmup=rhyme-rain --only=w-hat,celebrate
 *
 * Synth/loudnorm/pacing machinery lives in scripts/warmup-tts-lib.ts, shared
 * with the volume generator (scripts/warmup-generate.ts).
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { WARMUPS } from "../app/data/warmups-v2";
import { recordWarmup } from "./warmup-tts-lib";

const id = (process.argv.find((a) => a.startsWith("--warmup=")) ?? "").split("=")[1];
if (!id || !WARMUPS[id]) {
  console.error(`Usage: npx tsx scripts/warmup-tts.ts --warmup=<id> (known: ${Object.keys(WARMUPS).join(", ")})`);
  process.exit(1);
}
// Targeted re-records ("--only=w-hat,celebrate") skip the rest of the set.
const only = (process.argv.find((a) => a.startsWith("--only=")) ?? "").split("=")[1]?.split(",").filter(Boolean);

recordWarmup(WARMUPS[id], { only }).then((r) => {
  if (r.failed.length) process.exitCode = 1;
});
