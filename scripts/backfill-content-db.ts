/**
 * Backfill the lessons_db, questions_db, and ccss_standards tables
 * from app/data/*.json. Idempotent — safe to re-run; uses upsert
 * with the existing primary key so a re-run just refreshes any
 * fields that drifted in source JSON.
 *
 * Run:
 *   npx tsx scripts/backfill-content-db.ts --dry-run
 *   npx tsx scripts/backfill-content-db.ts
 *
 * Stage 1 of the QC autonomy plan. After this, the content lives
 * in two places (JSON + DB) — the renderer flip is a separate step
 * with a feature flag. Once flipped, JSON files become read-only
 * mirrors for ~30 days, then can be deleted.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const DRY = process.argv.includes("--dry-run");

const DATA = path.join(process.cwd(), "app", "data");

const GRADE_FROM_LESSON: Record<string, string> = {
  Kindergarten: "K",
  "1st Grade": "1",
  "2nd Grade": "2",
  "3rd Grade": "3",
  "4th Grade": "4",
};

const QUESTION_FILES: Array<{ grade: string; file: string }> = [
  { grade: "K", file: "kindergarten-standards-questions.json" },
  { grade: "1", file: "1st-grade-standards-questions.json" },
  { grade: "2", file: "2nd-grade-standards-questions.json" },
  { grade: "3", file: "3rd-grade-standards-questions.json" },
  { grade: "4", file: "4th-grade-standards-questions.json" },
];

function hashJson(value: unknown): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

async function backfillStandards() {
  let inserted = 0;
  for (const { grade, file } of QUESTION_FILES) {
    const raw = await fs.readFile(path.join(DATA, file), "utf-8");
    const data = JSON.parse(raw) as {
      standards?: Array<{
        standard_id?: string;
        standard_description?: string;
        domain?: string;
        parent_tip?: string;
      }>;
    };
    const rows = (data.standards ?? [])
      .filter((s) => s.standard_id && s.standard_description)
      .map((s) => ({
        id: s.standard_id!,
        grade,
        domain: s.domain ?? null,
        description: s.standard_description!,
        parent_tip: s.parent_tip ?? null,
      }));
    if (DRY) {
      console.log(`  [standards/${grade}] would upsert ${rows.length} rows`);
      inserted += rows.length;
      continue;
    }
    // Upsert in batches of 50 to stay polite.
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { error } = await sb
        .from("ccss_standards")
        .upsert(batch, { onConflict: "id" });
      if (error) {
        console.error(`  [standards/${grade}] error:`, error.message);
        process.exit(1);
      }
      inserted += batch.length;
    }
    console.log(`  [standards/${grade}] upserted ${rows.length}`);
  }
  console.log(`Standards total: ${inserted}`);
}

async function backfillQuestions() {
  let inserted = 0;
  for (const { grade, file } of QUESTION_FILES) {
    const raw = await fs.readFile(path.join(DATA, file), "utf-8");
    const data = JSON.parse(raw) as {
      standards?: Array<{
        standard_id?: string;
        domain?: string;
        questions?: Array<{
          id?: string;
          type?: string;
          prompt?: string;
          choices?: unknown[];
          correct?: unknown;
          hint?: string;
          difficulty?: number;
          audio_url?: string;
          hint_audio_url?: string;
          image_url?: string;
          incorrect_audio_url?: string;
        }>;
      }>;
    };
    const rows: any[] = [];
    for (const s of data.standards ?? []) {
      if (!s.standard_id) continue;
      for (const q of s.questions ?? []) {
        if (!q.id || !q.prompt) continue;
        const correct =
          Array.isArray(q.correct)
            ? (q.correct as unknown[]).map((c) => String(c)).join("|")
            : q.correct == null
              ? null
              : String(q.correct);
        const choices = Array.isArray(q.choices) ? q.choices : [];
        const payload = {
          id: q.id,
          standard_id: s.standard_id,
          grade,
          domain: s.domain ?? null,
          type: q.type ?? "multiple_choice",
          prompt: q.prompt,
          choices,
          correct,
          hint: q.hint ?? null,
          difficulty: typeof q.difficulty === "number" ? q.difficulty : null,
          audio_url: q.audio_url ?? null,
          hint_audio_url: q.hint_audio_url ?? null,
          image_url: q.image_url ?? null,
          incorrect_audio_url: q.incorrect_audio_url ?? null,
          source: "authored" as const,
          language: "en" as const,
        };
        rows.push({
          ...payload,
          content_hash: hashJson({
            prompt: payload.prompt,
            choices: payload.choices,
            correct: payload.correct,
            audio_url: payload.audio_url,
            image_url: payload.image_url,
          }),
        });
      }
    }
    if (DRY) {
      console.log(`  [questions/${grade}] would upsert ${rows.length} rows`);
      inserted += rows.length;
      continue;
    }
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { error } = await sb
        .from("questions_db")
        .upsert(batch, { onConflict: "id" });
      if (error) {
        console.error(`  [questions/${grade}] batch ${i} error:`, error.message);
        // Don't exit — log and continue so we see all errors at once.
      } else {
        inserted += batch.length;
      }
    }
    console.log(`  [questions/${grade}] upserted ${rows.length}`);
  }
  console.log(`Questions total: ${inserted}`);
}

async function backfillLessons() {
  const raw = await fs.readFile(path.join(DATA, "sample-lessons.json"), "utf-8");
  const lessons = JSON.parse(raw) as Array<{
    standardId?: string;
    grade?: string;
    domain?: string;
    title?: string;
    slides?: unknown[];
  }>;
  const rows: any[] = [];
  for (const l of lessons) {
    if (!l.standardId || !l.title || !l.grade) continue;
    const gradeShort = GRADE_FROM_LESSON[l.grade] ?? l.grade;
    rows.push({
      standard_id: l.standardId,
      grade: gradeShort,
      domain: l.domain ?? null,
      title: l.title,
      slides: l.slides ?? [],
      content_hash: hashJson({ slides: l.slides ?? [] }),
      source: "authored" as const,
      language: "en" as const,
    });
  }
  if (DRY) {
    console.log(`  [lessons] would upsert ${rows.length} rows`);
    return;
  }
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 25) {
    const batch = rows.slice(i, i + 25);
    const { error } = await sb
      .from("lessons_db")
      .upsert(batch, { onConflict: "standard_id,language" });
    if (error) {
      console.error(`  [lessons] batch ${i} error:`, error.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`Lessons upserted: ${inserted} / ${rows.length}`);
}

async function main() {
  console.log(`Backfill ${DRY ? "(DRY RUN)" : "(WRITE)"}...`);
  console.log("Standards →");
  await backfillStandards();
  console.log("Questions →");
  await backfillQuestions();
  console.log("Lessons →");
  await backfillLessons();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
