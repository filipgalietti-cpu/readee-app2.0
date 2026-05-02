/**
 * QC bot Phase-4 worker — question pedagogy regeneration.
 *
 * Consumes open q.should_be_asked + q.better_format findings. For
 * each, calls regenerateMCQQuestion with a constraint built from the
 * audit's specific critique, edits the source JSON file in
 * app/data/{grade}-standards-questions.json, logs the before/after
 * to content_qc_log, marks the finding fixed, and unquarantines the
 * question.
 *
 *   npx tsx scripts/qc-bot-regen-questions.ts --dry-run
 *   npx tsx scripts/qc-bot-regen-questions.ts --limit=5
 *   npx tsx scripts/qc-bot-regen-questions.ts --severity=fail
 *
 * Cost: ~$0.002 / regen × ~200 fails+warns = ~$0.40 to clear the bucket.
 *
 * IMPORTANT: regenerated questions DO NOT carry over the old image_url
 * or audio_url — those have to be regenerated separately for the new
 * prompt/choices. The worker un-quarantines on success but the next
 * audit pass will flag them again until media is rebuilt.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { regenerateMCQQuestion } from "@/lib/ai/readee-ai";
import { findStandardById } from "@/lib/data/all-standards";

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

const DRY = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const sevArg = process.argv.find((a) => a.startsWith("--severity="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;
const SEVERITY = sevArg ? sevArg.split("=")[1] : null;

const DATA_DIR = path.join(process.cwd(), "app", "data");
const GRADE_FILES: Record<string, string> = {
  K: "kindergarten-standards-questions.json",
  "1st": "1st-grade-standards-questions.json",
  "2nd": "2nd-grade-standards-questions.json",
  "3rd": "3rd-grade-standards-questions.json",
  "4th": "4th-grade-standards-questions.json",
};

/** Map a target_id like "RF.3.3d-Q5" to its grade folder key.
 *  Handles all CCSS prefixes: K.L.x (kindergarten Language wraps the
 *  domain prefix differently), and the standard {strand}.{grade}.{x}
 *  shape used everywhere else. */
function gradeForTargetId(targetId: string): string | null {
  // Strand-prefixed K ids like RI.K.9, RL.K.10, RF.K.1d, L.K.4
  if (/^(R[FILi]|L|SL|W)\.K\./.test(targetId)) return "K";
  // Domain-prefixed K ids: K.L.6, K.RF.1
  if (/^K\./.test(targetId)) return "K";
  // Other grades — second segment is digit
  const m = targetId.match(/^(?:[A-Za-z]+\.)?(\d)\./);
  if (m) {
    const g = m[1];
    if (g === "1") return "1st";
    if (g === "2") return "2nd";
    if (g === "3") return "3rd";
    if (g === "4") return "4th";
  }
  return null;
}

/** Build the regen rejection reason from the audit finding. The
 *  audit's suggestion field often contains "Drop and replace with X" —
 *  we forward both the message AND the suggestion so the model can
 *  act on the AI judge's specific recommendation. */
function buildRejectionReason(message: string, suggestion: string | null): string {
  const parts = [
    `Audit found this question is poor pedagogy: ${message}`,
  ];
  if (suggestion && suggestion.trim()) {
    parts.push(`Audit's specific suggestion: ${suggestion}`);
  }
  parts.push(
    "Generate a NEW MCQ for the SAME standard that:",
    "- Tests the actual standard skill (not a definition or trivia about it)",
    "- Has 4 distinct choices, no duplicates, no answer leaked into the prompt",
    "- Uses grade-appropriate vocabulary",
    "- Is APPLICATION not DEFINITION (especially for performance standards)",
  );
  return parts.join("\n");
}

type StandardsFile = {
  standards: Array<{
    standard_id: string;
    standard_description: string;
    domain: string;
    parent_tip: string;
    questions: Array<{
      id: string;
      type: string;
      prompt: string;
      choices?: string[];
      correct: string;
      hint: string;
      difficulty: number;
      audio_url?: string;
      image_url?: string;
      [k: string]: any;
    }>;
  }>;
};

const fileCache = new Map<string, StandardsFile>();
async function loadGradeFile(gradeKey: string): Promise<StandardsFile | null> {
  if (fileCache.has(gradeKey)) return fileCache.get(gradeKey)!;
  const filename = GRADE_FILES[gradeKey];
  if (!filename) return null;
  const fullPath = path.join(DATA_DIR, filename);
  const raw = await fs.readFile(fullPath, "utf-8");
  const data = JSON.parse(raw) as StandardsFile;
  fileCache.set(gradeKey, data);
  return data;
}

async function saveGradeFile(gradeKey: string, data: StandardsFile) {
  const filename = GRADE_FILES[gradeKey];
  if (!filename) return;
  const fullPath = path.join(DATA_DIR, filename);
  // Pretty-print with 2-space indent to keep diffs readable.
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), "utf-8");
}

