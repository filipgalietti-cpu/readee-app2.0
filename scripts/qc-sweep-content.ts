/**
 * Full content sweep — run every deterministic audit check across
 * every lesson and every question in the JSON files, group findings
 * by type, and emit a punch list of what's left to fix.
 *
 * This is the "what's still wrong with the catalog" report. It runs
 * the same gates as the QC bot but produces a single human-readable
 * summary instead of writing to content_audit_findings.
 *
 * Usage:
 *   npx tsx scripts/qc-sweep-content.ts
 *   npx tsx scripts/qc-sweep-content.ts --grade=4th
 *   npx tsx scripts/qc-sweep-content.ts --json   # machine-readable
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
import { checkLessonStructure, checkLessonRichness } from "@/lib/ai/qc-lesson";

const DATA = path.join(process.cwd(), "app", "data");

const gradeArg = process.argv.find((a) => a.startsWith("--grade="));
const GRADE = gradeArg ? gradeArg.split("=")[1] : null;
const JSON_OUT = process.argv.includes("--json");

const QUESTION_FILES = [
  { key: "K", file: "kindergarten-standards-questions.json", lessonsGrade: "Kindergarten" },
  { key: "1st", file: "1st-grade-standards-questions.json", lessonsGrade: "1st Grade" },
  { key: "2nd", file: "2nd-grade-standards-questions.json", lessonsGrade: "2nd Grade" },
  { key: "3rd", file: "3rd-grade-standards-questions.json", lessonsGrade: "3rd Grade" },
  { key: "4th", file: "4th-grade-standards-questions.json", lessonsGrade: "4th Grade" },
];

type Bucket = { count: number; samples: string[]; severity: "fail" | "warn" };
const buckets = new Map<string, Bucket>();
function record(type: string, severity: "fail" | "warn", sample: string) {
  const b = buckets.get(type) ?? { count: 0, samples: [], severity };
  b.count += 1;
  if (b.samples.length < 3) b.samples.push(sample);
  if (severity === "fail" && b.severity === "warn") b.severity = "fail";
  buckets.set(type, b);
}

async function main() {
  // 1) Lessons
  const lessonsRaw = await fs.readFile(path.join(DATA, "sample-lessons.json"), "utf8");
  const lessons = JSON.parse(lessonsRaw) as any[];
  const filteredLessons = GRADE
    ? lessons.filter((l) => l.grade?.toLowerCase().startsWith(GRADE.toLowerCase()))
    : lessons;

  for (const lesson of filteredLessons) {
    const findings = [
      ...checkLessonStructure({ standardId: lesson.standardId, lesson }),
      ...checkLessonRichness({ standardId: lesson.standardId, lesson }),
    ];
    for (const f of findings) {
      record(f.type, f.severity, `${lesson.standardId}${f.slideRef ? " · " + f.slideRef : ""}`);
    }
  }

  // 2) Questions
  const banks: Record<string, Set<string>> = {};
  for (const f of QUESTION_FILES) {
    if (GRADE && f.key !== GRADE) continue;
    const raw = await fs.readFile(path.join(DATA, f.file), "utf8");
    const d = JSON.parse(raw);
    for (const s of d.standards ?? []) {
      banks[s.standard_id] = new Set();
      for (const q of s.questions ?? []) {
        banks[s.standard_id]!.add(q.id);
        const ref = `${s.standard_id}#${q.id}`;
        // prompt
        if (!q.prompt || String(q.prompt).trim().length === 0) {
          record("question.empty_prompt", "fail", ref);
        }
        // choices count (MCQ)
        if (q.type === "multiple_choice") {
          const choices = Array.isArray(q.choices) ? q.choices : [];
          if (choices.length < 2) record("question.too_few_choices", "fail", ref);
          if (choices.length > 5) record("question.too_many_choices", "warn", ref);
          // correct answer must be one of the choices
          const correct = typeof q.correct === "string" ? q.correct : null;
          if (!correct) {
            record("question.missing_correct", "fail", ref);
          } else if (choices.length > 0 && !choices.includes(correct)) {
            record("question.correct_not_in_choices", "fail", ref);
          }
          // unique choices
          if (new Set(choices.map(String)).size !== choices.length) {
            record("question.duplicate_choices", "fail", ref);
          }
        }
        // audio url shape — only check when one is set; falsy means
        // the renderer falls back to the {grade}/{standard}/{id}.mp3
        // convention which is the canonical path for the K-built bank.
        if (q.audio_url && typeof q.audio_url === "string") {
          if (!q.audio_url.includes("/audio/") || !q.audio_url.endsWith(".mp3")) {
            record("question.audio_url_off_convention", "warn", ref);
          }
        }
        // image — implied via URL convention from grade folder
      }
    }
  }

  // 3) Cross-check: lesson MCQ refs against question bank.
  for (const lesson of filteredLessons) {
    const bank = banks[lesson.standardId];
    if (!bank) {
      record("lesson.standard_has_no_question_bank", "fail", lesson.standardId);
      continue;
    }
    for (const slide of lesson.slides ?? []) {
      if (slide?.type === "mcq" && typeof slide.mcqId === "string" && !bank.has(slide.mcqId)) {
        record(
          "lesson.broken_mcq_ref",
          "fail",
          `${lesson.standardId} · slide ${slide.slide ?? "?"} → ${slide.mcqId}`,
        );
      }
    }
  }

  // 4) Cross-check: every standard mentioned in lessons has a question bank
  const lessonStds = new Set(filteredLessons.map((l) => l.standardId));
  for (const std of lessonStds) {
    const ids = banks[std];
    if (!ids || ids.size === 0) {
      record("lesson.no_questions_for_standard", "warn", std);
    }
  }

  // Output
  if (JSON_OUT) {
    console.log(JSON.stringify(Object.fromEntries(buckets), null, 2));
    return;
  }

  const sorted = Array.from(buckets.entries()).sort((a, b) => {
    if (a[1].severity !== b[1].severity) return a[1].severity === "fail" ? -1 : 1;
    return b[1].count - a[1].count;
  });

  console.log("\nCONTENT SWEEP" + (GRADE ? ` — ${GRADE}` : "") + "\n");
  console.log("─".repeat(72));
  let totalFail = 0;
  let totalWarn = 0;
  for (const [type, b] of sorted) {
    const tag = b.severity === "fail" ? "FAIL" : "warn";
    const head = `${tag.padEnd(5)} ${type.padEnd(44)} ${String(b.count).padStart(5)}`;
    console.log(head);
    for (const s of b.samples) console.log(`        e.g. ${s}`);
    if (b.severity === "fail") totalFail += b.count; else totalWarn += b.count;
  }
  console.log("─".repeat(72));
  console.log(`fail rows: ${totalFail}   warn rows: ${totalWarn}   distinct types: ${sorted.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
