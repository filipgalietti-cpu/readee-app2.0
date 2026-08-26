/**
 * Lesson image pipeline — house-style cartoon art for ANY lesson.
 * Reads the lesson's image manifest (word → subject) from app/data/lessons-v2
 * and writes public/images/lessons-v2/<id>/<word>.png.
 * Engine: GoogleGenAI `gemini-2.5-flash-image` (the working path — raw Vertex
 * Imagen REST 404s in this project).
 *
 *   npx tsx scripts/lesson-images.ts --lesson=silent-e            # all
 *   npx tsx scripts/lesson-images.ts --lesson=silent-e cap cape   # subset
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { LESSONS } from "../app/data/lessons-v2";

const MODEL = "gemini-2.5-flash-image";
const STYLE =
  "Bright 2D cartoon illustration for a children's reading app, bold clean outlines, vibrant saturated colors, simple flat pale background, one single centered object, no text or letters. Subject: ";

const id = (process.argv.find((a) => a.startsWith("--lesson=")) ?? "").split("=")[1];
if (!id || !LESSONS[id]) {
  console.error(`Usage: npx tsx scripts/lesson-images.ts --lesson=<id>  (known: ${Object.keys(LESSONS).join(", ")})`);
  process.exit(1);
}
const { images } = LESSONS[id];
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const OUT = path.resolve(process.cwd(), `public/images/lessons-v2/${id}`);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function gen(word: string, subject: string, refWord?: string): Promise<boolean> {
  let contents: unknown = STYLE + subject;
  if (refWord) {
    // Character consistency: condition on the already-generated reference image
    // (same pattern as lib/ai generateImage's referenceImage / build-book).
    const refPath = path.join(OUT, `${refWord}.png`);
    const refB64 = (await fs.readFile(refPath)).toString("base64");
    contents = [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/png", data: refB64 } },
          { text: `${STYLE}${subject}. Use the EXACT same character design as in the reference image — same face, colors, outfit, proportions.` },
        ],
      },
    ];
  }
  const res = await ai.models.generateContent({ model: MODEL, contents: contents as never });
  const parts = res.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    const data = (p as { inlineData?: { data?: string } }).inlineData?.data;
    if (data) {
      await fs.writeFile(path.join(OUT, `${word}.png`), Buffer.from(data, "base64"));
      return true;
    }
  }
  console.log("no image in response");
  return false;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  // plain entries first (references must exist before dependents)
  const all = Object.entries(images).filter(([w]) => only.length === 0 || only.includes(w));
  const entries = [...all].sort(([, a], [, b]) => (typeof a === "string" ? 0 : 1) - (typeof b === "string" ? 0 : 1));
  console.log(`\n${id} · ${entries.length} images → public/images/lessons-v2/${id}/\n`);
  let ok = 0;
  for (const [w, spec] of entries) {
    const subject = typeof spec === "string" ? spec : spec.subject;
    const refWord = typeof spec === "string" ? undefined : spec.ref;
    process.stdout.write(`  ${w.padEnd(8)}${refWord ? ` (ref:${refWord})` : ""} `);
    try {
      if (await gen(w, subject, refWord)) {
        const st = await fs.stat(path.join(OUT, `${w}.png`));
        console.log(`ok ${(st.size / 1024).toFixed(0)}kb`); // size printed = proof the file downloaded
        ok++;
      }
    } catch (e) {
      console.log("ERR", String((e as Error)?.message ?? e).slice(0, 100));
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  console.log(`\nDone: ${ok}/${entries.length}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
