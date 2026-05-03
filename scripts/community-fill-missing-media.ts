/**
 * Scan community_passages for approved rows with null image_url or
 * null audio_url and rebuild the missing media. Safe to re-run —
 * only touches rows where the media is missing.
 *
 *   npx tsx scripts/community-fill-missing-media.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import {
  generateImage,
  generateImageBrief,
  generateSpeech,
} from "@/lib/ai/readee-ai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SYSTEM_TEACHER_ID = process.env.QC_BOT_TEACHER_ID;
if (!SUPABASE_URL || !SERVICE_KEY || !SYSTEM_TEACHER_ID) {
  console.error("Need URL + SERVICE_KEY + QC_BOT_TEACHER_ID");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function fillImage(row: any): Promise<string | null> {
  try {
    const briefRes = await generateImageBrief({
      teacherId: SYSTEM_TEACHER_ID!,
      passageTitle: row.title,
      passageBody: row.passage_text,
    });
    if (!briefRes.ok) {
      console.log(`    ! brief failed: ${briefRes.error}`);
      return null;
    }
    const imgRes = await generateImage({
      teacherId: SYSTEM_TEACHER_ID!,
      prompt: briefRes.brief,
    });
    if (!imgRes.ok) {
      console.log(`    ! image failed: ${imgRes.error}`);
      return null;
    }
    return imgRes.imageUrl;
  } catch (e: any) {
    console.log(`    ! image threw: ${e?.message ?? "unknown"}`);
    return null;
  }
}

async function fillAudio(row: any): Promise<string | null> {
  try {
    const ttsRes = await generateSpeech({
      teacherId: SYSTEM_TEACHER_ID!,
      text: row.passage_text,
    });
    if (!ttsRes.ok) {
      console.log(`    ! audio failed: ${ttsRes.error}`);
      return null;
    }
    return ttsRes.audioUrl;
  } catch (e: any) {
    console.log(`    ! audio threw: ${e?.message ?? "unknown"}`);
    return null;
  }
}

async function main() {
  const { data, error } = await sb
    .from("community_passages")
    .select("id, slug, title, passage_text, image_url, audio_url, status")
    .eq("status", "approved")
    .or("image_url.is.null,audio_url.is.null");
  if (error) {
    console.error("query failed:", error.message);
    process.exit(1);
  }
  const rows = data ?? [];
  console.log(`Found ${rows.length} community rows with missing media.`);

  for (const r of rows as any[]) {
    console.log(`  [${r.slug}] image=${!!r.image_url} audio=${!!r.audio_url}`);
    const updates: { image_url?: string; audio_url?: string } = {};
    if (!r.image_url) {
      const u = await fillImage(r);
      if (u) updates.image_url = u;
    }
    if (!r.audio_url) {
      const u = await fillAudio(r);
      if (u) updates.audio_url = u;
    }
    if (Object.keys(updates).length === 0) {
      console.log(`    skip — nothing rebuilt`);
      continue;
    }
    const { error: updErr } = await sb
      .from("community_passages")
      .update(updates)
      .eq("id", r.id);
    if (updErr) {
      console.log(`    ! update failed: ${updErr.message}`);
    } else {
      console.log(`    ✓ updated`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
