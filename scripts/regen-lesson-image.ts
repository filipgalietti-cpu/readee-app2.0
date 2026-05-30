/**
 * Single-image regen for a lesson slide. Reads the (already
 * de-slopped) imagePrompt from app/data/sample-lessons.json, calls
 * Vertex Imagen (via lib/ai/readee-ai.generateImage), and uploads the
 * result to the SAME Supabase Storage path so the existing URL in
 * the lesson JSON stays valid (cache-busted by a content hash query
 * string the kid never sees).
 *
 * Usage:
 *   npx tsx scripts/regen-lesson-image.ts --standard=RL.1.1 --slide=4
 *   npx tsx scripts/regen-lesson-image.ts --standard=RL.1.1 --slide=4 --ultra
 *
 * Cost: ~$0.04 standard / ~$0.06 ultra per image.
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY, QC_BOT_TEACHER_ID, plus valid Vertex /
 * Google AI auth.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { generateImage } from "@/lib/ai/readee-ai";

const SAMPLE_LESSONS = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SYSTEM_TEACHER_ID = process.env.QC_BOT_TEACHER_ID;

function arg(name: string): string | null {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : null;
}

async function main() {
  const standardId = arg("standard");
  const slideStr = arg("slide");
  const ultra = process.argv.includes("--ultra");

  if (!standardId || !slideStr) {
    console.error(
      "Usage: tsx scripts/regen-lesson-image.ts --standard=<id> --slide=<n> [--ultra]",
    );
    process.exit(1);
  }
  const slideNum = Number(slideStr);
  if (!SUPABASE_URL || !SERVICE_KEY || !SYSTEM_TEACHER_ID) {
    console.error(
      "Missing env: need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, QC_BOT_TEACHER_ID",
    );
    process.exit(1);
  }

  const lessons = JSON.parse(await fs.readFile(SAMPLE_LESSONS, "utf-8"));
  const lesson = lessons.find((l: any) => l.standardId === standardId);
  if (!lesson) {
    console.error(`Lesson ${standardId} not found`);
    process.exit(1);
  }
  const slide = (lesson.slides ?? []).find((s: any) => s.slide === slideNum);
  if (!slide) {
    console.error(`Slide ${slideNum} not found in ${standardId}`);
    process.exit(1);
  }
  const prompt = slide.imagePrompt as string | undefined;
  const imageFile = slide.imageFile as string | undefined;
  if (!prompt || !imageFile) {
    console.error(`Slide is missing imagePrompt or imageFile`);
    process.exit(1);
  }

  console.log(`\n═══ ${standardId} slide ${slideNum} ═══`);
  console.log(`Target path: ${imageFile}`);
  console.log(`Prompt:\n  ${prompt}`);
  console.log(`\nQuality: ${ultra ? "ultra (~$0.06)" : "standard (~$0.04)"}`);
  console.log(`Generating…`);

  const res = await generateImage({
    teacherId: SYSTEM_TEACHER_ID,
    prompt,
    quality: ultra ? "ultra" : "standard",
  });
  if (!res.ok) {
    console.error(`Generation failed: ${res.error}`);
    process.exit(1);
  }

  // Upload to the lesson image path (overwrite).
  // imageFile is e.g. "images/lessons/RL.1.1/S4.png" — that's the
  // path AFTER "/storage/v1/object/public/{bucket}/", and the bucket
  // is "images". So we strip the leading "images/" before uploading.
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  let bucket = "images";
  let storagePath = imageFile;
  if (storagePath.startsWith("images/")) {
    storagePath = storagePath.slice("images/".length);
  }
  const buf = Buffer.from(res.imageBase64, "base64");
  const up = await sb.storage
    .from(bucket)
    .upload(storagePath, buf, {
      contentType: res.mimeType,
      upsert: true,
      cacheControl: "no-cache",
    });
  if (up.error) {
    console.error(`Upload failed: ${up.error.message}`);
    process.exit(1);
  }

  // Bump slide.imageRegenAt so the renderer can cache-bust the
  // image URL with `?v=<timestamp>`. Without this, the browser
  // happily serves the old PNG from cache even after Supabase has
  // the new one (Supabase URL is identical across regens).
  slide.imageRegenAt = new Date().toISOString();
  await fs.writeFile(SAMPLE_LESSONS, JSON.stringify(lessons, null, 2));

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;
  console.log(`\n✓ Done`);
  console.log(`  Image: ${publicUrl}`);
  console.log(`  imageRegenAt stamped on slide — renderer will cache-bust.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
