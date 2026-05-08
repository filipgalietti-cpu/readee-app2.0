/**
 * Per-step audio generator for AI-enriched lessons.
 *
 * The enricher (scripts/qc-enrich-lessons.ts) splits a single
 * audio-backed step into 2-3 sub-steps for K-style staggered reveals,
 * but it leaves every sub-step pointing to the SAME audioFile path.
 * Result: when the renderer plays sub-step b/c, it replays the full
 * original audio while only animating the truncated displayParts.
 * Audio + display desync.
 *
 * K reference (RF.K.3b): each sub-step has a unique mp3 (S2a, S2b,
 * S2c) generated from its own ttsScript. This script enforces that
 * pattern on every ai_enrich row.
 *
 * Pipeline:
 *   1. Pull lessons where source='ai_enrich' and version=2
 *   2. For each multi-step teaching slide, regenerate audio per step
 *   3. Upload to canonical path: audio/lessons/{stdId}/S{n}{sub}.mp3
 *   4. Rewrite step.audioFile to the unique path
 *   5. Log every operation to content_qc_log so the bot's audit trail
 *      grows each run
 *
 *   npx tsx scripts/qc-enrich-audio.ts --dry-run
 *   npx tsx scripts/qc-enrich-audio.ts --limit=5
 *   npx tsx scripts/qc-enrich-audio.ts --standard=L.4.5
 *   npx tsx scripts/qc-enrich-audio.ts            (full run)
 *
 * Cost: ~$0.02 per step × ~50 steps for the May 7 batch = ~$1.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { generateSpeech } from "@/lib/ai/readee-ai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SYSTEM_TEACHER_ID = process.env.QC_BOT_TEACHER_ID;
if (!SUPABASE_URL || !SERVICE_KEY || !SYSTEM_TEACHER_ID) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + QC_BOT_TEACHER_ID");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const DRY = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;
const stdArg = process.argv.find((a) => a.startsWith("--standard="));
const STANDARD = stdArg ? stdArg.split("=")[1] : null;

type Step = {
  sub?: string;
  ttsScript?: string;
  audioFile?: string;
  [k: string]: any;
};

type Slide = {
  type?: string;
  slide?: number;
  steps?: Step[];
  [k: string]: any;
};

type LessonRow = {
  standard_id: string;
  grade: string;
  slides: Slide[];
  source: string;
  version: number;
};

function isTeachingSlide(s: Slide): boolean {
  return s?.type !== "mcq";
}

/**
 * Compute the canonical per-step audio path. Mirrors the K-reference
 * convention so the catalog is uniform: audio/lessons/{stdId}/S{n}{sub}.mp3
 */
function canonicalAudioPath(standardId: string, slideNum: number, sub: string): string {
  return `lessons/${standardId}/S${slideNum}${sub}.mp3`;
}

async function regenStepAudio(
  standardId: string,
  slideNum: number,
  step: Step,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const sub = step.sub ?? "a";
  const text = (step.ttsScript ?? "").trim();
  if (!text) return { ok: false, error: "no ttsScript" };

  const targetPath = canonicalAudioPath(standardId, slideNum, sub);

  if (DRY) {
    console.log(`      DRY [S${slideNum}${sub}] → ${targetPath} :: "${text.slice(0, 60)}"`);
    return { ok: true, path: targetPath };
  }

  const tts = await generateSpeech({ teacherId: SYSTEM_TEACHER_ID!, text });
  if (!tts.ok) return { ok: false, error: `generateSpeech: ${tts.error}` };

  const fetched = await fetch(tts.audioUrl);
  if (!fetched.ok) return { ok: false, error: `fetch: HTTP ${fetched.status}` };
  const buf = Buffer.from(await fetched.arrayBuffer());

  const { error: upErr } = await sb.storage
    .from("audio")
    .upload(targetPath, buf, { contentType: "audio/mpeg", upsert: true });
  if (upErr) return { ok: false, error: `upload: ${upErr.message}` };

  return { ok: true, path: targetPath };
}

