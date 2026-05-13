/**
 * Audit data sources — DB-first vs JSON-fallback.
 *
 * The repo carries `app/data/*-standards-questions.json` and
 * `app/data/sample-lessons.json` as the deployed content for the
 * renderer. Those JSONs are sync'd nightly from `questions_db` and
 * `lessons_db` via the GitHub Actions cron. The audit historically
 * read those JSONs, which meant any edit landed in DB by a generator
 * or heal worker wouldn't show up in the audit until the next sync —
 * stale findings, false positives, missed regressions.
 *
 * This module returns the same data shape the audit expects (so the
 * rest of `scripts/audit-content.ts` doesn't change), but pulls from
 * the live DB. JSON loaders are kept for `--source=json` parity / when
 * we want to audit what kids actually see in production.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAllStandards } from "@/lib/data/all-standards";

import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";
import sampleLessons from "@/app/data/sample-lessons.json";

export type AuditQuestion = {
  id: string;
  type?: string;
  prompt?: string;
  choices?: unknown;
  correct?: string;
  hint?: string;
  audio_url?: string | null;
  image_url?: string | null;
  hint_audio_url?: string | null;
  difficulty?: number;
};

export type AuditStandard = {
  standard_id: string;
  standard_description: string;
  questions: AuditQuestion[];
};

export type AuditGradeBank = {
  grade: string;
  bank: { standards: AuditStandard[] };
};

export type AuditLesson = {
  standardId: string;
  grade: string;
  domain?: string;
  title: string;
  slides: any[];
};

// ── JSON loaders (legacy / "what kids see in prod") ──────────────

export function loadQuestionBanksFromJson(): AuditGradeBank[] {
  return [
    { grade: "K", bank: kJson as any },
    { grade: "1st", bank: g1Json as any },
    { grade: "2nd", bank: g2Json as any },
    { grade: "3rd", bank: g3Json as any },
    { grade: "4th", bank: g4Json as any },
  ];
}

export function loadLessonsFromJson(): AuditLesson[] {
  return (sampleLessons as any[]) ?? [];
}

// ── DB loaders (default — "what was authored, what the audit
//                          should police BEFORE next JSON sync") ──

/**
 * Grade values in questions_db are stored as short codes ("K", "1st",
 * "2nd", "3rd", "4th"). We bucket by code; rows with unrecognized
 * grades land in a "(unknown)" bucket so the audit still sees them
 * instead of silently dropping.
 */
const QUESTION_GRADE_BUCKETS = ["K", "1st", "2nd", "3rd", "4th"] as const;

export async function loadQuestionBanksFromDb(): Promise<AuditGradeBank[]> {
  const admin = supabaseAdmin();

  // Pull every question. Audit is read-only; cost is fine.
  const { data } = await admin
    .from("questions_db")
    .select(
      "id, standard_id, grade, type, prompt, choices, correct, hint, audio_url, hint_audio_url, image_url, difficulty",
    )
    .order("standard_id")
    .order("id");
  const rows = (data ?? []) as Array<{
    id: string;
    standard_id: string;
    grade: string | null;
    type: string | null;
    prompt: string | null;
    choices: unknown;
    correct: string | null;
    hint: string | null;
    audio_url: string | null;
    hint_audio_url: string | null;
    image_url: string | null;
    difficulty: number | null;
  }>;

  // Map standard_id → description from the canonical standards file.
  // Falls back to empty string when the standard isn't in the catalog
  // (rare; would only happen for an AI-generated row tagged with a
  // non-CCSS skill label).
  const descByStandard = new Map<string, string>();
  for (const s of getAllStandards()) {
    descByStandard.set(s.standard_id, s.standard_description ?? "");
  }

  // Bucket rows by grade → standard → questions.
  type GradeKey = string;
  const grades = new Map<GradeKey, Map<string, AuditQuestion[]>>();
  for (const g of QUESTION_GRADE_BUCKETS) grades.set(g, new Map());
  grades.set("(unknown)", new Map());

  for (const r of rows) {
    const gradeKey: GradeKey = QUESTION_GRADE_BUCKETS.includes(
      r.grade as any,
    )
      ? (r.grade as GradeKey)
      : "(unknown)";
    const stdMap = grades.get(gradeKey)!;
    const list = stdMap.get(r.standard_id) ?? [];
    list.push({
      id: r.id,
      type: r.type ?? "multiple_choice",
      prompt: r.prompt ?? "",
      choices: r.choices ?? [],
      correct: r.correct ?? "",
      hint: r.hint ?? "",
      audio_url: r.audio_url,
      hint_audio_url: r.hint_audio_url,
      image_url: r.image_url,
      difficulty: r.difficulty ?? 1,
    });
    stdMap.set(r.standard_id, list);
  }

  const out: AuditGradeBank[] = [];
  for (const grade of [...QUESTION_GRADE_BUCKETS, "(unknown)"]) {
    const stdMap = grades.get(grade)!;
    if (stdMap.size === 0) continue;
    const standards: AuditStandard[] = [];
    for (const [standard_id, questions] of stdMap.entries()) {
      standards.push({
        standard_id,
        standard_description: descByStandard.get(standard_id) ?? "",
        questions,
      });
    }
    standards.sort((a, b) => a.standard_id.localeCompare(b.standard_id));
    out.push({ grade, bank: { standards } });
  }
  return out;
}

/**
 * Map lessons_db.grade (long-form "Kindergarten" / "1st Grade") onto
 * the same string the audit's lesson loop expects. The audit
 * internally converts to a short code via `shortGrade`, so this just
 * preserves the long form coming out of DB.
 */
export async function loadLessonsFromDb(): Promise<AuditLesson[]> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("lessons_db")
    .select("standard_id, grade, domain, title, slides")
    .order("standard_id");
  const rows = (data ?? []) as Array<{
    standard_id: string;
    grade: string | null;
    domain: string | null;
    title: string | null;
    slides: any;
  }>;
  return rows.map((r) => ({
    standardId: r.standard_id,
    grade: r.grade ?? "",
    domain: r.domain ?? undefined,
    title: r.title ?? "",
    slides: Array.isArray(r.slides) ? r.slides : [],
  }));
}

// ── Top-level switch ─────────────────────────────────────────────

export type AuditSource = "db" | "json";

export async function loadQuestionBanks(
  source: AuditSource,
): Promise<AuditGradeBank[]> {
  return source === "json" ? loadQuestionBanksFromJson() : loadQuestionBanksFromDb();
}

export async function loadLessons(source: AuditSource): Promise<AuditLesson[]> {
  return source === "json" ? loadLessonsFromJson() : loadLessonsFromDb();
}
