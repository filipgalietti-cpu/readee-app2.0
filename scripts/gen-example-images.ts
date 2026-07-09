/**
 * Generate images for the imageless worked-example slides (Pass 3's 69
 * examples were authored imageless; canon examples have an illustration,
 * so they look sparse — esp. on mobile). For each example: derive a scene
 * from its focal content, author a TEXT-FREE anti-slop prompt (same system
 * as qc-regen-images), best-of-3 with Gemini 2.5 Flash Image, judge, upload
 * to images/lessons/<std>/example.png, and stamp imageFile + imagePrompt.
 *
 *   npx tsx scripts/gen-example-images.ts --dry-run
 *   npx tsx scripts/gen-example-images.ts --apply
 *   npx tsx scripts/gen-example-images.ts --standard=RL.K.3 --apply
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { generateImage } from "../lib/ai/readee-ai";
import { judgeImageQuality } from "../lib/ai/qc-media";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const QC_BOT = process.env.QC_BOT_TEACHER_ID!;
const N = 3, CONC = 3;
const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const STD = args.find((a) => a.startsWith("--standard="))?.split("=")[1] ?? null;

let gem: GoogleGenAI | null = null;
const gemini = () => (gem ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! }));

const PROMPT_SYSTEM = `You write an image-generation prompt for a K-4 reading lesson's "Let's Try One" worked-example slide. The image is the friendly illustration the kid sees while a worked problem is modeled. Depict the example's SCENE as ONE clean, literal, kid-friendly 2D cartoon — convey it through OBJECTS, CHARACTERS, ACTIONS, never through text.

Output ONLY the prompt, one paragraph, no preamble.

Hard rules:
- ZERO text-bearing elements. FORBIDDEN: any letters, words, numbers, labels, signs, captions, alphabet blocks, books/pages with readable text, charts, word-breakdowns. If the lesson concept is abstract (a sound, a prefix, a vowel team), depict the WORD'S SUBJECT instead (e.g. word "fish" -> a happy cartoon fish; word "pig" -> a cute pig; "reread" -> a child happily reading a picture book again) — never the letters.
- Anti-slop: natural proportions, correct number of fingers, no extra/melted limbs, no warped faces, NO glowing glints/sparkles in eyes, no plastic/3D look.
- Solid NAMED background color (e.g. "solid sky-blue background"), never "pastel".
- End the prompt EXACTLY with: "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. Absolutely no text, no letters, no words, no numbers, no labels anywhere. Natural proportions, no AI artifacts, no eye glints."`;

function sceneBasis(slide: any): string {
  // focal displayText (passage / word) + any Q->A answer words for context
  const focal = (slide.steps ?? []).map((st: any) => st.displayText).filter(Boolean).join(" ");
  const answers = (slide.steps ?? []).flatMap((st: any) => Array.isArray(st.displayParts) ? st.displayParts.map((p: any) => p.text) : []).join(" ");
  const audio = (slide.steps ?? []).map((st: any) => st.ttsScript).filter(Boolean).join(" ").slice(0, 240);
  return [focal, answers, audio].filter(Boolean).join(" · ").slice(0, 400);
}

async function authorPrompt(std: string, heading: string, scene: string): Promise<string> {
  try {
    const r: any = await Promise.race([
      gemini().models.generateContent({
        model: "gemini-2.5-flash",
        contents: `LESSON: ${std} — ${heading}\nTHE EXAMPLE SHOWS: ${scene}\n\nWrite the text-free image prompt depicting this example's scene.`,
        config: { systemInstruction: PROMPT_SYSTEM, temperature: 0.4 },
      }),
      new Promise((res) => setTimeout(() => res(null), 25000)),
    ]);
    const t = (r?.text ?? "").trim();
    return t.length > 30 ? t : "";
  } catch { return ""; }
}

function timed<T>(p: Promise<T>, ms: number, fb: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fb), ms))]);
}
async function genWithBackoff(prompt: string): Promise<any> {
  for (let a = 0; a < 5; a++) {
    const img: any = await timed(generateImage({ teacherId: QC_BOT, prompt, quality: "standard" }), 90000, { ok: false, error: "timeout" });
    if (img.ok) return img;
    if (/429|quota|rate|resource_?exhausted/i.test(String(img.error ?? ""))) { await new Promise((r) => setTimeout(r, 2500 * (a + 1))); continue; }
    return img;
  }
  return { ok: false, error: "429 after backoff" };
}

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  const work: { std: string; slide: any; file: string }[] = [];
  for (const l of lessons) {
    if (STD && l.standardId !== STD) continue;
    for (const s of l.slides ?? []) {
      if (s.type === "example" && !s.imageFile) work.push({ std: l.standardId, slide: s, file: `images/lessons/${l.standardId}/example.png` });
    }
  }
  console.log(`\n${APPLY ? "APPLY (best-of-" + N + ", Gemini Flash Image)" : "DRY-RUN"} · ${work.length} example images\n`);
  if (!APPLY) {
    for (const w of work.slice(0, 8)) {
      const p = await authorPrompt(w.std, w.slide.heading ?? "", sceneBasis(w.slide));
      console.log(`### ${w.std} — ${w.slide.heading}\n  scene: ${sceneBasis(w.slide).slice(0, 80)}\n  PROMPT: ${p.slice(0, 150)}\n`);
    }
    console.log(`(${work.length} total; first 8 shown. --apply to generate.)`);
    return;
  }

  const sb = createClient(SUPA, SERVICE);
  let idx = 0, done = 0; const results: { passed: boolean }[] = [];
  async function worker() {
    while (idx < work.length) {
      const w = work[idx++];
      const prompt = await authorPrompt(w.std, w.slide.heading ?? "", sceneBasis(w.slide));
      let best: { b64: string; mime: string } | null = null, passed = false;
      if (prompt) for (let i = 0; i < N && !passed; i++) {
        const img = await genWithBackoff(prompt);
        if (!img.ok) continue;
        best ??= { b64: img.imageBase64, mime: img.mimeType };
        const v: any = await timed(judgeImageQuality({ imageUrl: img.imageUrl, expectedScene: prompt }), 45000, { ok: false, error: "timeout" });
        if (v.ok && v.severity === "pass") { best = { b64: img.imageBase64, mime: img.mimeType }; passed = true; }
      }
      done++;
      if (best) {
        const up = await sb.storage.from("images").upload(w.file.replace(/^images\//, ""), Buffer.from(best.b64, "base64"), { contentType: best.mime, upsert: true, cacheControl: "no-cache" });
        if (!up.error) { w.slide.imageFile = w.file; w.slide.imagePrompt = prompt; w.slide.imageRegenAt = new Date().toISOString(); results.push({ passed }); }
      }
      console.error(`  …${done}/${work.length}  ${w.std} ${best ? (passed ? "✓pass" : "~best-effort") : "✗failed"}`);
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()));
  await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2));
  const pass = results.filter((r) => r.passed).length;
  console.log(`\n— generated ${results.length}/${work.length} (${pass} judge-passed, ${results.length - pass} best-effort). wrote sample-lessons.json —`);
}

main().catch((e) => { console.error(e); process.exit(1); });
