/**
 * Format-rescue executor — the "hands" that act on
 * judgeFormatRescue's recommendations.
 *
 * Reads recent format_rescue_recommendation rows from content_qc_log
 * that haven't been executed yet, dispatches each to the right
 * executor:
 *
 *   keep_as_is                          → no-op + log skipped
 *   drop_audio                          → null audio_url + related fields
 *   drop_image                          → null image_url
 *   convert_to_text_only                → drop both
 *   regenerate_audio_with_constraint    → rerun TTS with constraint
 *   regenerate_image_with_constraint    → rerun Imagen with constraint
 *   convert_to_missing_word
 *   convert_to_sentence_build
 *   convert_to_category_sort
 *   convert_to_tap_to_pair
 *   convert_to_space_insertion          → LLM shape converter, swap question shape
 *   render_chart_via_css                → build chart_data, drop image_url
 *   drop_question_entirely              → remove from JSON
 *
 * Edits app/data/{grade}-standards-questions.json. Logs to
 * content_qc_log with change_type='format_executed'. Marks the
 * source finding `fixed`. Quarantines question pending verify.
 *
 *   npx tsx scripts/qc-bot-format-execute.ts                  (live, all pending)
 *   npx tsx scripts/qc-bot-format-execute.ts --target=RF.K.1c-Q1
 *   npx tsx scripts/qc-bot-format-execute.ts --dry-run
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  generateImage,
  generateSpeech,
} from "@/lib/ai/readee-ai";
import {
  convertToShape,
  buildChartSpec,
  type ConvertableShape,
} from "@/lib/ai/qc-shape-converter";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SYSTEM_TEACHER_ID = process.env.QC_BOT_TEACHER_ID;
if (!SUPABASE_URL || !SERVICE_KEY || !SYSTEM_TEACHER_ID) {
  console.error("Need URL + KEY + QC_BOT_TEACHER_ID");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const DRY = process.argv.includes("--dry-run");
const targetArg = process.argv.find((a) => a.startsWith("--target="));
const TARGET_FILTER = targetArg ? targetArg.split("=")[1] : null;

const DATA_DIR = path.join(process.cwd(), "app", "data");
const GRADE_FILES: Record<string, string> = {
  K: "kindergarten-standards-questions.json",
  "1st": "1st-grade-standards-questions.json",
  "2nd": "2nd-grade-standards-questions.json",
  "3rd": "3rd-grade-standards-questions.json",
  "4th": "4th-grade-standards-questions.json",
};

function gradeForTargetId(targetId: string): string | null {
  if (/^(R[FILi]|L|SL|W)\.K\./.test(targetId)) return "K";
  if (/^K\./.test(targetId)) return "K";
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

const fileCache = new Map<string, any>();
async function loadGrade(grade: string): Promise<any | null> {
  if (fileCache.has(grade)) return fileCache.get(grade);
  const filename = GRADE_FILES[grade];
  if (!filename) return null;
  const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
  const data = JSON.parse(raw);
  fileCache.set(grade, data);
  return data;
}
async function saveGrade(grade: string, data: any) {
  const filename = GRADE_FILES[grade];
  if (!filename) return;
  await fs.writeFile(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}
function findQuestion(file: any, targetId: string) {
  for (let i = 0; i < file.standards.length; i++) {
    const j = file.standards[i].questions.findIndex((q: any) => q.id === targetId);
    if (j >= 0) return { stdIdx: i, qIdx: j, std: file.standards[i], q: file.standards[i].questions[j] };
  }
  return null;
}

type Recommendation = {
  id: string; // log row id
  target_id: string;
  finding_id: string | null;
  action: string;
  reason: string;
  constraint: string | null;
  before: any;
};

async function loadPending(): Promise<Recommendation[]> {
  let q = sb
    .from("content_qc_log")
    .select("id, target_id, finding_id, reason, before, after, created_at")
    .eq("change_type", "format_rescue_recommendation")
    .order("created_at", { ascending: false });
  if (TARGET_FILTER) q = q.eq("target_id", TARGET_FILTER);
  const { data, error } = await q;
  if (error) {
    console.error("query failed:", error.message);
    return [];
  }

  // Filter out ones already executed (have a sibling format_executed
  // row for the same finding_id).
  const recs: Recommendation[] = (data ?? []).map((r: any) => ({
    id: r.id,
    target_id: r.target_id,
    finding_id: r.finding_id,
    action: r.after?.action ?? "keep_as_is",
    reason: r.reason ?? "",
    constraint: r.after?.constraint ?? null,
    before: r.before,
  }));
  if (recs.length === 0) return [];

  const findingIds = recs.map((r) => r.finding_id).filter((x): x is string => !!x);
  const { data: executed } = await sb
    .from("content_qc_log")
    .select("finding_id")
    .eq("change_type", "format_executed")
    .in("finding_id", findingIds);
  const executedSet = new Set(
    ((executed ?? []) as { finding_id: string }[]).map((r) => r.finding_id),
  );

  return recs.filter((r) => !r.finding_id || !executedSet.has(r.finding_id));
}

async function logExecution(
  rec: Recommendation,
  outcome: "applied" | "skipped" | "errored",
  detail: any,
) {
  if (DRY) return;
  await sb.from("content_qc_log").insert({
    target_kind: "question",
    target_id: rec.target_id,
    change_type: "format_executed",
    before: rec.before,
    after: { action: rec.action, outcome, detail },
    reason: `Executed format-rescue: ${rec.action} → ${outcome}.`,
    finding_id: rec.finding_id,
    agent: "qc-bot/format-execute",
  });
  if (outcome === "applied" && rec.finding_id) {
    await sb
      .from("content_audit_findings")
      .update({
        status: "fixed",
        resolved_at: new Date().toISOString(),
        resolver_note: `format-execute: ${rec.action} applied. ${rec.reason.slice(0, 200)}`,
      })
      .eq("id", rec.finding_id);
    // Quarantine the question pending verify on the new shape.
    await sb.rpc("quarantine_question", {
      p_target_id: rec.target_id,
      p_finding_id: rec.finding_id,
    });
  }
}

/* ───────── per-action executors ───────── */

