/**
 * Upload the V2 lesson assets that Supabase does not already have.
 *
 * ‼️ ADDITIVE ONLY. This script never deletes, moves or overwrites. It lists what
 * is already in the buckets, uploads only the paths that are absent, and leaves
 * everything else — local and remote — exactly as it found it. The local trees
 * under public/audio/lessons-v2 and public/images/lessons-v2 are the ONLY copy
 * of these files anywhere; they are gitignored and in no repo. Read them, never
 * touch them.
 *
 * Conventions it has to match, set by the Sep 5 upload:
 *   audio   public/audio/lessons-v2/<id>/x.mp3  -> bucket "audio",  lessons-v2/<id>/x.mp3   (verbatim)
 *   images  public/images/lessons-v2/<id>/x.png -> bucket "images", lessons-v2/<id>/x.webp  (CONVERTED)
 *
 * The webp conversion is not an optimisation I chose; it is what is already
 * there (bug.png 300 KB local is bug.webp 13.8 KB remote), and mixing formats
 * would leave the render layer unable to guess which extension a lesson has.
 *
 *   npx tsx scripts/v2-assets/upload-missing.ts --dry-run
 *   npx tsx scripts/v2-assets/upload-missing.ts
 *   npx tsx scripts/v2-assets/upload-missing.ts --replace --only=letter-pairs/words/m.mp3
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry-run");
/**
 * ‼️ Additive-only by default, which means a file already in storage is skipped
 * even if the local copy has been FIXED. That is the safe default for a first
 * upload, but it makes repair impossible: regenerate a bad clip, run this, and
 * nothing happens because the bad object still exists under that name.
 *
 * --replace uploads the named paths even when they already exist (upsert), so a
 * corrected asset can actually reach production. Scope it with --only=<substr>
 * so a repair run touches the files you fixed and nothing else.
 */
const REPLACE = process.argv.includes("--replace");
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) ?? "").split("=")[1] ?? "";
const ROOT = process.cwd();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
const admin = createClient(url, key, { auth: { persistSession: false } });

/** WebP quality. 82 lands within a few KB of the existing objects. */
const WEBP_QUALITY = 82;
const CONCURRENCY = 6;

type Job = { bucket: string; remote: string; local: string; convert: boolean };

async function listRemote(bucket: string, prefix: string, out: Set<string>) {
  let offset = 0;
  for (;;) {
    const { data, error } = await admin.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw new Error(`list ${bucket}/${prefix}: ${error.message}`);
    if (!data?.length) break;
    for (const e of data) {
      const p = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.id === null) await listRemote(bucket, p, out);
      else out.add(p);
    }
    if (data.length < 1000) break;
    offset += data.length;
  }
}

function walkLocal(dir: string, out: string[]) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkLocal(p, out);
    else out.push(p);
  }
}

async function main() {
  const plan: Job[] = [];

  for (const [bucket, localRoot, convert] of [
    ["audio", "public/audio/lessons-v2", false],
    ["images", "public/images/lessons-v2", true],
  ] as const) {
    const abs = path.join(ROOT, localRoot);
    if (!fs.existsSync(abs)) throw new Error(`missing local tree: ${localRoot} — refusing to continue`);

    const remote = new Set<string>();
    await listRemote(bucket, "lessons-v2", remote);

    const files: string[] = [];
    walkLocal(abs, files);

    for (const f of files) {
      const rel = path.relative(abs, f).split(path.sep).join("/");
      const remoteName = convert ? `lessons-v2/${rel.replace(/\.png$/i, ".webp")}` : `lessons-v2/${rel}`;
      if (ONLY && !remoteName.includes(ONLY) && !f.includes(ONLY)) continue;
      // Skip what is already there UNLESS we were asked to replace it.
      if (remote.has(remoteName) && !REPLACE) continue;
      plan.push({ bucket, remote: remoteName, local: f, convert });
    }
    console.log(`  ${bucket}: ${files.length} local, ${remote.size} remote, ${plan.filter((j) => j.bucket === bucket).length} to upload`);
  }

  if (!plan.length) {
    console.log("\nNothing to upload — Supabase already has every local asset.");
    return;
  }
  console.log(`\n${plan.length} files to upload${DRY ? " (dry run, nothing sent)" : ""}`);
  if (DRY) {
    for (const j of plan.slice(0, 10)) console.log(`  ${j.bucket}/${j.remote}${j.convert ? "  (png->webp)" : ""}`);
    if (plan.length > 10) console.log(`  … and ${plan.length - 10} more`);
    return;
  }

  let done = 0,
    failed: { job: Job; why: string }[] = [];

  async function run(j: Job) {
    try {
      const body = j.convert
        ? await sharp(j.local).webp({ quality: WEBP_QUALITY }).toBuffer()
        : fs.readFileSync(j.local);
      const { error } = await admin.storage.from(j.bucket).upload(j.remote, body, {
        contentType: j.convert ? "image/webp" : "audio/mpeg",
        // Additive runs must never clobber: a collision means something changed
        // underneath us and is worth failing on. A --replace run is the explicit
        // exception, and is the only way a corrected asset reaches production.
        upsert: REPLACE,
      });
      if (error) throw new Error(error.message);
    } catch (e) {
      failed.push({ job: j, why: e instanceof Error ? e.message : String(e) });
    } finally {
      if (++done % 100 === 0 || done === plan.length) {
        console.log(`  ${done}/${plan.length} (${failed.length} failed)`);
      }
    }
  }

  const queue = [...plan];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (;;) {
        const j = queue.shift();
        if (!j) return;
        await run(j);
      }
    }),
  );

  console.log(`\nuploaded ${plan.length - failed.length}/${plan.length}`);
  if (failed.length) {
    console.log(`\n${failed.length} FAILED:`);
    for (const f of failed.slice(0, 20)) console.log(`  ${f.job.bucket}/${f.job.remote}: ${f.why}`);
    process.exitCode = 1;
  }
  console.log("\nLocal files untouched. Re-run to retry failures; it re-lists and skips what landed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
