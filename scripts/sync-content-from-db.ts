/**
 * Sync content from Postgres back to the JSON files the renderer
 * imports. Closes the autonomy loop without flipping the renderer:
 *
 *   AI worker writes → lessons_db / questions_db
 *   GitHub Actions cron → npm run content:sync
 *   if JSON diff → commit → push
 *   Vercel auto-deploys on push → kids see new content
 *
 * Total latency: ~5-15 minutes from AI write to live. Vastly simpler
 * than runtime renderer flip; no client-side refactor; no shadow-
 * compare period needed.
 *
 * The script is idempotent: running it when DB matches JSON produces
 * no diff. The cron just runs it nightly, commits if anything changed.
 *
 *   npx tsx scripts/sync-content-from-db.ts --dry-run
 *   npx tsx scripts/sync-content-from-db.ts          (writes JSON)
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
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

const QUESTION_FILES: Array<{ grade: string; file: string; longGrade: string }> = [
  { grade: "K", file: "kindergarten-standards-questions.json", longGrade: "Kindergarten" },
  { grade: "1", file: "1st-grade-standards-questions.json", longGrade: "1st" },
  { grade: "2", file: "2nd-grade-standards-questions.json", longGrade: "2nd" },
  { grade: "3", file: "3rd-grade-standards-questions.json", longGrade: "3rd" },
  { grade: "4", file: "4th-grade-standards-questions.json", longGrade: "4th" },
];

const LESSON_GRADE_FROM_SHORT: Record<string, string> = {
  K: "Kindergarten",
  "1": "1st Grade",
  "2": "2nd Grade",
  "3": "3rd Grade",
  "4": "4th Grade",
};

/**
 * Compares two JSON values via structural deep-equal. Used to
 * detect drift between DB-rendered JSON and disk JSON.
 */
function deepEqualJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Canonical key order for question objects so the sync output
// matches the hand-authored JSON byte-for-byte. Postgres jsonb
// doesn't preserve key insertion order, so we re-sort on emit.
// Unknown keys land at the end in alphabetical order.
const QUESTION_KEY_ORDER = [
  "id",
  "type",
  "prompt",
  "passage_audio_url",
  "choices",
  "choices_audio_urls",
  "correct",
  "hint",
  "difficulty",
  "audio_url",
  "hint_audio_url",
  "image_url",
  "incorrect_audio_url",
  "blank_index",
  "missing_choices",
  "sentence_words",
  "sentence_audio_url",
  "sentence_hint",
  "words",
  "ordered",
  "categories",
  "category_items",
  "items",
  "left_items",
  "right_items",
  "correct_pairs",
  "phonemes",
  "target_word",
  "distractors",
  "jumbled",
  "chart_data",
];

function reorderKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const seen = new Set<string>();
  for (const k of QUESTION_KEY_ORDER) {
    if (k in obj) {
      out[k] = obj[k];
      seen.add(k);
    }
  }
  // Append any leftover keys alphabetically so we don't silently
  // drop fields the schema doesn't know about yet.
  const extras = Object.keys(obj)
    .filter((k) => !seen.has(k))
    .sort();
  for (const k of extras) out[k] = obj[k];
  return out;
}

