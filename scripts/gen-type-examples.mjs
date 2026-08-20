/**
 * One-off: generate the story-type thumbnails for the Story Studio type
 * picker. One cohesive bright-cartoon tile per type. Writes to
 * public/images/story-types/{key}.png.
 *
 *   node scripts/gen-type-examples.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^['"]|['"]$/g, "");
if (!KEY) throw new Error("GEMINI_API_KEY not found in .env.local");

const MODEL = "gemini-3-pro-image";
const STYLE =
  "A vibrant, flat 2D cartoon illustration in a modern kids' picture-book style, bold clean outlines, bright saturated colors, centered subject, simple background.";

const TYPES = {
  animals: "a happy group of friendly animals - a fox, a rabbit, and a little bear together",
  space: "a cute rocket ship zooming past colorful planets and stars",
  magic: "a magic wizard hat and a glowing wand with sparkles",
  funny: "a silly goofy character laughing, playful and fun",
  mystery: "a magnifying glass over footprints, a friendly kid-detective mystery",
  superhero: "a cute kid superhero flying with a bright cape",
  ocean: "a cheerful underwater scene with a smiling whale and colorful fish",
  dinosaurs: "a friendly cute green dinosaur in a leafy jungle",
};

const outDir = resolve(process.cwd(), "public/images/story-types");
mkdirSync(outDir, { recursive: true });

for (const [key, subject] of Object.entries(TYPES)) {
  const prompt = `${STYLE} ${subject}. Single square image, one scene, no text or words or letters, no watermarks.`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data || p.inline_data?.data);
  const b64 = img?.inlineData?.data ?? img?.inline_data?.data;
  if (!b64) {
    console.log(`  ✗ ${key}: no image (${JSON.stringify(json).slice(0, 200)})`);
    continue;
  }
  writeFileSync(resolve(outDir, `${key}.png`), Buffer.from(b64, "base64"));
  console.log(`  ✓ ${key}`);
}
console.log("done");
