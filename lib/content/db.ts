/**
 * Read + write helpers for the content tables (lessons_db,
 * questions_db, ccss_standards) introduced in migration 100.
 *
 * Stage 1 of the QC autonomy plan. Until READ_FROM_CONTENT_DB is
 * flipped on, the renderer continues to read from the bundled JSON;
 * AI workers write to the DB so per-row status, lineage, and version
 * land where they're useful. After a shadow-compare period proves
 * the DB matches JSON byte-for-byte, the renderer flips to DB and
 * the JSON files become a read-only mirror.
 *
 * Why both write paths exist (DB + JSON during transition):
 *   - JSON stays canonical for the renderer until shadow-compare
 *     gives confidence to flip.
 *   - DB writes give AI workers a place to record per-row qc_status,
 *     lineage_id, version, source — none of which fit cleanly into
 *     a checked-in JSON file.
 *   - Once the flip happens, JSON write-back becomes optional and
 *     can be retired.
 */
import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

const READ_FROM_CONTENT_DB = process.env.READ_FROM_CONTENT_DB === "1";

export type ContentSource = "authored" | "ai_enrich" | "ai_factory" | "ai_regen";
export type QcStatus = "pass" | "warn" | "fail" | "quarantined" | "retired";

export type LessonRow = {
  id: string;
  standard_id: string;
  grade: string;
  domain: string | null;
  title: string;
  slides: any[];
  qc_status: QcStatus;
  qc_attempt_count: number;
  content_hash: string | null;
  lineage_id: string | null;
  version: number;
  source: ContentSource;
  language: string;
  updated_at: string;
};

export type QuestionRow = {
  id: string;
  standard_id: string;
  grade: string;
  domain: string | null;
  type: string;
  prompt: string;
  choices: any[];
  correct: string | null;
  hint: string | null;
  difficulty: number | null;
  audio_url: string | null;
  hint_audio_url: string | null;
  image_url: string | null;
  qc_status: QcStatus;
  qc_attempt_count: number;
  content_hash: string | null;
  lineage_id: string | null;
  version: number;
  source: ContentSource;
  language: string;
};

export function isContentDbReadEnabled(): boolean {
  return READ_FROM_CONTENT_DB;
}

/* ─── Reads ─────────────────────────────────────────────────────── */

export async function getLessonByStandardFromDb(
  standardId: string,
  language: string = "en",
): Promise<LessonRow | null> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("lessons_db")
    .select("*")
    .eq("standard_id", standardId)
    .eq("language", language)
    .maybeSingle();
  return (data as LessonRow | null) ?? null;
}

export async function getQuestionByIdFromDb(
  questionId: string,
): Promise<QuestionRow | null> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("questions_db")
    .select("*")
    .eq("id", questionId)
    .maybeSingle();
  return (data as QuestionRow | null) ?? null;
}

/* ─── Writes (the autonomy unlock) ───────────────────────────────── */

/**
 * Upsert a lesson revision. AI enrichment, hand-edits, and the
 * eventual JSON sync all funnel through here.
 *
 * Versioning rule:
 *   - If a row exists for (standard_id, language), the new write
 *     bumps `version` and stamps `lineage_id` to the previous row's
 *     id (kept on the row that just got overwritten — see the
 *     trigger we'd add later, for now we just bump).
 *   - content_hash is recomputed from `slides`.
 */
