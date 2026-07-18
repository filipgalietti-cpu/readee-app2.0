/**
 * Generate Autonoe TTS for the 3 per-question feedback lines
 * (correct / incorrect / reveal) and store the public URLs on each
 * question. Uses the working generateSpeech(gemini) pipeline — no
 * service-account file needed (GEMINI_API_KEY).
 *
 *   npx tsx scripts/gen-feedback-audio.ts RL.K.2         # one standard (pilot)
 *   npx tsx scripts/gen-feedback-audio.ts --grade K      # a whole grade
 *
 * Idempotent: skips a line that already has an *_audio_url. Writes the
 * URLs back into app/data/<grade>-standards-questions.json.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
import { generateSpeech } from "@/lib/ai/readee-ai";

const GRADE_FILE: Record<string, string> = {
  K: "kindergarten-standards-questions.json",
  "1": "1st-grade-standards-questions.json",
  "2": "2nd-grade-standards-questions.json",
  "3": "3rd-grade-standards-questions.json",
  "4": "4th-grade-standards-questions.json",
};
const DATA = path.join(process.cwd(), "app", "data");
const TEACHER = "readee-content";

const LINES: Array<[textKey: string, urlKey: string]> = [
  ["correct_feedback", "correct_feedback_audio_url"],
  ["incorrect_feedback", "incorrect_feedback_audio_url"],
  ["reveal_feedback", "reveal_feedback_audio_url"],
];

function gradeOf(std: string): string {
  return std.split(".")[1]; // RL.K.2 -> K
}

async function voice(text: string): Promise<string | null> {
  // Retry ALL failures (incl. transient "fetch failed" network drops that
  // killed the overnight run) with growing backoff.
  for (let attempt = 0; attempt < 5; attempt++) {
    const r: any = await generateSpeech({
      teacherId: TEACHER,
      text,
      voice: "Autonoe",
      // No provider override → defaults to VERTEX (gemini-2.5-pro-preview-tts,
      // the same engine the lessons used) when GOOGLE_APPLICATION_CREDENTIALS
      // is set. The old `provider:"gemini"` forced the whispery Flash model.
      // noFallback: on a Vertex blip, FAIL (don't silently return whispery
      // Gemini) so the retry below actually retries Vertex.
      noFallback: true,
    });
    if (r.ok) return r.audioUrl as string;
    console.error(`   ! ${r.error} (attempt ${attempt + 1}/5)`);
    await new Promise((res) => setTimeout(res, 3000 * (attempt + 1)));
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const gradeFlag = args.indexOf("--grade");
  const targetGrade = gradeFlag >= 0 ? args[gradeFlag + 1] : null;
  const targetStd = gradeFlag < 0 ? args[0] : null;

  const files = targetGrade
    ? [GRADE_FILE[targetGrade]]
    : targetStd
      ? [GRADE_FILE[gradeOf(targetStd)]]
      : [];
  if (!files[0]) {
    console.error("Usage: gen-feedback-audio.ts <STANDARD> | --grade <K|1|2|3|4>");
    process.exit(1);
  }

  let made = 0, skipped = 0, failed = 0;
  for (const file of files) {
    const p = path.join(DATA, file);
    const d = JSON.parse(await fs.readFile(p, "utf-8"));
    for (const s of d.standards) {
      if (targetStd && s.standard_id !== targetStd) continue;
      for (const q of s.questions ?? []) {
        // Prompt narration (reads the question + any embedded passage).
        // --overwrite-prompts re-voices even existing prompts (to replace
        // the old "goofy" voice with Autonoe). --feedback-only skips prompts.
        // Resumable overwrite: re-voice a prompt only if it hasn't already
        // been regenerated this campaign (q.audio_regen marks the good voice),
        // so a killed+relaunched run never re-does finished prompts.
        const overwrite = args.includes("--overwrite-prompts");
        const wantPrompt = !args.includes("--feedback-only") && q.prompt
          && (overwrite ? !q.audio_regen : !q.audio_url);
        if (wantPrompt) {
          const url = await voice(q.prompt);
          if (url) { q.audio_url = url; q.audio_regen = true; made++; process.stdout.write("p"); }
          else failed++;
        }
        // --overwrite-feedback re-voices the 3 feedback lines in the correct
        // Vertex voice (the earlier batch was whispery Flash). Resumable via
        // q.fb_regen so a killed+relaunched run skips finished questions.
        const forceFb = args.includes("--overwrite-feedback") && !q.fb_regen;
        let fbFailed = false;
        for (const [textKey, urlKey] of LINES) {
          if (!q[textKey]) continue;
          if (q[urlKey] && !forceFb) { skipped++; continue; }
          const url = await voice(q[textKey]);
          if (url) { q[urlKey] = url; made++; process.stdout.write("."); }
          else { failed++; fbFailed = true; }
        }
        // Only mark the question done when EVERY line actually succeeded — a
        // failed clip must NOT be marked done, or a re-run would skip it and
        // leave a gap (this is what let whispery clips get baked in before).
        if (forceFb && !fbFailed) q.fb_regen = true;
      }
      // Save after EACH standard so an interruption loses at most one.
      await fs.writeFile(p, JSON.stringify(d, null, 2) + "\n", "utf-8");
    }
  }
  console.log(`\nfeedback audio — made ${made}, skipped ${skipped}, failed ${failed}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
