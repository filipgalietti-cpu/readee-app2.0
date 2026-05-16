/**
 * DB-first audio backfill for questions_db. Targets rows where
 * `audio_url` (and optionally `hint_audio_url`) is null, generates
 * TTS via Vertex (Autonoe), uploads to Supabase storage at the
 * canonical path, and writes the URL back to questions_db.
 *
 * Why a separate script from `fill-missing-question-assets.ts`:
 * that one writes to the grade JSON files. Per the May 7 autonomy
 * plan + memory note, nightly DB→JSON sync clobbers JSON writes —
 * the source of truth is questions_db. So we read + write the DB.
 *
 * TTS text rules (same as the original generator):
 *   - K + G1: read passage + prompt + ALL choices aloud
 *   - G2-G4: read passage + prompt only (kids read choices themselves)
 *   - Hint audio: separate row, just the hint text
 *
 * Conventions:
 *   - Storage path: audio/<folder>/<standard_id>/<question_id>.wav
 *   - hint path:    audio/<folder>/<standard_id>/<question_id>-hint.wav
 *   - Voice: Autonoe, calm reading-teacher style
 *
 * Usage:
 *   npx tsx scripts/qc-fill-question-audio-db.ts --grade=K --limit=5
 *   npx tsx scripts/qc-fill-question-audio-db.ts --finding-type=spec.tts_required
 *   npx tsx scripts/qc-fill-question-audio-db.ts --dry-run
 *
 * Flags:
 *   --grade=K|1st|2nd|3rd|4th      grade filter
 *   --finding-type=<type>           only targets that have an open audit
 *                                   finding of this type (e.g. spec.tts_required)
 *   --limit=N                       stop after N successful generations
 *   --skip-hint                     don't fill hint_audio_url
 *   --dry-run                       print plan, no API calls
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { generateSpeechVertex } from "@/lib/ai/vertex-tts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const args = process.argv.slice(2);
const GRADE = args.find((a) => a.startsWith("--grade="))?.split("=")[1] ?? null;
const FINDING_TYPE = args.find((a) => a.startsWith("--finding-type="))?.split("=")[1] ?? null;
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "0") || null;
const SKIP_HINT = args.includes("--skip-hint");
const DRY = args.includes("--dry-run");

const TTS_SAMPLE_RATE = 24000;

// The DB stores grade in mixed conventions — K canon uses "K", G1+
// often store the bare numeric "1"/"2"/"3"/"4" per master_manifest.
// Map both shapes to canonical storage folders.
const GRADE_FOLDER: Record<string, string> = {
  K: "kindergarten",
  Kindergarten: "kindergarten",
  "1": "1st-grade",
  "1st": "1st-grade",
  "2": "2nd-grade",
  "2nd": "2nd-grade",
  "3": "3rd-grade",
  "3rd": "3rd-grade",
  "4": "4th-grade",
  "4th": "4th-grade",
};

type Q = {
  id: string;
  standard_id: string;
  grade: string;
  prompt: string;
  choices: string[] | null;
  hint: string | null;
  audio_url: string | null;
  hint_audio_url: string | null;
};

function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcm.copy(buffer, 44);
  return buffer;
}

function buildExpectedTts(q: Q): string {
  const parts = String(q.prompt ?? "").split("\n\n");
  const passage = parts.length > 1 ? parts.slice(0, -1).join("\n\n") : "";
  const promptOnly = parts.length > 1 ? parts[parts.length - 1] : q.prompt;
  const choices = Array.isArray(q.choices) ? q.choices : [];
  const isKor1 = q.grade === "K" || q.grade === "1st" || q.grade === "Kindergarten";
  const passageSpoken = passage ? passage + "\n\n" : "";
  if (isKor1 && choices.length > 0) {
    return `${passageSpoken}${promptOnly}\n\n${choices.join("... ")}`;
  }
  return `${passageSpoken}${promptOnly}`;
}

async function genAudio(text: string): Promise<Buffer> {
  // Retry up to 4× on Vertex 429 (per-minute RPM cap on
  // gemini-2.5-pro-preview-tts). Exponential backoff starting at 8s
  // — anything shorter just hits the same RPM ceiling.
  let lastErr = "";
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await generateSpeechVertex({
      text,
      voice: "Autonoe",
      style:
        "in a calm, warm reading-teacher voice. Conversational and unhurried. Don't sound excited or perky — sound like a kind adult who reads with kids every day",
    });
    if (res.ok) {
      const pcm = Buffer.from(res.pcmBase64, "base64");
      return pcmToWav(pcm, TTS_SAMPLE_RATE);
    }
    lastErr = res.error;
    const is429 = /429|RESOURCE_EXHAUSTED|quota/i.test(res.error);
    if (!is429 || attempt === 4) break;
    const waitMs = 8000 * Math.pow(2, attempt - 1);
    console.log(`    rate-limited, backoff ${waitMs}ms (attempt ${attempt}/4)`);
    await new Promise((r) => setTimeout(r, waitMs));
  }
  throw new Error(`TTS: ${lastErr}`);
}

async function uploadWav(localPath: string, wav: Buffer): Promise<string> {
  const { error } = await sb.storage.from("audio").upload(localPath, wav, {
    contentType: "audio/wav",
    upsert: true,
  });
  if (error) throw new Error(`audio upload ${localPath}: ${error.message}`);
  const { data } = sb.storage.from("audio").getPublicUrl(localPath);
  if (!data?.publicUrl) throw new Error(`no public URL for ${localPath}`);
  return data.publicUrl;
}

async function loadTargets(): Promise<Q[]> {
  if (FINDING_TYPE) {
    // Targets: questions_db rows that have an OPEN audit finding of
    // this type AND whose audio_url is actually null in the DB. The
    // join filters out stale findings automatically.
    const { data: findings, error: fErr } = await sb
      .from("content_audit_findings")
      .select("target_id")
      .eq("status", "open")
      .eq("severity", "fail")
      .eq("finding_type", FINDING_TYPE)
      .eq("target_kind", "question");
    if (fErr) throw fErr;
    const ids = Array.from(new Set((findings ?? []).map((f: any) => f.target_id)));
    if (ids.length === 0) return [];

    let query = sb
      .from("questions_db")
      .select("id, standard_id, grade, prompt, choices, hint, audio_url, hint_audio_url")
      .in("id", ids)
      .is("audio_url", null);
    if (GRADE) query = query.eq("grade", GRADE);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Q[];
  }

  let query = sb
    .from("questions_db")
    .select("id, standard_id, grade, prompt, choices, hint, audio_url, hint_audio_url")
    .is("audio_url", null);
  if (GRADE) query = query.eq("grade", GRADE);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Q[];
}

async function main() {
  console.log(
    `qc-fill-question-audio-db · grade=${GRADE ?? "any"} finding=${
      FINDING_TYPE ?? "any"
    } limit=${LIMIT ?? "all"} dry=${DRY}`,
  );

  const targets = await loadTargets();
  console.log(`  ${targets.length} targets`);
  if (targets.length === 0) return;

  let done = 0;
  const failures: string[] = [];

  for (const q of targets) {
    if (LIMIT && done >= LIMIT) break;
    const folder = GRADE_FOLDER[q.grade] ?? GRADE_FOLDER.K;
    const mainPath = `${folder}/${q.standard_id}/${q.id}.wav`;
    const hintPath = `${folder}/${q.standard_id}/${q.id}-hint.wav`;
    const mainText = buildExpectedTts(q);
    const hintText = (q.hint ?? "").trim();

    console.log(`\n[${done + 1}/${targets.length}] ${q.grade} ${q.standard_id} ${q.id.slice(0, 8)}…`);
    console.log(`  main: ${mainPath} (${mainText.length} chars)`);
    if (!SKIP_HINT && hintText) {
      console.log(`  hint: ${hintPath} (${hintText.length} chars)`);
    }

    if (DRY) {
      done++;
      continue;
    }

    try {
      // Main audio
      const mainWav = await genAudio(mainText);
      const mainUrl = await uploadWav(mainPath, mainWav);

      // Hint audio (only if hint text exists + not skipped)
      let hintUrl: string | null = q.hint_audio_url ?? null;
      if (!SKIP_HINT && hintText && !hintUrl) {
        const hintWav = await genAudio(hintText);
        hintUrl = await uploadWav(hintPath, hintWav);
      }

      // Persist URLs
      const patch: { audio_url: string; hint_audio_url?: string } = {
        audio_url: mainUrl,
      };
      if (hintUrl) patch.hint_audio_url = hintUrl;
      const { error: upErr } = await sb
        .from("questions_db")
        .update(patch)
        .eq("id", q.id);
      if (upErr) throw new Error(`db update: ${upErr.message}`);

      console.log(`  ✓ written`);
      done++;
      // Inter-request throttle. Vertex TTS preview model is ~10 RPM
      // and we generate up to 2 clips per question (main + hint), so
      // ~7s/clip keeps us safely below the cap.
      await new Promise((r) => setTimeout(r, 7000));
    } catch (e: any) {
      console.error(`  ✗ ${e?.message ?? e}`);
      failures.push(`${q.id} :: ${e?.message ?? e}`);
    }
  }

  console.log(`\nDone. generated=${done} failed=${failures.length}`);
  if (failures.length) {
    console.log("Failures:");
    failures.forEach((f) => console.log(`  - ${f}`));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