async function processLesson(row: LessonRow): Promise<{
  regenerated: number;
  skipped: number;
  errors: string[];
}> {
  const stats = { regenerated: 0, skipped: 0, errors: [] as string[] };
  const slides = Array.isArray(row.slides) ? [...row.slides] : [];
  let mutated = false;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    if (!isTeachingSlide(slide)) continue;
    const steps = Array.isArray(slide.steps) ? slide.steps : [];
    if (steps.length < 2) continue; // single-step slides don't have the bug

    const slideNum = typeof slide.slide === "number" ? slide.slide : i + 1;

    for (let j = 0; j < steps.length; j++) {
      const step = steps[j];

      // Skip if a previous run already healed this step. We mark
      // healed steps with `audioRegenAt` so we don't pay for TTS
      // twice. Path-match alone isn't enough — step "a" keeps the
      // original S?a.mp3 path but the file plays the pre-split full
      // ttsScript. Only the marker is reliable.
      if (typeof step.audioRegenAt === "string" && step.audioRegenAt) {
        stats.skipped++;
        continue;
      }

      const beforePath = step.audioFile ?? null;
      const result = await regenStepAudio(row.standard_id, slideNum, step);
      if (!result.ok) {
        stats.errors.push(`S${slideNum}${step.sub}: ${result.error}`);
        continue;
      }
      step.audioFile = `audio/${result.path}`;
      step.audioRegenAt = new Date().toISOString();
      mutated = true;
      stats.regenerated++;

      // Audit-trail: every per-step regen is logged so the bot's
      // history shows exactly what changed and why.
      if (!DRY) {
        await sb.from("content_qc_log").insert({
          target_kind: "lesson_slide",
          target_id: `${row.standard_id}#S${slideNum}${step.sub}`,
          change_type: "enrich_step_audio",
          before: { audio_url: beforePath, ttsScript: step.ttsScript },
          after: { audio_url: step.audioFile, ttsScript: step.ttsScript },
          reason: "ai_enrich split a step but reused the original audioFile; regenerated unique mp3.",
          agent: "qc-bot/enrich-audio",
        });
      }

      await new Promise((r) => setTimeout(r, 800));
    }
  }

  if (mutated && !DRY) {
    const { error } = await sb
      .from("lessons_db")
      .update({ slides, updated_at: new Date().toISOString() })
      .eq("standard_id", row.standard_id)
      .eq("language", "en");
    if (error) stats.errors.push(`lesson update: ${error.message}`);
  }

  return stats;
}

async function main() {
  console.log(`QC bot — per-step audio enrichment ${DRY ? "(DRY RUN)" : ""}`);

  let q = sb
    .from("lessons_db")
    .select("standard_id, grade, slides, source, version")
    .eq("source", "ai_enrich")
    .eq("language", "en")
    .neq("qc_status", "quarantined")
    .neq("qc_status", "retired");
  if (STANDARD) q = q.eq("standard_id", STANDARD);
  if (LIMIT) q = q.limit(LIMIT);
  q = q.order("updated_at", { ascending: false });

  const { data, error } = await q;
  if (error) {
    console.error("query failed:", error.message);
    process.exit(1);
  }
  const rows = (data ?? []) as LessonRow[];
  console.log(`Found ${rows.length} ai_enrich lessons.`);

  let totalRegen = 0;
  let totalSkip = 0;
  let totalErr = 0;
  for (const row of rows) {
    console.log(`\n  [${row.standard_id}] processing...`);
    const r = await processLesson(row);
    console.log(`    → regen=${r.regenerated} skip=${r.skipped} errors=${r.errors.length}`);
    if (r.errors.length > 0) {
      for (const e of r.errors) console.log(`      ! ${e}`);
    }
    totalRegen += r.regenerated;
    totalSkip += r.skipped;
    totalErr += r.errors.length;
  }
  console.log(
    `\nDone — regenerated ${totalRegen}, skipped (already canonical) ${totalSkip}, errors ${totalErr}.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