async function processFinding(f: any) {
  const targetId = f.target_id as string;
  const message = f.message as string;
  const suggestion = (f.suggestion as string | null) ?? null;
  const grade = gradeForTargetId(targetId);
  if (!grade) {
    console.log(`  [${targetId}] skip — couldn't infer grade`);
    return false;
  }

  const file = await loadGradeFile(grade);
  if (!file) {
    console.log(`  [${targetId}] skip — no JSON file for ${grade}`);
    return false;
  }

  // Locate the question across all standards in the file.
  let stdIdx = -1;
  let qIdx = -1;
  for (let i = 0; i < file.standards.length; i++) {
    const j = file.standards[i].questions.findIndex((q) => q.id === targetId);
    if (j >= 0) {
      stdIdx = i;
      qIdx = j;
      break;
    }
  }
  if (stdIdx < 0) {
    console.log(`  [${targetId}] skip — question not found in JSON`);
    return false;
  }

  const std = file.standards[stdIdx];
  const oldQ = std.questions[qIdx];
  if (!Array.isArray(oldQ.choices) || oldQ.choices.length < 2) {
    console.log(`  [${targetId}] skip — non-MCQ shape`);
    return false;
  }

  // For pedagogy regen we don't have an embedded passage; supply the
  // standard description as context so the model has a target skill.
  const passageContext = [
    `Standard: ${std.standard_id} — ${std.standard_description}`,
    `Domain: ${std.domain}`,
    `Original prompt context: ${oldQ.prompt}`,
  ].join("\n");

  const reason = buildRejectionReason(message, suggestion);
  console.log(`  [${targetId}] regenerating (${std.standard_id})`);
  if (DRY) {
    console.log(`    DRY reason: ${reason.slice(0, 120)}…`);
    return true;
  }

  const res = await regenerateMCQQuestion({
    teacherId: SYSTEM_TEACHER_ID!,
    passageBody: passageContext,
    gradeLevel: grade === "K" ? "Kindergarten" : grade,
    oldQuestion: {
      prompt: oldQ.prompt,
      choices: oldQ.choices,
      correct: String(oldQ.correct),
    },
    rejectionReason: reason,
  });
  if (!res.ok) {
    console.log(`    ! regenerateMCQQuestion failed: ${res.error}`);
    return false;
  }
  const newQ = res.question;
  if (
    !newQ.prompt ||
    !Array.isArray(newQ.choices) ||
    newQ.choices.length < 2 ||
    !newQ.correct
  ) {
    console.log(`    ! invalid regen shape, skipping`);
    return false;
  }

  // Build the replacement question — keep the original id, type,
  // difficulty. Drop the old image_url + audio_url because they
  // referenced the old prompt; QC will flag them on next pass and
  // the media regen workers will rebuild.
  const newQuestion = {
    ...oldQ,
    prompt: newQ.prompt,
    choices: newQ.choices,
    correct: newQ.correct,
    hint: newQ.hint || oldQ.hint || "",
    image_url: undefined,
    audio_url: undefined,
    hint_audio_url: undefined,
    passage_audio_url: undefined,
    choices_audio_urls: undefined,
  };

  // Persist the JSON edit.
  file.standards[stdIdx].questions[qIdx] = newQuestion as any;
  await saveGradeFile(grade, file);

  // Audit-trail log.
  await sb.from("content_qc_log").insert({
    target_kind: "question",
    target_id: targetId,
    change_type: "regen_question",
    before: {
      prompt: oldQ.prompt,
      choices: oldQ.choices,
      correct: oldQ.correct,
      hint: oldQ.hint,
    },
    after: {
      prompt: newQuestion.prompt,
      choices: newQuestion.choices,
      correct: newQuestion.correct,
      hint: newQuestion.hint,
    },
    reason: message + (suggestion ? ` || suggestion: ${suggestion}` : ""),
    finding_id: f.id,
    agent: "qc-bot/regen-questions",
  });

  // Mark finding fixed.
  await sb
    .from("content_audit_findings")
    .update({
      status: "fixed",
      resolved_at: new Date().toISOString(),
      resolver_note:
        "QC bot Phase-4: question regenerated via AI with audit critique baked in.",
    })
    .eq("id", f.id);
  // KEEP quarantined — the regen dropped image_url + audio_url; we
  // can't ship media-less questions to a kid. The next audit cycle
  // will flag them for the image + audio regen workers to rebuild,
  // and those workers unquarantine on success.
  await sb.rpc("quarantine_question", {
    p_target_id: targetId,
    p_finding_id: f.id,
  });

  console.log(`    ✓ regenerated (quarantined pending media rebuild)`);
  return true;
}

async function main() {
  console.log(
    `QC bot — question pedagogy regen ${DRY ? "(DRY RUN)" : ""}${SEVERITY ? ` severity=${SEVERITY}` : ""}`,
  );

  let q = sb
    .from("content_audit_findings")
    .select("id, target_id, message, suggestion, severity, finding_type, target_snapshot")
    .in("finding_type", ["q.should_be_asked", "q.better_format"])
    .eq("status", "open")
    .order("severity", { ascending: true }) // fail before warn
    .order("created_at", { ascending: false });
  if (SEVERITY) q = q.eq("severity", SEVERITY);
  if (LIMIT) q = q.limit(LIMIT);

  const { data, error } = await q;
  if (error) {
    console.error("query failed:", error.message);
    process.exit(1);
  }
  const rows = data ?? [];
  console.log(`Found ${rows.length} open pedagogy findings to regen.`);

  let ok = 0;
  let skip = 0;
  for (const f of rows) {
    const result = await processFinding(f);
    if (result) ok++;
    else skip++;
    await new Promise((r) => setTimeout(r, 600));
  }
  console.log(`Done — regenerated ${ok}, skipped ${skip}.`);

  // Touch findStandardById once so unused-import lints don't trip.
  void findStandardById;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
