/**
 * QC bot regen v2 — DB-first, type-aware question regeneration.
 *
 * Replaces v1's JSON-file-edit flow with direct writes to questions_db.
 * v1 wrote new questions to app/data/*.json — but the DB→JSON sync cron
 * runs nightly and would overwrite those JSON edits with whatever's
 * still in DB. v2 writes to DB directly so the next sync respects the
 * new version.
 *
 * Improvements over v1:
 *   1. DB-first: UPDATE questions_db in place (bump version, clear
 *      audio_url/image_url, mark qc_status='quarantined' pending media).
 *      Old content captured in content_qc_log.
 *   2. Type-aware: when a q.better_format finding suggests a non-MCQ
 *      type (missing_word / sentence_build / category_sort / tap_to_pair
 *      / sound_machine / space_insertion), dispatches to the matching
 *      author in lib/qc/question-authors.ts. v1 was MCQ-only.
 *   3. Per-question change log + end-of-run summary bucketed by type
 *      transition.
 *
 * Usage:
 *   npx tsx scripts/qc-bot-regen-questions-v2.ts --dry-run --limit=5
 *   npx tsx scripts/qc-bot-regen-questions-v2.ts --audit-run=<uuid>
 *   npx tsx scripts/qc-bot-regen-questions-v2.ts --severity=fail
 *   npx tsx scripts/qc-bot-regen-questions-v2.ts --severity=warn --limit=20
 *
 * Cost: ~$0.001 / regen × ~200 = ~$0.20 total. Gemini Flash.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { findStandardById } from "@/lib/data/all-standards";
import {
  authorByType,
  type AuthorableType,
  type AuthorInput,
} from "@/lib/qc/question-authors";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SYSTEM_TEACHER_ID = process.env.QC_BOT_TEACHER_ID;
if (!SUPABASE_URL || !SERVICE_KEY || !SYSTEM_TEACHER_ID) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + QC_BOT_TEACHER_ID",
  );
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="));
const sevArg = args.find((a) => a.startsWith("--severity="));
const auditRunArg = args.find((a) => a.startsWith("--audit-run="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;
const SEVERITY = sevArg ? sevArg.split("=")[1] : null;
const AUDIT_RUN = auditRunArg ? auditRunArg.split("=")[1] : null;

type Finding = {
  id: string;
  target_id: string;
  finding_type: string;
  severity: string;
  message: string;
  suggestion: string | null;
  grade: string | null;
};

type QuestionRow = {
  id: string;
  standard_id: string;
  grade: string | null;
  type: string;
  prompt: string;
  choices: any;
  correct: string;
  hint: string;
  difficulty: number;
  payload: any;
  version: number;
};

const AUTHORABLE: ReadonlySet<string> = new Set([
  "multiple_choice",
  "missing_word",
  "sentence_build",
  "category_sort",
  "tap_to_pair",
  "sound_machine",
  "space_insertion",
]);

type RegenOutcome =
  | {
      ok: true;
      targetId: string;
      oldType: string;
      newType: string;
      oldPrompt: string;
      newPrompt: string;
      mode: "mcq" | "non-mcq";
      payload: any;
    }
  | { ok: false; targetId: string; oldType: string; reason: string };

async function fetchFindings(): Promise<Finding[]> {
  let q = sb
    .from("content_audit_findings")
    .select("id, target_id, finding_type, severity, message, suggestion, grade")
    .in("finding_type", ["q.should_be_asked", "q.better_format"])
    .eq("status", "open")
    .order("severity", { ascending: true }) // fail before warn
    .order("created_at", { ascending: false });
  if (SEVERITY) q = q.eq("severity", SEVERITY);
  if (AUDIT_RUN) q = q.eq("audit_run_id", AUDIT_RUN);
  if (LIMIT) q = q.limit(LIMIT);
  const { data, error } = await q;
  if (error) {
    console.error("Could not fetch findings:", error.message);
    process.exit(1);
  }
  return (data ?? []) as Finding[];
}

async function fetchQuestion(id: string): Promise<QuestionRow | null> {
  const { data } = await sb
    .from("questions_db")
    .select(
      "id, standard_id, grade, type, prompt, choices, correct, hint, difficulty, payload, version",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as QuestionRow) ?? null;
}

function buildAuthorInput(
  q: QuestionRow,
  f: Finding,
  standardText: string,
): AuthorInput {
  return {
    questionId: q.id,
    standardId: q.standard_id,
    standardText,
    oldQuestion: {
      type: q.type,
      prompt: q.prompt,
      choices: q.choices,
      correct: q.correct,
      hint: q.hint,
    },
    critique: [f.message, f.suggestion ? `Suggestion: ${f.suggestion}` : ""]
      .filter(Boolean)
      .join(" || "),
    difficulty: q.difficulty,
  };
}

async function persistUpdate(
  q: QuestionRow,
  newType: string,
  newPayload: any,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Mirror the type-specific payload back into normalized columns the
  // renderer / older queries may still read.
  const choices =
    newType === "multiple_choice"
      ? (newPayload.choices ?? [])
      : newType === "missing_word"
        ? newPayload.missing_choices ?? []
        : [];
  const correct = String(newPayload.correct ?? "");
  const hint = String(newPayload.hint ?? "");
  const prompt = String(newPayload.prompt ?? "");

  const { error } = await sb
    .from("questions_db")
    .update({
      type: newType,
      prompt,
      choices,
      correct,
      hint,
      payload: newPayload,
      audio_url: null,
      hint_audio_url: null,
      image_url: null,
      qc_status: "quarantined",
      qc_attempt_count: 0,
      content_hash: null,
      version: (q.version ?? 1) + 1,
      // questions_db.source enum: 'authored' | 'ai_enrich' | 'ai_factory' | 'ai_regen'
      source: "ai_regen",
      updated_at: new Date().toISOString(),
    })
    .eq("id", q.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function logChange(
  q: QuestionRow,
  f: Finding,
  newType: string,
  newPayload: any,
): Promise<void> {
  await sb.from("content_qc_log").insert({
    target_kind: "question",
    target_id: q.id,
    change_type: "regen_question",
    before: {
      type: q.type,
      prompt: q.prompt,
      choices: q.choices,
      correct: q.correct,
      hint: q.hint,
    },
    after: {
      type: newType,
      prompt: newPayload.prompt,
      correct: newPayload.correct,
      payload_summary: typeSummary(newType, newPayload),
    },
    reason:
      f.message + (f.suggestion ? ` || suggestion: ${f.suggestion}` : ""),
    finding_id: f.id,
    agent: "qc-bot/regen-v2",
  });
}

function typeSummary(t: string, p: any): string {
  switch (t) {
    case "multiple_choice":
      return `4 choices: ${(p.choices ?? []).join(" / ")}`;
    case "missing_word":
      return `blank at idx ${p.blank_index}; choices: ${(p.missing_choices ?? []).join(" / ")}`;
    case "sentence_build":
      return `${(p.words ?? []).length} words → "${p.correct}"`;
    case "category_sort":
      return `${(p.categories ?? []).length} buckets: ${(p.categories ?? []).join(", ")}`;
    case "tap_to_pair":
      return `${(p.left_items ?? []).length} pairs`;
    case "sound_machine":
      return `target="${p.target_word}" phonemes=${(p.phonemes ?? []).join("")}`;
    case "space_insertion":
      return `"${p.jumbled}" → "${p.correct}"`;
    default:
      return "(unknown)";
  }
}

async function markFindingFixed(findingId: string): Promise<void> {
  await sb
    .from("content_audit_findings")
    .update({
      status: "fixed",
      resolved_at: new Date().toISOString(),
      resolver_note: "qc-bot-regen-v2: regenerated via type-aware author, quarantined pending media regen.",
    })
    .eq("id", findingId);
}

async function processFinding(f: Finding): Promise<RegenOutcome> {
  const q = await fetchQuestion(f.target_id);
  if (!q) {
    return { ok: false, targetId: f.target_id, oldType: "?", reason: "Question not in questions_db" };
  }
  const std = findStandardById(q.standard_id);
  const standardText = std?.standard_description ?? "";
  if (!standardText) {
    return {
      ok: false,
      targetId: f.target_id,
      oldType: q.type,
      reason: `Standard ${q.standard_id} not in canon — can't anchor regen`,
    };
  }

  // Decide target type:
  //   1. q.better_format → use the suggested type (the audit explicitly
  //      recommends switching to a more pedagogically-appropriate type).
  //   2. q.should_be_asked → keep the OLD type but regen its content. If
  //      the old type isn't an authorable shape (very rare), fall back
  //      to multiple_choice.
  const suggestion = (f.suggestion ?? "").trim();
  let newType: string;
  if (f.finding_type === "q.better_format" && AUTHORABLE.has(suggestion)) {
    newType = suggestion;
  } else if (AUTHORABLE.has(q.type)) {
    newType = q.type;
  } else {
    newType = "multiple_choice";
  }
  const mode: "mcq" | "non-mcq" = newType === "multiple_choice" ? "mcq" : "non-mcq";

  const authorInput = buildAuthorInput(q, f, standardText);
  const res = await authorByType(newType as AuthorableType, authorInput);
  if (!res.ok) {
    return {
      ok: false,
      targetId: f.target_id,
      oldType: q.type,
      reason: `${newType} author failed: ${res.error}`,
    };
  }
  const newPayload = res.payload;

  if (DRY) {
    console.log(`  [DRY] ${f.target_id} (${q.type} → ${newType})`);
    console.log(`    old prompt: ${(q.prompt ?? "").slice(0, 120)}`);
    console.log(`    new prompt: ${(newPayload.prompt ?? "").slice(0, 120)}`);
    console.log(`    ${typeSummary(newType, newPayload)}`);
    return {
      ok: true,
      targetId: f.target_id,
      oldType: q.type,
      newType,
      oldPrompt: q.prompt ?? "",
      newPrompt: newPayload.prompt ?? "",
      mode,
      payload: newPayload,
    };
  }

  // Persist
  const upd = await persistUpdate(q, newType, newPayload);
  if (!upd.ok) {
    return { ok: false, targetId: f.target_id, oldType: q.type, reason: `DB update failed: ${upd.error}` };
  }
  await logChange(q, f, newType, newPayload);
  await markFindingFixed(f.id);
  return {
    ok: true,
    targetId: f.target_id,
    oldType: q.type,
    newType,
    oldPrompt: q.prompt ?? "",
    newPrompt: newPayload.prompt ?? "",
    mode,
    payload: newPayload,
  };
}

function printSummary(results: RegenOutcome[]): void {
  const ok = results.filter((r): r is Extract<RegenOutcome, { ok: true }> => r.ok);
  const failed = results.filter((r): r is Extract<RegenOutcome, { ok: false }> => !r.ok);

  console.log("");
  console.log("══════════════════════════════════════════════════════════════");
  console.log(`SUMMARY — ${results.length} findings processed`);
  console.log(`  ✓ regenerated: ${ok.length}`);
  console.log(`  ✗ skipped/failed: ${failed.length}`);
  console.log("");

  // Bucket by old_type → new_type transition
  const transitions = new Map<string, RegenOutcome[]>();
  for (const r of ok) {
    const key = `${r.oldType} → ${r.newType}`;
    const list = transitions.get(key) ?? [];
    list.push(r);
    transitions.set(key, list);
  }
  console.log("BY TYPE TRANSITION:");
  for (const [key, list] of Array.from(transitions.entries()).sort(
    (a, b) => b[1].length - a[1].length,
  )) {
    console.log(`  ${key.padEnd(40)} ${list.length}`);
    const sample = list[0] as Extract<RegenOutcome, { ok: true }>;
    console.log(`    sample: ${sample.targetId}`);
    console.log(`      old: ${sample.oldPrompt.slice(0, 100)}`);
    console.log(`      new: ${sample.newPrompt.slice(0, 100)}`);
    console.log(`      shape: ${typeSummary(sample.newType, sample.payload)}`);
  }

  if (failed.length > 0) {
    console.log("");
    console.log("FAILED:");
    for (const r of failed) {
      console.log(`  ${r.targetId} (${r.oldType}): ${r.reason}`);
    }
  }
  console.log("══════════════════════════════════════════════════════════════");
}

async function main() {
  console.log(
    `QC bot regen v2 — ${DRY ? "DRY RUN" : "LIVE"}` +
      (SEVERITY ? ` severity=${SEVERITY}` : "") +
      (AUDIT_RUN ? ` audit_run=${AUDIT_RUN}` : "") +
      (LIMIT ? ` limit=${LIMIT}` : ""),
  );
  console.log("");

  const findings = await fetchFindings();
  console.log(`Found ${findings.length} open findings to process.`);
  if (findings.length === 0) return;

  const results: RegenOutcome[] = [];
  for (let i = 0; i < findings.length; i++) {
    const f = findings[i];
    process.stdout.write(`  [${i + 1}/${findings.length}] ${f.target_id} (${f.finding_type}/${f.severity}) ... `);
    const r = await processFinding(f);
    if (r.ok) {
      process.stdout.write(`✓ ${r.oldType}→${r.newType}\n`);
    } else {
      process.stdout.write(`✗ ${r.reason}\n`);
    }
    results.push(r);
    // Gentle pacing — avoid rate-limiting the AI providers
    await new Promise((res) => setTimeout(res, 500));
  }

  printSummary(results);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
