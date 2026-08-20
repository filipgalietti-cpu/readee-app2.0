/**
 * One-off: generate the 4 style example thumbnails for the Story Studio
 * image-style picker (cartoon / realistic / watercolor / comic) — same
 * friendly subject rendered in each style so kids see what they'll get.
 * Writes to public/images/story-styles/{style}.png.
 *
 *   node scripts/gen-style-examples.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^['"]|['"]$/g, "");
if (!KEY) throw new Error("GEMINI_API_KEY not found in .env.local");

const MODEL = "gemini-3-pro-image";
const SUBJECT = "a friendly red fox sitting in a sunny forest clearing";
const STYLES = {
  cartoon:
    "A vibrant, flat 2D cartoon illustration in a modern kids' picture-book style, with bold clean outlines and bright saturated colors.",
  realistic:
    "A photorealistic, richly detailed image with natural lighting, lifelike textures, and true-to-life proportions - like professional wildlife photography. Not a cartoon, not an illustration.",
  watercolor:
    "A traditional watercolor storybook painting with soft color washes, visible paper texture, and gentle pastel tones.",
  comic:
    "Bold comic-book and graphic-novel art with heavy ink outlines, dynamic shading, and halftone dot texture.",
};

const outDir = resolve(process.cwd(), "public/images/story-styles");
mkdirSync(outDir, { recursive: true });

for (const [style, words] of Object.entries(STYLES)) {
  const prompt = `${words} ${SUBJECT}. The fox has correct, natural anatomy: exactly one tail, one head, two ears, and four legs - no duplicated, extra, or merged body parts. Single square image, one scene, no text or watermarks.`;
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
    console.log(`  ✗ ${style}: no image (${JSON.stringify(json).slice(0, 200)})`);
    continue;
  }
  const path = resolve(outDir, `${style}.png`);
  writeFileSync(path, Buffer.from(b64, "base64"));
  console.log(`  ✓ ${style} -> ${path}`);
}
console.log("done");