async function syncQuestionsFile(input: {
  grade: string;
  file: string;
  longGrade: string;
  // Carry the original file's metadata so sync emits an identical
  // top-level header. (The standard_framework string slightly
  // differs from grade to grade — pull from the existing JSON.)
  metaFromExisting: { grade: string; standard_framework: string };
}): Promise<{ changed: boolean; questions: number; standards: number }> {
  // Pull standards for this grade — ordered by `ordinal` so the
  // emitted JSON matches the original curriculum order, not Postgres
  // alphabetical default.
  const { data: stdRows } = await sb
    .from("ccss_standards")
    .select("id, grade, domain, description, parent_tip, ordinal")
    .eq("grade", input.grade)
    .order("ordinal", { ascending: true, nullsFirst: false });

  const { data: qRows } = await sb
    .from("questions_db")
    .select("id, standard_id, payload, ordinal")
    .eq("grade", input.grade)
    .eq("language", "en")
    .neq("qc_status", "quarantined")
    .neq("qc_status", "retired")
    .order("ordinal", { ascending: true, nullsFirst: false });

  const qByStandard = new Map<string, any[]>();
  for (const q of (qRows ?? []) as any[]) {
    if (!q.payload) continue;
    const sid = q.standard_id as string;
    if (!qByStandard.has(sid)) qByStandard.set(sid, []);
    qByStandard.get(sid)!.push(reorderKeys(q.payload));
  }

  // Canonical standard key order: standard_id, standard_description,
  // domain, parent_tip, questions. Same as the K JSON which is the
  // hand-authored reference shape.
  const standards = ((stdRows ?? []) as any[]).map((s) => {
    const out: Record<string, unknown> = {};
    out.standard_id = s.id;
    out.standard_description = s.description;
    out.domain = s.domain ?? "";
    out.parent_tip = s.parent_tip ?? "";
    out.questions = qByStandard.get(s.id) ?? [];
    return out;
  });

  const totalQuestions = standards.reduce(
    (acc: number, s: any) => acc + (s.questions?.length ?? 0),
    0,
  );

  const out = {
    grade: input.metaFromExisting.grade,
    standard_framework: input.metaFromExisting.standard_framework,
    total_standards: standards.length,
    total_questions: totalQuestions,
    standards,
  };

  // Compare to current file. Only write if different — cron commits
  // skip when nothing changed.
  const filePath = path.join(DATA, input.file);
  let changed = true;
  try {
    const existing = JSON.parse(await fs.readFile(filePath, "utf-8"));
    if (deepEqualJson(existing, out)) changed = false;
  } catch {
    // File doesn't exist yet — definitely changed.
  }

  if (changed && !DRY) {
    await fs.writeFile(filePath, JSON.stringify(out, null, 2) + "\n", "utf-8");
  }

  return {
    changed,
    questions: totalQuestions,
    standards: standards.length,
  };
}

async function syncLessonsFile(): Promise<{ changed: boolean; lessons: number }> {
  const { data: lessonRows } = await sb
    .from("lessons_db")
    .select("standard_id, grade, domain, title, slides, ordinal")
    .eq("language", "en")
    .neq("qc_status", "quarantined")
    .neq("qc_status", "retired")
    .order("ordinal", { ascending: true, nullsFirst: false });

  // sample-lessons.json keeps long-form grade names; convert back.
  // ordinal preserves the exact original lesson order so the
  // emitted JSON is byte-stable for unchanged content.
  const lessons = ((lessonRows ?? []) as any[]).map((l) => ({
    standardId: l.standard_id,
    grade: LESSON_GRADE_FROM_SHORT[l.grade] ?? l.grade,
    domain: l.domain ?? "",
    title: l.title,
    slides: l.slides ?? [],
  }));

  const filePath = path.join(DATA, "sample-lessons.json");
  let changed = true;
  try {
    const existing = JSON.parse(await fs.readFile(filePath, "utf-8"));
    if (deepEqualJson(existing, lessons)) changed = false;
  } catch {
    // File missing — definitely changed.
  }

  if (changed && !DRY) {
    await fs.writeFile(filePath, JSON.stringify(lessons, null, 2) + "\n", "utf-8");
  }
  return { changed, lessons: lessons.length };
}

async function main() {
  console.log(`Sync content DB → JSON ${DRY ? "(DRY RUN)" : "(WRITE)"}...`);
  let anyChanged = false;
  for (const f of QUESTION_FILES) {
    // Read existing top-level metadata so the sync output keeps
    // the same `grade`/`standard_framework` strings as the canonical
    // file. Counts get recomputed from DB content.
    let metaFromExisting = {
      grade: f.longGrade,
      standard_framework: "Common Core State Standards",
    };
    try {
      const existing = JSON.parse(
        await fs.readFile(path.join(DATA, f.file), "utf-8"),
      );
      metaFromExisting = {
        grade: existing.grade ?? f.longGrade,
        standard_framework:
          existing.standard_framework ?? "Common Core State Standards",
      };
    } catch {
      /* file missing — use defaults */
    }
    const r = await syncQuestionsFile({ ...f, metaFromExisting });
    console.log(
      `  [${f.file}] ${r.standards} stds, ${r.questions} qs ${r.changed ? "CHANGED" : "unchanged"}`,
    );
    if (r.changed) anyChanged = true;
  }
  const lessonRes = await syncLessonsFile();
  console.log(
    `  [sample-lessons.json] ${lessonRes.lessons} lessons ${lessonRes.changed ? "CHANGED" : "unchanged"}`,
  );
  if (lessonRes.changed) anyChanged = true;

  if (anyChanged) {
    console.log(DRY ? "DRY: changes would be written." : "Files updated. Commit + push to deploy.");
    // Exit 2 means "diff present" so the GitHub Action knows to commit.
    process.exit(DRY ? 0 : 2);
  } else {
    console.log("No changes — DB and JSON are in sync.");
    process.exit(0);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
