/**
 * Mirror the V2 lesson assets to Supabase Storage so production can serve them.
 *
 * public/audio and public/images/lessons-v2 are gitignored: the factory writes
 * them locally, and nothing put them online. This uploads
 *   public/audio/{lessons-v2,quizzes-v2,warmups-v2}/**  →  bucket audio/<same path>   (mp3 as-is)
 *   public/images/lessons-v2/**.png                     →  bucket images/lessons-v2/<path>.webp
 * and next.config.ts redirects the app-relative paths to the bucket in
 * production, so lesson definitions and runners never change.
 *
 *   npx tsx scripts/v2-assets-upload.ts                       # everything, skip unchanged
 *   npx tsx scripts/v2-assets-upload.ts --only=images         # lessons | quizzes | warmups | images
 *   npx tsx scripts/v2-assets-upload.ts --check               # HEAD a sample of public URLs, no upload
 *   npx tsx scripts/v2-assets-upload.ts --dry                 # list what would upload
 *   --state=<file>  where the per-file sha1 ledger lives (default .v2-assets-upload.json, gitignored by name)
 *   --concurrency=N (default 6)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import sharp from "sharp";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const arg = (k: string) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? "").split("=")[1] || undefined;
const ONLY = arg("only");
const CHECK = process.argv.includes("--check");
const DRY = process.argv.includes("--dry");
const STATE = arg("state") ?? ".v2-assets-upload.json";
const CONCURRENCY = Number(arg("concurrency") ?? 6);

type Job = { local: string; bucket: "audio" | "images"; key: string; kind: "mp3" | "webp" };
type Ledger = Record<string, string>; // "<bucket>/<key>" -> sha1 of the LOCAL source

const SETS: Array<{ name: string; dir: string; bucket: "audio" | "images"; ext: string; kind: Job["kind"] }> = [
  { name: "lessons", dir: "public/audio/lessons-v2", bucket: "audio", ext: ".mp3", kind: "mp3" },
  { name: "quizzes", dir: "public/audio/quizzes-v2", bucket: "audio", ext: ".mp3", kind: "mp3" },
  { name: "warmups", dir: "public/audio/warmups-v2", bucket: "audio", ext: ".mp3", kind: "mp3" },
  { name: "images", dir: "public/images/lessons-v2", bucket: "images", ext: ".png", kind: "webp" },
];

async function walk(dir: string, ext: string): Promise<string[]> {
  const out: string[] = [];
  let entries: import("node:fs").Dirent[] = [];
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p, ext)));
    else if (e.isFile() && e.name.toLowerCase().endsWith(ext)) out.push(p);
  }
  return out;
}

async function sha1(file: string): Promise<string> {
  return createHash("sha1").update(await fs.readFile(file)).digest("hex");
}

async function body(job: Job): Promise<{ buf: Buffer; type: string }> {
  const raw = await fs.readFile(job.local);
  if (job.kind === "mp3") return { buf: raw, type: "audio/mpeg" };
  // Imagen PNGs are ~1-1.5 MB each; webp at this quality is a fraction of that with no visible loss at lesson size.
  const buf = await sharp(raw).resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  return { buf, type: "image/webp" };
}

async function put(job: Job, attempt = 1): Promise<boolean> {
  const { buf, type } = await body(job);
  const res = await fetch(`${URL_}/storage/v1/object/${job.bucket}/${job.key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": type, "x-upsert": "true", "cache-control": "public, max-age=31536000, immutable" },
    body: new Uint8Array(buf),
  }).catch((e: Error) => ({ ok: false, status: 0, text: async () => e.message }));
  if (res.ok) return true;
  const txt = (await res.text()).slice(0, 140);
  if (attempt < 4 && (res.status === 0 || res.status === 429 || res.status >= 500)) {
    await new Promise((r) => setTimeout(r, 1500 * attempt));
    return put(job, attempt + 1);
  }
  console.log(`  FAIL ${job.bucket}/${job.key}: ${res.status} ${txt}`);
  return false;
}

async function head(job: Job): Promise<boolean> {
  const r = await fetch(`${URL_}/storage/v1/object/public/${job.bucket}/${job.key}`, { method: "HEAD" }).catch(() => null);
  return !!r && r.ok;
}

async function main() {
  let ledger: Ledger = {};
  try { ledger = JSON.parse(await fs.readFile(STATE, "utf-8")) as Ledger; } catch { /* first run */ }

  const jobs: Job[] = [];
  for (const s of SETS) {
    if (ONLY && s.name !== ONLY) continue;
    const files = await walk(s.dir, s.ext);
    for (const f of files) {
      const rel = path.relative("public", f).split(path.sep).join("/"); // audio/lessons-v2/x/y.mp3 | images/lessons-v2/x/y.png
      const key = rel.replace(/^(audio|images)\//, "").replace(/\.png$/i, ".webp");
      jobs.push({ local: f, bucket: s.bucket, key, kind: s.kind });
    }
    console.log(`${s.name}: ${files.length} files`);
  }

  if (CHECK) {
    const sample = jobs.filter((_, i) => i % Math.max(1, Math.floor(jobs.length / 40)) === 0).slice(0, 40);
    let live = 0;
    for (const j of sample) if (await head(j)) live++; else console.log(`  missing: ${j.bucket}/${j.key}`);
    console.log(`check: ${live}/${sample.length} sampled URLs live`);
    return;
  }

  // Skip files whose local bytes are unchanged since the last successful upload.
  const pending: Array<Job & { hash: string }> = [];
  for (const j of jobs) {
    const h = await sha1(j.local);
    if (ledger[`${j.bucket}/${j.key}`] === h) continue;
    pending.push({ ...j, hash: h });
  }
  console.log(`${pending.length} to upload (${jobs.length - pending.length} unchanged)`);
  if (DRY) { for (const j of pending.slice(0, 20)) console.log(`  ${j.bucket}/${j.key}`); return; }

  let done = 0, ok = 0, failed = 0;
  const started = Date.now();
  let cursor = 0;
  const save = async () => fs.writeFile(STATE, JSON.stringify(ledger, null, 0));
  const worker = async () => {
    while (cursor < pending.length) {
      const j = pending[cursor++];
      const good = await put(j);
      done++;
      if (good) { ok++; ledger[`${j.bucket}/${j.key}`] = j.hash; } else failed++;
      if (done % 100 === 0) {
        await save();
        const rate = done / ((Date.now() - started) / 1000);
        console.log(`  ${done}/${pending.length} (${ok} ok, ${failed} failed) ~${Math.round((pending.length - done) / Math.max(rate, 0.01))}s left`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await save();
  console.log(`uploaded ${ok}/${pending.length}, ${failed} failed, ${Math.round((Date.now() - started) / 1000)}s`);
  if (failed) process.exitCode = 2;
}

main().catch((e) => { console.error(e); process.exit(1); });
