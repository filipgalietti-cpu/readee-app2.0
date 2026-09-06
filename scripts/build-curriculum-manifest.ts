/**
 * Build the curriculum NAVIGATION manifest.
 *
 * The dashboard is the first screen after login, it is a client component, and
 * it imported the whole curriculum: `sample-lessons.json` (1.6 MB of lesson
 * bodies) plus `lib/data/all-standards`, which imports and Zod-validates all
 * five grade question banks (3.3 MB) at module initialisation. Both landed in
 * the browser bundle - measured at 2,791,635 and 1,558,377 raw bytes in two
 * chunks - before a child had chosen anything.
 *
 * None of it was needed there. The dashboard reads four fields per lesson
 * (standardId, grade, domain, title) and the FIRST standard of one grade. That
 * is 24 KB of metadata against 1.6 MB of content: about 1.5%.
 *
 * So: generate the small thing at build time and let navigation import that.
 * Lesson bodies and question banks stay exactly where they are for the routes
 * that actually teach - /learn and /practice load real content and should.
 *
 * Staleness is the failure mode this split introduces: twenty-four scripts write
 * the catalogue, so "remember to regenerate" was never going to hold, and a
 * stale manifest fails silently - the dashboard lists lessons that disagree with
 * what /learn will teach, and nothing complains.
 *
 * So nobody has to remember. next.config.ts calls buildCurriculumManifest() at
 * the top of every build and every dev-server start, which covers Vercel, CI and
 * local work alike. tests/curriculum-manifest.test.ts is the second net, diffing
 * the committed manifest against the real files.
 *
 * Runnable directly too, when you want it regenerated without a build:
 *     npx tsx scripts/build-curriculum-manifest.ts
 */
import fs from "node:fs";
import path from "node:path";

type Lesson = { standardId: string; grade: string; domain: string; title: string; id?: string };
type StandardSummary = { standard_id: string; standard_description: string; domain: string };

const ROOT = process.cwd();
const OUT = path.join(ROOT, "app/data/curriculum-manifest.json");

const GRADE_FILES: Record<string, string> = {
  kindergarten: "kindergarten-standards-questions.json",
  "1st": "1st-grade-standards-questions.json",
  "2nd": "2nd-grade-standards-questions.json",
  "3rd": "3rd-grade-standards-questions.json",
  "4th": "4th-grade-standards-questions.json",
};

export function buildCurriculumManifest({ quiet = false } = {}) {
  const lessonsRaw = JSON.parse(
    fs.readFileSync(path.join(ROOT, "app/data/sample-lessons.json"), "utf8"),
  ) as Record<string, unknown>[];

  // Exactly the CatalogLesson shape lib/journey/next-lesson.ts declares, plus
  // the id the dashboard keys progress off. Nothing else travels.
  const lessons: Lesson[] = lessonsRaw.map((l) => ({
    id: String(l.id ?? ""),
    standardId: String(l.standardId ?? ""),
    grade: String(l.grade ?? ""),
    domain: String(l.domain ?? ""),
    title: String(l.title ?? ""),
  }));

  // Standards WITHOUT their questions. The questions are the bulk (ten per
  // standard, each with choices, audio paths and images) and no navigation
  // surface reads them - /practice loads the real bank when a child practises.
  const standards: Record<string, StandardSummary[]> = {};
  for (const [gradeKey, file] of Object.entries(GRADE_FILES)) {
    const bank = JSON.parse(fs.readFileSync(path.join(ROOT, "app/data", file), "utf8")) as {
      standards: Record<string, unknown>[];
    };
    standards[gradeKey] = bank.standards.map((s) => ({
      standard_id: String(s.standard_id ?? ""),
      standard_description: String(s.standard_description ?? ""),
      domain: String(s.domain ?? ""),
    }));
  }

  const manifest = { generatedFrom: "sample-lessons.json + *-standards-questions.json", lessons, standards };
  fs.writeFileSync(OUT, JSON.stringify(manifest) + "\n");

  const bytes = fs.statSync(OUT).size;
  const before = fs.statSync(path.join(ROOT, "app/data/sample-lessons.json")).size;
  if (!quiet) {
    console.log(`curriculum-manifest.json: ${lessons.length} lessons, ${Object.keys(standards).length} grades`);
    console.log(`  ${bytes.toLocaleString()} bytes (lesson catalogue alone was ${before.toLocaleString()})`);
  }
  return { lessons: lessons.length, bytes };
}

// Only when invoked as a script; importing this module must not write anything.
if (process.argv[1] && process.argv[1].includes("build-curriculum-manifest")) {
  try {
    buildCurriculumManifest();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
