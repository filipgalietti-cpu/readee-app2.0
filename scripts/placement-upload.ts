/**
 * Upload the verified placement clips to Supabase Storage (bucket "audio",
 * folder "placement/"), the same public bucket the question and phoneme audio
 * live in. public/audio/ is gitignored, so this is how the clips reach
 * production; the runner resolves them with getAudioUrl("placement", id).
 *
 *   npx tsx scripts/placement-upload.ts          # upload verified clips (upsert)
 *   npx tsx scripts/placement-upload.ts --check  # HEAD every clip's public URL, no upload
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const BUCKET = "audio";
const FOLDER = "placement";
const DIR = path.resolve(process.cwd(), "public/audio/placement");
const MANIFEST = path.resolve(process.cwd(), "app/data/placement-bank/audio-manifest.json");
const CHECK = process.argv.includes("--check");

type Manifest = { generatedAt: string; voice: string; clips: Record<string, { url: string; script: string; verified: boolean; transcript: string; attempts: number; bucketUrl?: string }> };

async function upload(id: string): Promise<boolean> {
  const body = await fs.readFile(path.join(DIR, `${id}.mp3`));
  const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${FOLDER}/${id}.mp3`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "audio/mpeg", "x-upsert": "true", "cache-control": "public, max-age=31536000" },
    body,
  });
  if (!res.ok) console.log(`  ${id}: ${res.status} ${(await res.text()).slice(0, 120)}`);
  return res.ok;
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf-8")) as Manifest;
  const ids = Object.entries(manifest.clips).filter(([, c]) => c.verified).map(([id]) => id);
  const skipped = Object.keys(manifest.clips).length - ids.length;
  console.log(`${ids.length} verified clips${skipped ? `, ${skipped} unverified skipped` : ""}`);
  let ok = 0;
  if (!CHECK) {
    for (const id of ids) if (await upload(id)) ok++;
    console.log(`uploaded ${ok}/${ids.length}`);
  }
  // Verify every public URL answers 200 with audio.
  let live = 0;
  const bad: string[] = [];
  for (const id of ids) {
    const u = `${URL_}/storage/v1/object/public/${BUCKET}/${FOLDER}/${id}.mp3`;
    const r = await fetch(u, { method: "HEAD" });
    if (r.ok && (r.headers.get("content-type") ?? "").startsWith("audio")) {
      live++;
      manifest.clips[id].bucketUrl = u;
    } else bad.push(`${id} (${r.status})`);
  }
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`live in bucket: ${live}/${ids.length}${bad.length ? `; missing: ${bad.join(", ")}` : ""}`);
  process.exit(bad.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