export async function upsertLessonRow(input: {
  standardId: string;
  grade: string;
  domain?: string | null;
  title: string;
  slides: any[];
  source: ContentSource;
  qcStatus?: QcStatus;
  language?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = supabaseAdmin();
  const language = input.language ?? "en";
  const contentHash = await computeHash({ slides: input.slides });

  // If a current row exists, bump version + capture predecessor.
  const { data: existing } = await admin
    .from("lessons_db")
    .select("id, version")
    .eq("standard_id", input.standardId)
    .eq("language", language)
    .maybeSingle();

  const payload = {
    standard_id: input.standardId,
    grade: input.grade,
    domain: input.domain ?? null,
    title: input.title,
    slides: input.slides,
    qc_status: input.qcStatus ?? "warn", // AI-written defaults to warn
    content_hash: contentHash,
    lineage_id: existing?.id ?? null,
    version: existing ? (existing as any).version + 1 : 1,
    source: input.source,
    language,
  };

  const { data, error } = await admin
    .from("lessons_db")
    .upsert(payload, { onConflict: "standard_id,language" })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as { id: string }).id };
}

/**
 * Update qc_status + qc_attempt_count on a question after a regen.
 * The cron's regen workers call this so per-row status reflects
 * "did the bot fix this in the last 24h?" without joining audit
 * findings every time.
 */
export async function updateQuestionQcStatus(input: {
  questionId: string;
  qcStatus: QcStatus;
  bumpAttempts?: boolean;
  newAudioUrl?: string;
  newImageUrl?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = supabaseAdmin();
  const patch: Record<string, unknown> = {
    qc_status: input.qcStatus,
  };
  if (input.bumpAttempts) {
    // Postgres can't atomically bump with supabase-js without RPC,
    // so read-modify-write. Race is OK: at worst we under-count
    // attempts for very rapid-fire regens, which only inflates if
    // anything.
    const { data: cur } = await admin
      .from("questions_db")
      .select("qc_attempt_count")
      .eq("id", input.questionId)
      .maybeSingle();
    if (cur) {
      patch.qc_attempt_count = ((cur as any).qc_attempt_count ?? 0) + 1;
    }
  }
  if (input.newAudioUrl) patch.audio_url = input.newAudioUrl;
  if (input.newImageUrl) patch.image_url = input.newImageUrl;

  const { error } = await admin
    .from("questions_db")
    .update(patch)
    .eq("id", input.questionId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Same as updateQuestionQcStatus but for lessons. Used by the
 * lesson-enrichment auto-promote step: when same-night verify
 * passes the proposal, flip qc_status from 'warn' to 'pass'.
 */
export async function updateLessonQcStatus(input: {
  lessonId: string;
  qcStatus: QcStatus;
  bumpAttempts?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = supabaseAdmin();
  const patch: Record<string, unknown> = { qc_status: input.qcStatus };
  if (input.bumpAttempts) {
    const { data: cur } = await admin
      .from("lessons_db")
      .select("qc_attempt_count")
      .eq("id", input.lessonId)
      .maybeSingle();
    if (cur) {
      patch.qc_attempt_count = ((cur as any).qc_attempt_count ?? 0) + 1;
    }
  }
  const { error } = await admin
    .from("lessons_db")
    .update(patch)
    .eq("id", input.lessonId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function computeHash(value: unknown): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

/* ─── Aggregates (for /owner/qc-bot dashboard) ──────────────────── */

export async function getContentDbStats(): Promise<{
  lessons: { total: number; bySource: Record<string, number>; byQc: Record<string, number> };
  questions: { total: number; bySource: Record<string, number>; byQc: Record<string, number> };
}> {
  const admin = supabaseAdmin();
  const [{ data: lessonRows }, { data: questionRows }] = await Promise.all([
    admin.from("lessons_db").select("source, qc_status"),
    admin.from("questions_db").select("source, qc_status"),
  ]);
  const tally = (rows: any[] | null) => {
    const total = rows?.length ?? 0;
    const bySource: Record<string, number> = {};
    const byQc: Record<string, number> = {};
    for (const r of rows ?? []) {
      bySource[r.source] = (bySource[r.source] ?? 0) + 1;
      byQc[r.qc_status] = (byQc[r.qc_status] ?? 0) + 1;
    }
    return { total, bySource, byQc };
  };
  return {
    lessons: tally(lessonRows as any[] | null),
    questions: tally(questionRows as any[] | null),
  };
}