async function execDropMedia(
  rec: Recommendation,
  drop: { audio?: boolean; image?: boolean },
) {
  const grade = gradeForTargetId(rec.target_id);
  if (!grade) return logExecution(rec, "errored", { reason: "grade unknown" });
  const file = await loadGrade(grade);
  const found = findQuestion(file, rec.target_id);
  if (!found) return logExecution(rec, "errored", { reason: "question not found" });

  const beforeUrls = {
    audio_url: found.q.audio_url ?? null,
    image_url: found.q.image_url ?? null,
  };
  if (drop.audio) {
    delete found.q.audio_url;
    delete found.q.hint_audio_url;
    delete found.q.passage_audio_url;
    delete found.q.choices_audio_urls;
    delete found.q.sentence_audio_url;
  }
  if (drop.image) {
    delete found.q.image_url;
  }
  if (DRY) {
    console.log(`    DRY drop_${drop.audio ? "audio" : ""}${drop.image ? "image" : ""}`);
    return logExecution(rec, "applied", { drop, before: beforeUrls });
  }
  await saveGrade(grade, file);
  console.log(`    ✓ dropped ${drop.audio ? "audio " : ""}${drop.image ? "image" : ""}`);
  return logExecution(rec, "applied", { drop, before: beforeUrls });
}

