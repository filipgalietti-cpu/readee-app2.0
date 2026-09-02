/**
 * Backfill comprehension questions for the Luna library (Amira pattern:
 * generate + QC OFFLINE, serve pre-vetted content at runtime — no live LLM
 * near a child).
 *
 *   npx tsx scripts/gen-luna-questions.ts            # fill missing only
 *   npx tsx scripts/gen-luna-questions.ts --force    # regenerate all
 *
 * Writes `questions` onto each story in app/data/luna-library.json.
 * Resumable: reruns skip stories that already have questions.
 */
import fs from "fs";
import path from "path";

// tsx doesn't auto-load .env.local — pull GEMINI_API_KEY (+ Supabase vars for
// any telemetry) in before the lib imports read them.
{
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

import { generateLunaQuestions } from "../lib/ai/luna-questions";
import { validateLunaQuestions } from "../lib/luna/comprehension";

const LIB_PATH = path.resolve(__dirname, "..", "app", "data", "luna-library.json");

type Story = {
  id?: string;
  grade: string;
  title: string;
  text: string;
  questions?: unknown;
  [k: string]: unknown;
};

async function main() {
  const force = process.argv.includes("--force");
  const stories = JSON.parse(fs.readFileSync(LIB_PATH, "utf8")) as Story[];
  console.log(`Library: ${stories.length} stories · force=${force}`);

  let done = 0, skipped = 0, failed = 0;
  for (const [i, s] of stories.entries()) {
    const existing = validateLunaQuestions(s.questions);
    if (existing.length === 2 && !force) { skipped++; continue; }
    process.stdout.write(`  [${i + 1}/${stories.length}] ${s.grade} · ${s.title.slice(0, 40)} ... `);
    const res = await generateLunaQuestions({ passage: s.text, gradeLevel: s.grade, teacherId: "factory" });
    if (res.ok) {
      s.questions = res.questions;
      done++;
      console.log(`ok (${res.questions.map((q) => q.kind[0]).join("+")})`);
      // Save after every story so the run is resumable mid-flight.
      fs.writeFileSync(LIB_PATH, JSON.stringify(stories, null, 2) + "\n");
    } else {
      failed++;
      console.log(`FAILED: ${res.error}`);
    }
    await new Promise((r) => setTimeout(r, 400)); // gentle on the API
  }
  console.log(`\nDone. generated=${done} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

void main();
