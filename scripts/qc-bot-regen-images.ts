/**
 * QC bot Phase-2 worker — image regeneration.
 *
 * Consumes open q.image_quality fails from content_audit_findings.
 * For each, builds a regen prompt augmented with constraints
 * extracted from the audit message (e.g. "garbled text" findings get
 * "no visible text, no labels"), runs generateImage, and overwrites
 * the image at the SAME storage path so the URL in the JSON catalog
 * stays valid.
 *
 *   npx tsx scripts/qc-bot-regen-images.ts --dry-run
 *   npx tsx scripts/qc-bot-regen-images.ts --limit=5
 *   npx tsx scripts/qc-bot-regen-images.ts        (full run)
 *
 * Cost: ~$0.04 / regen × ~24 fails = ~$1 to clear the bucket.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";
import { generateImage } from "@/lib/ai/readee-ai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SYSTEM_TEACHER_ID = process.env.QC_BOT_TEACHER_ID;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!SYSTEM_TEACHER_ID) {
  console.error(
    "Need QC_BOT_TEACHER_ID — a profile id Readee owns whose credits + " +
      "rate-limit bucket the regens will book against. Set in .env.local.",
  );
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const DRY = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;

/** Parse the supabase storage path from a public URL.
 *  https://x.supabase.co/storage/v1/object/public/{bucket}/{path...} */
function parseStoragePath(url: string): { bucket: string; path: string } | null {
  const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: m[2] };
}

/** Extract a constraint hint from the audit's failure message. The
 *  judge consistently uses certain phrases for certain failure modes;
 *  we map them to prompt suffixes the regenerator can act on. */
function constraintFromMessage(message: string): string {
  const m = message.toLowerCase();
  const suffixes: string[] = [];
  if (
    /garbled|misspell|broken text|incoherent text|illegible|gibberish/.test(m)
  ) {
    suffixes.push(
      "Do not include any text, words, signage, labels, or letters in the image.",
    );
  }
  if (/wrong subject|doesn't (match|depict)|unrelated|incoherent scene/.test(m)) {
    suffixes.push(
      "The image must clearly depict the subject described in the prompt — no abstract or unrelated scenes.",
    );
  }
  if (/floating|airborne|physically (incoherent|impossible)/.test(m)) {
    suffixes.push(
      "Composition must obey real-world physics. Objects rest on surfaces; no floating elements.",
    );
  }
  if (/anatomy|hand|finger|limb|distorted|mangled|deformed/.test(m)) {
    suffixes.push(
      "Anatomy must be coherent. No distorted hands, fingers, limbs, or facial features.",
    );
  }
  if (suffixes.length === 0) {
    suffixes.push(
      "Composition must be visually coherent and clearly support the prompt.",
    );
  }
  return suffixes.join(" ");
}

async function processFinding(f: any) {
  const targetId = f.target_id as string;
  const message = f.message as string;
  const snapshot = f.target_snapshot ?? {};
  const imageUrl = snapshot.image_url as string | undefined;
  const promptText = (snapshot.prompt ?? "") as string;

  if (!imageUrl || !promptText) {
    console.log(`  [${targetId}] skip — missing image_url or prompt`);
    return false;
  }
  const parsed = parseStoragePath(imageUrl);
  if (!parsed) {
    console.log(`  [${targetId}] skip — couldn't parse storage path`);
    return false;
  }

  const constraint = constraintFromMessage(message);
  // Style + audience preamble matches the catalog standard so
  // regenerated images blend in.
  const newPrompt = [
    "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
    `Scene: ${promptText.split("\n\n")[0].slice(0, 220)}`,
    constraint,
  ].join(" ");

  console.log(`  [${targetId}] regenerating → ${parsed.bucket}/${parsed.path}`);
  if (DRY) {
    console.log(`    DRY prompt: ${newPrompt.slice(0, 140)}…`);
    return true;
  }

  const res = await generateImage({
    teacherId: SYSTEM_TEACHER_ID!,
    prompt: newPrompt,
  });
  if (!res.ok) {
    console.log(`    ! generateImage failed: ${res.error}`);
    return false;
  }
  // Overwrite the existing storage object so the URL in the JSON
  // catalog continues to resolve (cache-bust only happens on the next
  // CDN miss, which is fine for a back-office regen).
  const buffer = Buffer.from(res.imageBase64, "base64");
  const { error: upErr } = await sb.storage
    .from(parsed.bucket)
    .upload(parsed.path, buffer, {
      contentType: res.mimeType,
      upsert: true,
    });
  if (upErr) {
    console.log(`    ! re-upload failed: ${upErr.message}`);
    return false;
  }

  // Mark the finding fixed.
  const { error: updErr } = await sb
    .from("content_audit_findings")
    .update({
      status: "fixed",
      resolved_at: new Date().toISOString(),
      resolver_note: "QC bot Phase-2: image regenerated and re-uploaded.",
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
  console.log(`QC bot — image regen ${DRY ? "(DRY RUN)" : ""}`);

  let q = sb
    .from("content_audit_findings")
    .select("id, target_id, message, target_snapshot, severity")
    .eq("finding_type", "q.image_quality")
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
  console.log(`Found ${rows.length} open image fails to regen.`);

  let ok = 0;
  let skip = 0;
  for (const f of rows) {
    const result = await processFinding(f);
    if (result) ok++;
    else skip++;
    // Rate-limit safety: small breather between regens.
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log(`Done — regenerated ${ok}, skipped ${skip}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