async function execRegenAudioConstraint(rec: Recommendation) {
  const grade = gradeForTargetId(rec.target_id);
  if (!grade) return logExecution(rec, "errored", { reason: "grade unknown" });
  const file = await loadGrade(grade);
  const found = findQuestion(file, rec.target_id);
  if (!found) return logExecution(rec, "errored", { reason: "question not found" });
  const audioUrl = found.q.audio_url as string | undefined;
  if (!audioUrl) {
    return logExecution(rec, "skipped", { reason: "no existing audio_url" });
  }
  const text = `${rec.constraint ?? ""}\n\n${found.q.prompt}`.trim();
  if (DRY) {
    console.log(`    DRY regen-audio with constraint: ${(rec.constraint ?? "").slice(0, 60)}`);
    return logExecution(rec, "applied", { constraint: rec.constraint });
  }
  const tts = await generateSpeech({ teacherId: SYSTEM_TEACHER_ID!, text });
  if (!tts.ok) return logExecution(rec, "errored", { reason: tts.error });
  // Re-upload to existing path so URL stays valid
  const m = audioUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (m) {
    const fetched = await fetch(tts.audioUrl);
    if (fetched.ok) {
      const buf = Buffer.from(await fetched.arrayBuffer());
      await sb.storage.from(m[1]).upload(m[2], buf, { contentType: "audio/mpeg", upsert: true });
    }
  }
  console.log(`    ✓ audio regen-with-constraint`);
  return logExecution(rec, "applied", { constraint: rec.constraint });
}

