/**
 * QC bot Phase-3 worker — audio regeneration.
 *
 * Consumes open q.audio_quality fails (after the convention pre-filter
 * in audit-content.ts has already excluded G2-4-choices and phonics-
 * spelling FPs, and the qc-bot-cleanup.ts has dismissed any pre-patch
 * stragglers). Reruns generateSpeech and overwrites the audio at the
 * SAME storage path.
 *
 *   npx tsx scripts/qc-bot-regen-audio.ts --dry-run
 *   npx tsx scripts/qc-bot-regen-audio.ts --limit=5
 *   npx tsx scripts/qc-bot-regen-audio.ts        (full run)
 *
 * Cost: ~$0.02 / regen × ~25 fails = ~$0.60 to clear the bucket.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { generateSpeech } from "@/lib/ai/readee-ai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SYSTEM_TEACHER_ID = process.env.QC_BOT_TEACHER_ID;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!SYSTEM_TEACHER_ID) {
  console.error("Need QC_BOT_TEACHER_ID — see qc-bot-regen-images.ts");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const DRY = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;

function parseStoragePath(url: string): { bucket: string; path: string } | null {
  const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: m[2] };
}

/** Build the expected read-aloud text for a question, matching the
 *  per-grade convention used at original generation time:
 *  - K, 1st: passage + prompt + choices (perQuestionTts=true)
 *  - 2nd-4th: passage + prompt only (perQuestionTts=false)
 */
function buildExpectedText(snapshot: any, targetId: string): string {
  const promptText = String(snapshot.prompt ?? "").trim();
  const choices = Array.isArray(snapshot.choices)
    ? (snapshot.choices as string[])
    : [];
  const isKor1 = /^(K\.|RF\.K\.|RI\.K\.|RL\.K\.|L\.K\.|RF\.1\.|RI\.1\.|RL\.1\.|L\.1\.)/.test(
    targetId,
  );
  if (isKor1 && choices.length > 0) {
    return `${promptText}\n\n${choices.map((c, i) => `${["A", "B", "C", "D"][i] ?? i + 1}. ${c}`).join("\n")}`;
  }
  return promptText;
}

async function processFinding(f: any) {
  const targetId = f.target_id as string;
  const snapshot = f.target_snapshot ?? {};
  const audioUrl = snapshot.audio_url as string | undefined;
  if (!audioUrl) {
    console.log(`  [${targetId}] skip — no audio_url in snapshot`);
    return false;
  }
  const parsed = parseStoragePath(audioUrl);
  if (!parsed) {
    console.log(`  [${targetId}] skip — couldn't parse storage path`);
    return false;
  }
  const text = buildExpectedText(snapshot, targetId);
  if (!text) {
    console.log(`  [${targetId}] skip — empty expected text`);
    return false;
  }

  console.log(`  [${targetId}] regenerating → ${parsed.bucket}/${parsed.path}`);
  if (DRY) {
    console.log(`    DRY text: ${text.slice(0, 120).replace(/\n/g, " · ")}…`);
    return true;
  }

  const res = await generateSpeech({
    teacherId: SYSTEM_TEACHER_ID!,
    text,
  });
  if (!res.ok) {
    console.log(`    ! generateSpeech failed: ${res.error}`);
    return false;
  }

  // generateSpeech writes to its own path; we need the bytes to
  // upload to the original path. Re-fetch from the URL it returned.
  const fetched = await fetch(res.audioUrl);
  if (!fetched.ok) {
    console.log(`    ! couldn't fetch new audio: ${fetched.status}`);
    return false;
  }
  const buf = Buffer.from(await fetched.arrayBuffer());
  const { error: upErr } = await sb.storage
    .from(parsed.bucket)
    .upload(parsed.path, buf, {
      contentType: "audio/mpeg",
      upsert: true,
    });
  if (upErr) {
    console.log(`    ! re-upload failed: ${upErr.message}`);
    return false;
  }

  const { error: updErr } = await sb
    .from("content_audit_findings")
    .update({
      status: "fixed",
      resolved_at: new Date().toISOString(),
      resolver_note: "QC bot Phase-3: audio regenerated and re-uploaded.",
    })
    .eq("id", f.id);
  if (updErr) {
    console.log(`    ! finding update failed: ${updErr.message}`);
    return false;
  }
  console.log(`    ✓ regenerated`);
  return true;
}

async function main() {
  console.log(`QC bot — audio regen ${DRY ? "(DRY RUN)" : ""}`);

  let q = sb
    .from("content_audit_findings")
    .select("id, target_id, message, target_snapshot, severity")
    .eq("finding_type", "q.audio_quality")
    .eq("severity", "fail")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (LIMIT) q = q.limit(LIMIT);

  const { data, error } = await q;
  if (error) {
    console.error("query failed:", error.message);
    process.exit(1);
  }
  const rows = data ?? [];
  console.log(`Found ${rows.length} open audio fails to regen.`);

  let ok = 0;
  let skip = 0;
  for (const f of rows) {
    const result = await processFinding(f);
    if (result) ok++;
    else skip++;
    // Sequential, with a small breather. Gemini TTS hates concurrency.
    await new Promise((r) => setTimeout(r, 800));
  }
  console.log(`Done — regenerated ${ok}, skipped ${skip}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
