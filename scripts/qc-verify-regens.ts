/**
 * Re-audit recently-regenerated catalog items.
 *
 * After running the regen workers (image / audio / question pedagogy)
 * we mark findings as `fixed` but never have the judges look at the
 * new content. This script does that — pulls findings the QC bot
 * marked `fixed` and re-runs the relevant judge against the CURRENT
 * asset URL.
 *
 *   --since=72h     → only fixes from last 72 hours (default)
 *   --kind=image    → restrict to image | audio (default: both)
 *   --limit=20      → cap re-audit count
 *   --dry-run       → don't write reopened findings
 *
 *   npx tsx scripts/qc-verify-regens.ts --kind=image --limit=20
 *   npx tsx scripts/qc-verify-regens.ts                  (full sweep)
 *
 * On verdict:
 *  - judge passes  → log a content_qc_log "verified" entry
 *  - judge warns   → leave finding fixed, log warn
 *  - judge fails   → REOPEN the finding (status='open') so the cron
 *                    picks it up again
 *
 * Cost: ~$0.002/audio + ~$0.002/image per check.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { judgeAudioFile, judgeImageQuality } from "@/lib/ai/qc-media";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const DRY = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const sinceArg = process.argv.find((a) => a.startsWith("--since="));
const kindArg = process.argv.find((a) => a.startsWith("--kind="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;
const SINCE_RAW = sinceArg ? sinceArg.split("=")[1] : "72h";
const KIND_FILTER = kindArg ? kindArg.split("=")[1] : null;

function sinceTimestamp(): string {
  // Accepts "72h", "7d", "30d". Default 72h.
  const m = SINCE_RAW.match(/^(\d+)([hd])$/);
  const n = m ? Number(m[1]) : 72;
  const unit = m ? m[2] : "h";
  const ms = (unit === "d" ? n * 24 : n) * 60 * 60 * 1000;
  return new Date(Date.now() - ms).toISOString();
}

type Counts = {
  passed: number;
  warned: number;
  reopened: number;
  errored: number;
};

async function verifyImage(f: any, c: Counts) {
  const snap = f.target_snapshot ?? {};
  // Pull the CURRENT image_url for this question — the snapshot has
  // the OLD url; the regen workers re-uploaded to the same path so
  // the URL we have IS the new image.
  const url = snap.image_url as string | undefined;
  if (!url) {
    c.errored++;
    return;
  }
  const promptText = (snap.prompt ?? "") as string;
  const v = await judgeImageQuality({
    imageUrl: url,
    expectedScene: promptText.slice(0, 400),
  });
  if (!v.ok) {
    c.errored++;
    return;
  }
  return persistVerdict(f, "image", v.severity, v.reason);
}

async function verifyAudio(f: any, c: Counts) {
  const snap = f.target_snapshot ?? {};
  const url = snap.audio_url as string | undefined;
  if (!url) {
    c.errored++;
    return;
  }
  const promptText = String(snap.prompt ?? "").trim();
  const choices = Array.isArray(snap.choices) ? (snap.choices as string[]) : [];
  const isKor1 = /^(K\.|RF\.K\.|RI\.K\.|RL\.K\.|L\.K\.|RF\.1\.|RI\.1\.|RL\.1\.|L\.1\.)/.test(
    f.target_id,
  );
  const text =
    isKor1 && choices.length > 0
      ? `${promptText}\n\n${choices.map((cc, i) => `${["A", "B", "C", "D"][i] ?? i + 1}. ${cc}`).join("\n")}`
      : promptText;
  const v = await judgeAudioFile({
    audioUrl: url,
    expectedText: text,
  });
  if (!v.ok) {
    c.errored++;
    return;
  }
  return persistVerdict(f, "audio", v.severity, v.reason);
}

async function persistVerdict(
  f: any,
  kind: "image" | "audio",
  severity: "pass" | "warn" | "fail",
  reason: string,
) {
  const counts = currentCounts;
  if (severity === "pass") {
    counts.passed++;
    if (!DRY) {
      await sb.from("content_qc_log").insert({
        target_kind: "question",
        target_id: f.target_id,
        change_type: `verify_${kind}`,
        before: null,
        after: { verdict: "pass", reason },
        reason: `Verify-regen: judge confirmed the regenerated ${kind} is acceptable.`,
        finding_id: f.id,
        agent: "qc-bot/verify",
      });
    }
    console.log(`  [${f.target_id}] ${kind}: PASS`);
    return;
  }
  if (severity === "warn") {
    counts.warned++;
    if (!DRY) {
      await sb.from("content_qc_log").insert({
        target_kind: "question",
        target_id: f.target_id,
        change_type: `verify_${kind}`,
        before: null,
        after: { verdict: "warn", reason },
        reason: `Verify-regen: regenerated ${kind} has a warning. Leaving fixed but flagged.`,
        finding_id: f.id,
        agent: "qc-bot/verify",
      });
    }
    console.log(`  [${f.target_id}] ${kind}: WARN — ${reason.slice(0, 100)}`);
    return;
  }
  // FAIL — reopen the finding so the cron retries.
  counts.reopened++;
  if (!DRY) {
    await sb
      .from("content_audit_findings")
      .update({
        status: "open",
        resolved_at: null,
        resolver_note: `Re-opened by verify-regens — judge re-flagged: ${reason.slice(0, 240)}`,
      })
      .eq("id", f.id);
    await sb.from("content_qc_log").insert({
      target_kind: "question",
      target_id: f.target_id,
      change_type: `verify_${kind}`,
      before: null,
      after: { verdict: "fail", reason },
      reason: `Verify-regen: regenerated ${kind} STILL fails. Finding re-opened for cron.`,
      finding_id: f.id,
      agent: "qc-bot/verify",
    });
  }
  console.log(`  [${f.target_id}] ${kind}: FAIL → reopened. ${reason.slice(0, 100)}`);
}

let currentCounts: Counts = {
  passed: 0,
  warned: 0,
  reopened: 0,
  errored: 0,
};

async function main() {
  console.log(
    `Verify regens ${DRY ? "(DRY RUN)" : ""} since=${SINCE_RAW}${KIND_FILTER ? ` kind=${KIND_FILTER}` : ""}`,
  );

  const types = KIND_FILTER === "image"
    ? ["q.image_quality"]
    : KIND_FILTER === "audio"
    ? ["q.audio_quality"]
    : ["q.image_quality", "q.audio_quality"];

  let q = sb
    .from("content_audit_findings")
    .select("id, target_id, finding_type, target_snapshot, resolved_at")
    .in("finding_type", types)
    .eq("status", "fixed")
    .gte("resolved_at", sinceTimestamp())
    .order("resolved_at", { ascending: false });
  if (LIMIT) q = q.limit(LIMIT);

  const { data, error } = await q;
  if (error) {
    console.error("query failed:", error.message);
    process.exit(1);
  }
  const rows = data ?? [];
  console.log(`Found ${rows.length} recently-fixed findings to verify.`);

  for (const f of rows as any[]) {
    if (f.finding_type === "q.image_quality") {
      await verifyImage(f, currentCounts);
    } else if (f.finding_type === "q.audio_quality") {
      await verifyAudio(f, currentCounts);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(
    `\nDone — pass=${currentCounts.passed}, warn=${currentCounts.warned}, reopened=${currentCounts.reopened}, errored=${currentCounts.errored}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