async function execRegenImageConstraint(rec: Recommendation) {
  const grade = gradeForTargetId(rec.target_id);
  if (!grade) return logExecution(rec, "errored", { reason: "grade unknown" });
  const file = await loadGrade(grade);
  const found = findQuestion(file, rec.target_id);
  if (!found) return logExecution(rec, "errored", { reason: "question not found" });
  const imageUrl = found.q.image_url as string | undefined;
  if (!imageUrl) return logExecution(rec, "skipped", { reason: "no existing image_url" });
  const prompt = [
    "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
    `Scene: ${found.q.prompt.slice(0, 220)}`,
    rec.constraint ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  if (DRY) {
    console.log(`    DRY regen-image with constraint`);
    return logExecution(rec, "applied", { constraint: rec.constraint });
  }
  const img = await generateImage({ teacherId: SYSTEM_TEACHER_ID!, prompt });
  if (!img.ok) return logExecution(rec, "errored", { reason: img.error });
  const m = imageUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (m) {
    const buf = Buffer.from(img.imageBase64, "base64");
    await sb.storage.from(m[1]).upload(m[2], buf, { contentType: img.mimeType, upsert: true });
  }
  console.log(`    ✓ image regen-with-constraint`);
  return logExecution(rec, "applied", { constraint: rec.constraint });
}

async function execConvertShape(rec: Recommendation, shape: ConvertableShape) {
  const grade = gradeForTargetId(rec.target_id);
  if (!grade) return logExecution(rec, "errored", { reason: "grade unknown" });
  const file = await loadGrade(grade);
  const found = findQuestion(file, rec.target_id);
  if (!found) return logExecution(rec, "errored", { reason: "question not found" });
  const conv = await convertToShape({
    shape,
    sourcePrompt: found.q.prompt,
    sourceChoices: found.q.choices,
    sourceCorrect: String(found.q.correct ?? ""),
    sourceHint: found.q.hint,
    standardId: found.std.standard_id,
    standardDescription: found.std.standard_description,
    rescueReason: rec.reason,
    rescueConstraint: rec.constraint ?? undefined,
  });
  if (!conv.ok) return logExecution(rec, "errored", { reason: conv.error });
  if (DRY) {
    console.log(`    DRY convert_to_${shape}`);
    return logExecution(rec, "applied", { shape, fields: conv.fields });
  }
  // Replace the question fields in place. Keep id, difficulty, drop
  // old MCQ-only fields.
  const old = found.q;
  const { type: _ignoredType, ...convRest } = conv.fields;
  const merged = {
    id: old.id,
    difficulty: old.difficulty,
    prompt: conv.fields.prompt ?? old.prompt,
    correct: conv.fields.correct ?? old.correct,
    hint: conv.fields.hint ?? old.hint,
    ...convRest,
    type: shape,
  };
  // Drop URLs since the shape is different now; verify will re-derive.
  delete (merged as any).audio_url;
  delete (merged as any).hint_audio_url;
  delete (merged as any).image_url;
  delete (merged as any).choices;
  file.standards[found.stdIdx].questions[found.qIdx] = merged;
  await saveGrade(grade, file);
  console.log(`    ✓ converted to ${shape}`);
  return logExecution(rec, "applied", { shape, fields: conv.fields });
}

async function execRenderChartViaCss(rec: Recommendation) {
  const grade = gradeForTargetId(rec.target_id);
  if (!grade) return logExecution(rec, "errored", { reason: "grade unknown" });
  const file = await loadGrade(grade);
  const found = findQuestion(file, rec.target_id);
  if (!found) return logExecution(rec, "errored", { reason: "question not found" });
  const spec = await buildChartSpec({
    prompt: found.q.prompt,
    constraint: rec.constraint ?? undefined,
  });
  if (!spec.ok) return logExecution(rec, "errored", { reason: spec.error });
  if (DRY) {
    console.log(`    DRY render_chart_via_css → ${spec.chart.kind} with ${spec.chart.series.length} series`);
    return logExecution(rec, "applied", { chart: spec.chart });
  }
  // Drop the broken image, attach chart_data so the runner renders inline.
  delete found.q.image_url;
  found.q.chart_data = spec.chart;
  await saveGrade(grade, file);
  console.log(`    ✓ chart_data attached, image dropped`);
  return logExecution(rec, "applied", { chart: spec.chart });
}

async function execDropQuestion(rec: Recommendation) {
  const grade = gradeForTargetId(rec.target_id);
  if (!grade) return logExecution(rec, "errored", { reason: "grade unknown" });
  const file = await loadGrade(grade);
  const found = findQuestion(file, rec.target_id);
  if (!found) return logExecution(rec, "errored", { reason: "question not found" });
  if (DRY) {
    console.log(`    DRY drop_question_entirely`);
    return logExecution(rec, "applied", { dropped: true });
  }
  file.standards[found.stdIdx].questions.splice(found.qIdx, 1);
  await saveGrade(grade, file);
  console.log(`    ✓ removed question from JSON`);
  return logExecution(rec, "applied", { dropped: true });
}

/* ───────── main ───────── */

async function main() {
  console.log(`Format-execute ${DRY ? "(DRY RUN)" : ""}${TARGET_FILTER ? ` target=${TARGET_FILTER}` : ""}`);
  const recs = await loadPending();
  console.log(`Pending: ${recs.length} recommendation(s).`);

  for (const rec of recs) {
    console.log(`  [${rec.target_id}] ${rec.action.toUpperCase()}`);
    try {
      switch (rec.action) {
        case "keep_as_is":
          await logExecution(rec, "skipped", { reason: "judge said keep" });
          break;
        case "drop_audio":
          await execDropMedia(rec, { audio: true });
          break;
        case "drop_image":
          await execDropMedia(rec, { image: true });
          break;
        case "convert_to_text_only":
          await execDropMedia(rec, { audio: true, image: true });
          break;
        case "regenerate_audio_with_constraint":
          await execRegenAudioConstraint(rec);
          break;
        case "regenerate_image_with_constraint":
          await execRegenImageConstraint(rec);
          break;
        case "convert_to_missing_word":
        case "convert_to_sentence_build":
        case "convert_to_category_sort":
        case "convert_to_tap_to_pair":
        case "convert_to_space_insertion": {
          const shape = rec.action.replace(
            "convert_to_",
            "",
          ) as ConvertableShape;
          await execConvertShape(rec, shape);
          break;
        }
        case "render_chart_via_css":
          await execRenderChartViaCss(rec);
          break;
        case "drop_question_entirely":
          await execDropQuestion(rec);
          break;
        default:
          await logExecution(rec, "skipped", { reason: `unknown action: ${rec.action}` });
      }
    } catch (e: any) {
      console.log(`    ! threw: ${e?.message ?? "unknown"}`);
      await logExecution(rec, "errored", { reason: e?.message ?? "unknown" });
    }
    await new Promise((r) => setTimeout(r, 700));
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
