/**
 * QC bot Phase-3.5 worker — lesson-slide audio regeneration.
 *
 * Mirror of qc-bot-regen-audio for target_kind='lesson_slide' /
 * finding_type='step.audio_quality'. Currently 129 of the 151 open
 * fails are these.
 *
 * For each finding:
 *  1. Parse target_id "{standardId}#{stepId}" → e.g. "RI.K.6#S4d"
 *  2. Look up the lesson + step in app/data/sample-lessons.json
 *  3. Get the step's ttsScript
 *  4. Regenerate via generateSpeech
 *  5. Re-upload to the existing audio_url path so URLs stay valid
 *  6. Log + mark finding fixed
 *
 *   npx tsx scripts/qc-bot-regen-step-audio.ts --dry-run
 *   npx tsx scripts/qc-bot-regen-step-audio.ts --limit=5
 *   npx tsx scripts/qc-bot-regen-step-audio.ts        (full run)
 *
 * Cost: ~$0.02 / regen × ~129 = ~$2.60 to clear the bucket.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { generateSpeech } from "@/lib/ai/readee-ai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SYSTEM_TEACHER_ID = process.env.QC_BOT_TEACHER_ID;
if (!SUPABASE_URL || !SERVICE_KEY || !SYSTEM_TEACHER_ID) {
  console.error("Need URL + KEY + QC_BOT_TEACHER_ID");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const DRY = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;

const LESSONS_PATH = path.join(
  process.cwd(),
  "app",
  "data",
  "sample-lessons.json",
);

let lessonsCache: any[] | null = null;
async function loadLessons(): Promise<any[]> {
  if (lessonsCache) return lessonsCache;
  const raw = await fs.readFile(LESSONS_PATH, "utf-8");
  lessonsCache = JSON.parse(raw) as any[];
  return lessonsCache!;
}

/** Parse "RI.K.6#S4d" → standardId="RI.K.6", slideNum=4, sub="d" */
function parseTarget(targetId: string): {
  standardId: string;
  slideNum: number;
  sub: string;
} | null {
  const m = targetId.match(/^([^#]+)#S(\d+)([a-z])$/i);
  if (!m) return null;
  return {
    standardId: m[1],
    slideNum: Number(m[2]),
    sub: m[3].toLowerCase(),
  };
}

function parseStoragePath(url: string): { bucket: string; path: string } | null {
  const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: m[2] };
}

async function processFinding(f: any) {
  const targetId = f.target_id as string;
  const snap = f.target_snapshot ?? {};
  const audioUrl = snap.audio_url as string | undefined;
  if (!audioUrl) {
    console.log(`  [${targetId}] skip — no audio_url in snapshot`);
    return false;
  }

  const parsed = parseTarget(targetId);
  if (!parsed) {
    console.log(`  [${targetId}] skip — could not parse target_id`);
    return false;
  }

  const lessons = await loadLessons();
  const lesson = lessons.find((l) => l.standardId === parsed.standardId);
  if (!lesson) {
    console.log(`  [${targetId}] skip — lesson not found in JSON`);
    return false;
  }
  const slide = (lesson.slides ?? []).find(
    (s: any) => s.slide === parsed.slideNum,
  );
  if (!slide) {
    console.log(`  [${targetId}] skip — slide ${parsed.slideNum} not found`);
    return false;
  }
  const step = (slide.steps ?? []).find((s: any) => s.sub === parsed.sub);
  if (!step) {
    console.log(`  [${targetId}] skip — step "${parsed.sub}" not found`);
    return false;
  }
  const ttsScript = (step.ttsScript ?? "").trim();
  if (!ttsScript) {
    console.log(`  [${targetId}] skip — no ttsScript`);
    return false;
  }

  const storage = parseStoragePath(audioUrl);
  if (!storage) {
    console.log(`  [${targetId}] skip — couldn't parse storage path`);
    return false;
  }

  console.log(
    `  [${targetId}] regenerating → ${storage.bucket}/${storage.path}`,
  );
  if (DRY) {
    console.log(`    DRY text: ${ttsScript.slice(0, 100)}`);
    return true;
  }

  const tts = await generateSpeech({
    teacherId: SYSTEM_TEACHER_ID!,
    text: ttsScript,
  });
  if (!tts.ok) {
    console.log(`    ! generateSpeech failed: ${tts.error}`);
    return false;
  }
  const fetched = await fetch(tts.audioUrl);
  if (!fetched.ok) {
    console.log(`    ! couldn't fetch new audio: ${fetched.status}`);
    return false;
  }
  const buf = Buffer.from(await fetched.arrayBuffer());
  const { error: upErr } = await sb.storage
    .from(storage.bucket)
    .upload(storage.path, buf, {
      contentType: "audio/mpeg",
      upsert: true,
    });
  if (upErr) {
    console.log(`    ! re-upload failed: ${upErr.message}`);
    return false;
  }

  await sb
    .from("content_audit_findings")
    .update({
      status: "fixed",
      resolved_at: new Date().toISOString(),
      resolver_note: "QC bot Phase-3.5: lesson-slide audio regenerated.",
    })
    .eq("id", f.id);

  await sb.from("content_qc_log").insert({
    target_kind: "lesson_slide",
    target_id: targetId,
    change_type: "regen_audio",
    before: { audio_url: audioUrl, finding: f.message },
    after: { audio_url: audioUrl, regen_text: ttsScript },
    reason: f.message,
    finding_id: f.id,
    agent: "qc-bot/regen-step-audio",
  });

  console.log(`    ✓ regenerated`);
  return true;
}

async function main() {
  console.log(`QC bot — lesson-slide audio regen ${DRY ? "(DRY RUN)" : ""}`);

  let q = sb
    .from("content_audit_findings")
    .select("id, target_id, message, target_snapshot")
    .eq("finding_type", "step.audio_quality")
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
  console.log(`Found ${rows.length} open lesson-slide audio fails.`);

  let ok = 0;
  let skip = 0;
  for (const f of rows) {
    const result = await processFinding(f);
    if (result) ok++;
    else skip++;
    await new Promise((r) => setTimeout(r, 800));
  }
  console.log(`Done — regenerated ${ok}, skipped ${skip}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
