/**
 * Watercolor background generator. Mirrors gen-avatars-v2.mjs but produces
 * full-scene 16:9 dashboard backgrounds in the app's signature soft-watercolor
 * look, via the Gemini image API (no gcloud ADC — the Vertex Imagen path is
 * dead: imagen-4.0-generate-001 now 404s in the project).
 *
 *   node scripts/gen-backgrounds-v2.mjs                       # all, sequential
 *   node scripts/gen-backgrounds-v2.mjs --only=bg_misty_forest,bg_moonlit_lake
 *   node scripts/gen-backgrounds-v2.mjs --skip-existing
 *   MODEL=gemini-3.1-flash-image node scripts/gen-backgrounds-v2.mjs
 *
 * Reads scripts/backgrounds-watercolor.json ({id, prompt}); writes
 * public/images/backgrounds/{id}.png (1536x864, 16:9).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const env = readFileSync(resolve(ROOT, ".env.local"), "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^['"]|['"]$/g, "");
if (!KEY) throw new Error("GEMINI_API_KEY not found in .env.local");

const MODEL = process.env.MODEL || "gemini-3-pro-image";
const OUT = resolve(ROOT, "public/images/backgrounds");
mkdirSync(OUT, { recursive: true });

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",").map((s) => s.trim()) : null;
const skipExisting = process.argv.includes("--skip-existing");

const defs = JSON.parse(readFileSync(resolve(ROOT, "scripts/backgrounds-watercolor.json"), "utf8"));
const rows = defs.filter((d) => !only || only.includes(d.id));

const STYLE =
  "Soft digital watercolor children's book illustration, gentle hand-drawn charcoal outlines, dreamy pastel wash, calming and cozy, full-bleed wide landscape scene, no characters, no text, no words, no letters.";

async function gen(scene) {
  const prompt = `${scene} ${STYLE}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { imageConfig: { aspectRatio: "16:9" } },
      }),
    },
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
      const buf = await gen(d.prompt);
      await sharp(buf).resize(1536, 864, { fit: "cover" }).png().toFile(outPath);
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
if (failed.length) writeFileSync(resolve(ROOT, "scripts/backgrounds-watercolor-failed.json"), JSON.stringify(failed, null, 2));
console.log(`\ndone ok=${ok} skip=${skip} fail=${fail}${failed.length ? " -> " + failed.join(",") : ""}`);
