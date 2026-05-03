/**
 * Format-rescue recommender.
 *
 * Identifies "stuck" findings — those that have been regen'd at
 * least once and STILL surface as fail in the audit (i.e. status
 * was 'fixed' but verify-regens reopened them, OR they're being
 * generated repeatedly at fail). Runs judgeFormatRescue against
 * each, logs a concrete recommendation to content_qc_log, and tags
 * the finding with `resolver_note='format-rescue: <action> — <reason>'`.
 *
 * Doesn't auto-mutate the question — the recommendation is meant for
 * a human (or a follow-up worker) to act on. This is the brain step;
 * the next step is per-action executors.
 *
 *   npx tsx scripts/qc-bot-format-recommend.ts                 (stuck items)
 *   npx tsx scripts/qc-bot-format-recommend.ts --target=RF.K.1d-Q1
 *   npx tsx scripts/qc-bot-format-recommend.ts --dry-run
 *
 * Cost: ~$0.002 / item. Bucket of 30 stuck items = ~$0.06.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { judgeFormatRescue } from "@/lib/ai/qc-format-rescue";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const DRY = process.argv.includes("--dry-run");
const targetArg = process.argv.find((a) => a.startsWith("--target="));
const TARGET_FILTER = targetArg ? targetArg.split("=")[1] : null;

async function main() {
  console.log(`Format-rescue ${DRY ? "(DRY RUN)" : ""}${TARGET_FILTER ? ` target=${TARGET_FILTER}` : ""}`);

  // Pull "stuck" findings: open + audio_quality or image_quality + the
  // resolver_note shows a previous regen attempt OR finding has been
  // touched more than once.
  let q = sb
    .from("content_audit_findings")
    .select("id, target_id, finding_type, target_snapshot, message, resolver_note, severity")
    .in("finding_type", ["q.audio_quality", "q.image_quality"])
    .eq("status", "open")
    .in("severity", ["fail", "warn"]);
  if (TARGET_FILTER) q = q.eq("target_id", TARGET_FILTER);
  const { data, error } = await q;
  if (error) {
    console.error("query failed:", error.message);
    process.exit(1);
  }

  // Filter to ones that show evidence of prior regen (resolver_note
  // mentions verify or QC bot, OR there's a prior fixed→reopen trail
  // in content_qc_log). Catch-all: take everything if --target was
  // explicit.
  const allRows = (data ?? []) as any[];
  let rows = allRows;
  if (!TARGET_FILTER) {
    rows = allRows.filter((r) =>
      /verify|reopen|qc bot|regenerated/i.test(r.resolver_note ?? ""),
    );
  }
  console.log(`Found ${rows.length} stuck findings to evaluate.`);

  let recommended = 0;
  for (const f of rows) {
    const snap = f.target_snapshot ?? {};
    const targetId = f.target_id;
    const standardId = (snap.standard_id ?? null) as string | null;
    const kind = (snap.kind ?? snap.type ?? "multiple_choice") as string;
    const prompt = (snap.prompt ?? "") as string;
    const choices = Array.isArray(snap.choices) ? (snap.choices as string[]) : undefined;
    const correct = (snap.correct ?? null) as string | null;
    const hasAudio = !!snap.audio_url;
    const hasImage = !!snap.image_url;

    // Count prior regens on this target_id from content_qc_log.
    const { count: priorRegens } = await sb
      .from("content_qc_log")
      .select("id", { count: "exact", head: true })
      .eq("target_kind", "question")
      .eq("target_id", targetId)
      .in("change_type", ["regen_image", "regen_audio", "regen_question"]);

    const v = await judgeFormatRescue({
      targetId,
      standardId,
      kind,
      prompt,
      choices,
      correct: correct ?? undefined,
      hasAudio,
      hasImage,
      failureReason: f.message ?? "",
      failureType: f.finding_type,
      attemptCount: priorRegens ?? 0,
    });

    if (!v.ok) {
      console.log(`  [${targetId}] judge failed: ${v.error}`);
      continue;
    }
    const r = v.result;
    console.log(
      `  [${targetId}] ${r.action.toUpperCase()} — ${r.reason.slice(0, 100)}`,
    );
    if (r.constraint) {
      console.log(`    constraint: ${r.constraint.slice(0, 100)}`);
    }
    recommended++;
    if (DRY) continue;

    await sb.from("content_qc_log").insert({
      target_kind: "question",
      target_id: targetId,
      change_type: "format_rescue_recommendation",
      before: { kind, hasAudio, hasImage, finding: f.message, attempts: priorRegens },
      after: { action: r.action, constraint: r.constraint ?? null },
      reason: r.reason,
      finding_id: f.id,
      agent: "qc-bot/format-rescue",
    });
    await sb
      .from("content_audit_findings")
      .update({
        resolver_note: `format-rescue: ${r.action} — ${r.reason.slice(0, 240)}`,
      })
      .eq("id", f.id);
    await new Promise((r) => setTimeout(r, 700));
  }

  console.log(`\nDone — ${recommended} recommendations logged.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
