/**
 * Batch avatar generator (batch 2). Mirrors the original avatar-prompts.csv
 * style EXACTLY ("Character portrait of {subject}. Bright 2D cartoon
 * illustration, bold clean outlines, vibrant saturated colors, solid {bg}
 * background, centered bust portrait, kid-friendly, no text") but generates via
 * the Gemini image API instead of Vertex Imagen (no gcloud ADC needed).
 *
 *   node scripts/gen-avatars-v2.mjs                       # all, sequential
 *   node scripts/gen-avatars-v2.mjs --only=avatar_panda,avatar_axolotl
 *   node scripts/gen-avatars-v2.mjs --skip-existing
 *   MODEL=gemini-3.1-flash-image node scripts/gen-avatars-v2.mjs
 *
 * Reads scripts/avatars-batch-2.json; writes public/images/avatars/{id}.png
 * (1024x1024, matching the existing avatars).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const env = readFileSync(resolve(ROOT, ".env.local"), "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^['"]|['"]$/g, "");
if (!KEY) throw new Error("GEMINI_API_KEY not found in .env.local");

const MODEL = process.env.MODEL || "gemini-3-pro-image";
const OUT = resolve(ROOT, "public/images/avatars");
mkdirSync(OUT, { recursive: true });

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",").map((s) => s.trim()) : null;
const skipExisting = process.argv.includes("--skip-existing");

const defs = JSON.parse(readFileSync(resolve(ROOT, "scripts/avatars-batch-2.json"), "utf8"));
const rows = defs.filter((d) => !only || only.includes(d.id));

const style = (bg) =>
  `Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, solid ${bg} background, single character centered in the frame, symmetrical head-and-shoulders bust portrait, fully visible with generous even margins on all sides, not cropped or zoomed in, kid-friendly, no text`;

async function gen(subject, bg) {
  const prompt = `Character portrait of ${subject}. ${style(bg)}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json).slice(0, 220)}`);
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  const b64 =
    parts.find((p) => p.inlineData?.data)?.inlineData?.data ??
    parts.find((p) => p.inline_data?.data)?.inline_data?.data;
  if (!b64) throw new Error(`no image: ${JSON.stringify(json).slice(0, 220)}`);
  return Buffer.from(b64, "base64");
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ok = 0, skip = 0, fail = 0;
const failed = [];
for (let i = 0; i < rows.length; i++) {
  const d = rows[i];
  const outPath = resolve(OUT, `${d.id}.png`);
  if (skipExisting && existsSync(outPath)) {
    console.log(`[${i + 1}/${rows.length}] skip ${d.id}`);
    skip++;
    continue;
  }
  let tries = 3;
  while (tries > 0) {
    try {
      const buf = await gen(d.subject, d.bg);
      await sharp(buf).resize(1024, 1024, { fit: "cover" }).png().toFile(outPath);
      console.log(`[${i + 1}/${rows.length}] OK ${d.id}`);
      ok++;
      break;
    } catch (e) {
      tries--;
      const msg = String(e?.message ?? e);
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        console.log(`  rate limited, waiting 20s...`);
        await sleep(20000);
      } else {
        console.log(`  x ${d.id}: ${msg}`);
        if (tries > 0) await sleep(2000);
        else { fail++; failed.push(d.id); }
      }
    }
  }
  await sleep(1200);
}
if (failed.length) writeFileSync(resolve(ROOT, "scripts/avatars-batch-2-failed.json"), JSON.stringify(failed, null, 2));
console.log(`\ndone ok=${ok} skip=${skip} fail=${fail}${failed.length ? " -> " + failed.join(",") : ""}`);
