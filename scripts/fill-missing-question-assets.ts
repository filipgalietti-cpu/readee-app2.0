/**
 * Fill missing-audio and missing-image gaps for practice questions.
 *
 * Reads each grade JSON, detects questions missing `audio_url`,
 * `hint_audio_url`, or `image_url`, generates the asset via the same
 * pipeline the QC bot uses (Vertex TTS Autonoe + calm reading-teacher
 * style for audio; Gemini 2.5 Flash Image for images), uploads to the
 * canonical Supabase Storage path, and writes the URL back to the
 * JSON. Saves after every successful generation so a mid-run crash
 * doesn't lose work.
 *
 * Why a brand-new script and not the existing qc-bot-regen-audio /
 * generate-audio.js: the QC bot regenerator targets *existing* assets
 * that the AI judge flagged as bad — it parses an existing URL to find
 * the bucket path. The premium-revamp generate-audio.js writes to
 * local disk + needs a separate upload step. Neither handles "no URL
 * yet, build the canonical path from scratch."
 *
 * Conventions matched from original generation:
 *   - K + G1 TTS reads passage + prompt + ALL choices aloud (emerging
 *     readers can't decode the options yet).
 *   - G2-G4 TTS reads passage + prompt only — kids read the choices
 *     themselves.
 *   - Voice: Autonoe. Style: calm warm reading-teacher tone.
 *   - Storage paths: audio/<folder>/<stdId>/<qId>.wav and
 *     audio/<folder>/<stdId>/<qId>-hint.wav (renderer is content-type
 *     aware, .wav plays fine). Images: images/<folder>/<stdId>/<qId>.png
 *   - Image brief: existing IMAGE_STYLE_PREFIX from readee-ai handles
 *     the "bright 2D cartoon, bold clean outlines" style — we just
 *     pass the prompt-derived scene.
 *
 * Usage:
 *   npx tsx scripts/fill-missing-question-assets.ts --grade=1st --type=audio --limit=2
 *   npx tsx scripts/fill-missing-question-assets.ts --type=audio        (all grades)
 *   npx tsx scripts/fill-missing-question-assets.ts                     (full run)
 *
 * Flags:
 *   --grade=1st|2nd|3rd|4th|K   limit to one grade
 *   --type=audio|image          limit to one asset kind (default: both)
 *   --limit=N                   stop after N successful generations
 *   --skip-hint                 don't fill hint_audio_url (audio main only)
 *   --dry-run                   print what would happen, no API calls
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { generateSpeechVertex } from "@/lib/ai/vertex-tts";
import { generateImage } from "@/lib/ai/readee-ai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TEACHER_ID = process.env.QC_BOT_TEACHER_ID!;
if (!SUPABASE_URL || !SERVICE_KEY || !TEACHER_ID) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / QC_BOT_TEACHER_ID");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const args = process.argv.slice(2);
const GRADE_FILTER = args.find((a) => a.startsWith("--grade="))?.split("=")[1] ?? null;
const TYPE_FILTER = args.find((a) => a.startsWith("--type="))?.split("=")[1] ?? null;
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "0") || null;
const SKIP_HINT = args.includes("--skip-hint");
const DRY = args.includes("--dry-run");
// Re-record the OLD question audio too (the readee-content/*.wav batch made
// with the obnoxious voice), not just missing ones — regenerates to the
// canonical path on Autonoe + rewrites the URL.
const REREC_OLD = args.includes("--rerecord-old");
const isOldAudio = (url?: string) => !!url && /readee-content/.test(url);

type Question = {
  id: string;
  type: string;
  prompt: string;
  choices?: string[];
  correct?: string;
  hint?: string;
  audio_url?: string;
  hint_audio_url?: string;
  image_url?: string;
};

type Standard = {
  standard_id: string;
  domain: string;
  questions: Question[];
};

type GradeFile = {
  key: "K" | "1st" | "2nd" | "3rd" | "4th";
  folder: "kindergarten" | "1st-grade" | "2nd-grade" | "3rd-grade" | "4th-grade";
  filename: string;
};

const GRADES: GradeFile[] = [
  { key: "K", folder: "kindergarten", filename: "kindergarten-standards-questions.json" },
  { key: "1st", folder: "1st-grade", filename: "1st-grade-standards-questions.json" },
  { key: "2nd", folder: "2nd-grade", filename: "2nd-grade-standards-questions.json" },
  { key: "3rd", folder: "3rd-grade", filename: "3rd-grade-standards-questions.json" },
  { key: "4th", folder: "4th-grade", filename: "4th-grade-standards-questions.json" },
];

const DATA_DIR = path.join(process.cwd(), "app", "data");

const TTS_SAMPLE_RATE = 24000;

/**
 * Same pcmToWav as readee-ai.ts inlined here to keep the script
 * runtime self-contained. WAV header for 16-bit mono PCM at the
 * given sample rate.
 */
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

function buildExpectedTts(q: Question, gradeKey: GradeFile["key"]): string {
  const parts = String(q.prompt ?? "").split("\n\n");
  const passage = parts.length > 1 ? parts.slice(0, -1).join("\n\n") : "";
  const promptOnly = parts.length > 1 ? parts[parts.length - 1] : q.prompt;
  const choices = Array.isArray(q.choices) ? q.choices : [];
  const isKor1 = gradeKey === "K" || gradeKey === "1st";
  const passageSpoken = passage ? passage + "\n\n" : "";
  if (isKor1 && choices.length > 0) {
    return `${passageSpoken}${promptOnly}\n\n${choices.join("... ")}`;
  }
  return `${passageSpoken}${promptOnly}`;
}

function buildImageBrief(q: Question, standardId: string): string {
  const parts = String(q.prompt ?? "").split("\n\n");
  const stem = parts.length > 1 ? parts[0] : q.prompt;
  return `Scene for a K-4 reading practice question about standard ${standardId}: ${stem
    .slice(0, 220)
    .replace(/\n/g, " ")}. One central, clearly-identifiable focal element. Kid-safe, no text in the image.`;
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

async function uploadPng(localPath: string, png: Buffer): Promise<string> {
  const { error } = await sb.storage.from("images").upload(localPath, png, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error(`image upload ${localPath}: ${error.message}`);
  const { data } = sb.storage.from("images").getPublicUrl(localPath);
  if (!data?.publicUrl) throw new Error(`no public URL for ${localPath}`);
  return data.publicUrl;
}

async function genAudio(text: string): Promise<Buffer> {
  for (let attempt = 0; ; attempt++) {
    const res = await generateSpeechVertex({
      text,
      voice: "Autonoe",
      style:
        "in a calm, warm reading-teacher voice. Conversational and unhurried. Don't sound excited or perky — sound like a kind adult who reads with kids every day",
    });
    if (res.ok) return pcmToWav(Buffer.from(res.pcmBase64, "base64"), TTS_SAMPLE_RATE);
    // Vertex TTS per-minute quota → back off and retry.
    if (/429|RESOURCE_EXHAUSTED|Quota/i.test(res.error || "") && attempt < 8) {
      await new Promise((r) => setTimeout(r, 15000 + attempt * 8000));
      continue;
    }
    throw new Error(`TTS: ${res.error}`);
  }
}

async function genImage(brief: string): Promise<Buffer> {
  const res = await generateImage({ teacherId: TEACHER_ID, prompt: brief });
  if (!res.ok) throw new Error(`Imagen: ${res.error}`);
  return Buffer.from(res.imageBase64, "base64");
}

// ─── Pipeline ──────────────────────────────────────────────────────

let totalGenerated = 0;
const failures: string[] = [];

async function run() {
  const doAudio = !TYPE_FILTER || TYPE_FILTER === "audio";
  const doImage = !TYPE_FILTER || TYPE_FILTER === "image";

  for (const g of GRADES) {
    if (GRADE_FILTER && g.key !== GRADE_FILTER) continue;

    const jsonPath = path.join(DATA_DIR, g.filename);
    const raw = fs.readFileSync(jsonPath, "utf8");
    const data = JSON.parse(raw) as { standards: Standard[]; [k: string]: any };

    let touched = 0;
    console.log(`\n▶ ${g.key} (${g.folder})`);

    for (const s of data.standards) {
      for (const q of s.questions ?? []) {
        if (LIMIT && totalGenerated >= LIMIT) break;

        // ── Audio ──
        if (
          doAudio &&
          (!q.audio_url || !q.audio_url.startsWith("http") || (REREC_OLD && isOldAudio(q.audio_url)))
        ) {
          const text = buildExpectedTts(q, g.key);
          const audioPath = `${g.folder}/${s.standard_id}/${q.id}.wav`;
          try {
            if (DRY) {
              console.log(`  ⤿ [dry] audio: ${audioPath}  (${text.length} chars)`);
            } else {
              const wav = await genAudio(text);
              q.audio_url = await uploadWav(audioPath, wav);
              touched++;
              totalGenerated++;
              console.log(
                `  ✓ audio ${q.id.padEnd(16)} (${text.length} chars, ${(wav.length / 1024).toFixed(0)}KB)`,
              );
            }
          } catch (e: any) {
            const msg = `audio ${q.id}: ${e.message ?? e}`;
            failures.push(msg);
            console.log(`  ✗ ${msg}`);
          }
        }

        // ── Hint audio ──
        if (
          doAudio &&
          !SKIP_HINT &&
          q.hint &&
          (!q.hint_audio_url || !q.hint_audio_url.startsWith("http"))
        ) {
          const hintText = String(q.hint).trim();
          const hintPath = `${g.folder}/${s.standard_id}/${q.id}-hint.wav`;
          try {
            if (DRY) {
              console.log(`  ⤿ [dry] hint:  ${hintPath}  (${hintText.length} chars)`);
            } else if (hintText) {
              const wav = await genAudio(hintText);
              q.hint_audio_url = await uploadWav(hintPath, wav);
              touched++;
              totalGenerated++;
              console.log(`  ✓ hint  ${q.id.padEnd(16)} (${hintText.length} chars)`);
            }
          } catch (e: any) {
            const msg = `hint ${q.id}: ${e.message ?? e}`;
            failures.push(msg);
            console.log(`  ✗ ${msg}`);
          }
        }

        // ── Image ──
        if (
          doImage &&
          (!q.image_url || !q.image_url.startsWith("http"))
        ) {
          const brief = buildImageBrief(q, s.standard_id);
          const imagePath = `${g.folder}/${s.standard_id}/${q.id}.png`;
          try {
            if (DRY) {
              console.log(`  ⤿ [dry] image: ${imagePath}`);
            } else {
              const png = await genImage(brief);
              q.image_url = await uploadPng(imagePath, png);
              touched++;
              totalGenerated++;
              console.log(`  ✓ image ${q.id.padEnd(16)} (${(png.length / 1024).toFixed(0)}KB)`);
            }
          } catch (e: any) {
            const msg = `image ${q.id}: ${e.message ?? e}`;
            failures.push(msg);
            console.log(`  ✗ ${msg}`);
          }
        }
      }
      if (LIMIT && totalGenerated >= LIMIT) break;
    }

    // Save the grade JSON whether we touched it or not (no-op if not).
    if (touched > 0 && !DRY) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n");
      console.log(`  💾 saved ${g.filename} (${touched} assets added)`);
    }
    if (LIMIT && totalGenerated >= LIMIT) break;
  }

  console.log(`\n── done. generated ${totalGenerated} assets. failures: ${failures.length}`);
  if (failures.length) console.log(failures.map((f) => `  - ${f}`).join("\n"));
}

run().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
