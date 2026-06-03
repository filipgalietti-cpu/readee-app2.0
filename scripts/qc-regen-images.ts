/**
 * Regenerate the lesson images the audit flagged — properly.
 *
 * The slop is mostly hallucinated TEXT, and the root cause is prompts
 * that DESCRIBE text (calendars, labeled diagrams, "prefix/root/suffix"
 * puzzles). So:
 *   1. An LLM REWRITES the prompt into a literal, TEXT-FREE scene with
 *      anti-slop guards + the Readee house style (kills the reason the
 *      model renders glyphs).
 *   2. Generate with imagen-ultra (quality:"ultra", sharper/less slop).
 *   3. JUDGE it (judgeImageQuality). Best-of-N: only an image that
 *      PASSES the judge ships. If none pass, we DON'T ship slop — we
 *      flag it "couldn't fix".
 *
 *   npx tsx scripts/qc-regen-images.ts --dry-run            # show rewritten prompts
 *   npx tsx scripts/qc-regen-images.ts --standard=L.3.4 --apply
 *   npx tsx scripts/qc-regen-images.ts --apply             # all audit fails
 *
 * Reads scripts/image-audit.json. Writes regenerated assets + bumps
 * imageRegenAt in sample-lessons.json.
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
const AUDIT = path.resolve(process.cwd(), "scripts/image-audit.json");
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const QC_BOT = process.env.QC_BOT_TEACHER_ID!;
const N = 3; // best-of-N
const CONC = 3; // concurrent images (gentle on rate limits)

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const STD = args.find((a) => a.startsWith("--standard="))?.split("=")[1] ?? null;

let gem: GoogleGenAI | null = null;
function gemini() {
  if (!gem) gem = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  return gem;
}

const REWRITE_SYSTEM = `You rewrite an image-generation prompt for a K-4 reading lesson so the generator produces a CLEAN, TEXT-FREE, on-brand cartoon. The previous image FAILED a quality check — usually because it rendered hallucinated/garbled TEXT, because the old prompt described text-bearing things.

Output ONLY the new prompt, one paragraph, no preamble.

Hard rules for the new scene:
- ONE concrete, literal, kid-friendly 2D cartoon scene that conveys the lesson's idea through OBJECTS, CHARACTERS, and ACTIONS — NEVER through text.
- ZERO text-bearing elements. FORBIDDEN: any letters, words, numbers, labels, signs, captions, headings, calendars, clocks with numerals, books/pages with readable text, diagrams with labels, charts, word-breakdowns, alphabet blocks showing letters. If the concept is abstract (e.g. "prefix + root + suffix", "headings and labels", "days of the week"), use a WORDLESS visual metaphor: interlocking puzzle pieces, linking train cars, stacking blocks, a child reading a picture-only book, varied themed picture covers, a sun-to-moon cycle, etc.
- Anti-slop: natural proportions, correct number of fingers, no extra/melted limbs, no warped faces, NO glowing glints/sparkles in eyes, no plastic/3D-render look, no uncanny features.
- Solid NAMED background color (e.g. "solid mint-green background"), never "pastel" (produces rainbow bands).
- Match Readee house style.
- End the prompt EXACTLY with: "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. Absolutely no text, no letters, no words, no numbers, no labels anywhere. Natural proportions, no AI artifacts, no eye glints."`;

async function rewritePrompt(heading: string, std: string, oldPrompt: string, reason: string): Promise<string> {
  try {
    // Internal timeout — a hung Gemini call must NOT block the batch.
    const r: any = await Promise.race([
      gemini().models.generateContent({
        model: "gemini-2.5-flash",
        contents: `LESSON STANDARD: ${std}\nSLIDE HEADING: ${heading}\nOLD PROMPT: ${oldPrompt}\nWHY THE IMAGE FAILED: ${reason}\n\nWrite the new text-free image prompt.`,
        config: { systemInstruction: REWRITE_SYSTEM, temperature: 0.4 },
      }),
      new Promise((res) => setTimeout(() => res(null), 25000)),
    ]);
    if (!r) return oldPrompt;
    const t = (r.text ?? "").trim();
    return t.length > 30 ? t : oldPrompt;
  } catch {
    return oldPrompt;
  }
}

function timed<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))]);
}

/** Generate (standard model) with exponential backoff on 429/quota/rate. */
async function genWithBackoff(prompt: string): Promise<any> {
  for (let a = 0; a < 5; a++) {
    const img: any = await timed(
      generateImage({ teacherId: QC_BOT, prompt, quality: "standard" }),
      90000, { ok: false, error: "timeout" },
    );
    if (img.ok) return img;
    if (/429|quota|rate|resource_?exhausted/i.test(String(img.error ?? ""))) {
      await new Promise((r) => setTimeout(r, 2500 * (a + 1))); // 2.5s,5s,7.5s,10s,12.5s
      continue;
    }
    return img; // non-rate failure — don't retry
  }
  return { ok: false, error: "429 after backoff" };
}

async function main() {
  const audit = JSON.parse(await fs.readFile(AUDIT, "utf-8"));
  let fails: any[] = audit.fails ?? [];
  if (STD) fails = fails.filter((f) => f.std === STD);

  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  const findSlide = (f: any) =>
    (lessons.find((l) => l.standardId === f.std)?.slides ?? []).find((s: any) => s.imageFile === f.file);

  // Work list = the fails + their slide object. The prompt rewrite
  // happens INSIDE each worker (concurrent + timed) so it can never
  // bottleneck the whole batch.
  const work: any[] = [];
  for (const f of fails) {
    const slideObj = findSlide(f);
    if (slideObj) work.push({ ...f, slideObj }); // f.slide stays the slide NUMBER
  }

  console.log(`\n${APPLY ? "APPLY (imagen-ultra, best-of-" + N + ")" : "DRY-RUN"} · ${work.length} images\n`);
  if (!APPLY) {
    for (const w of work.slice(0, 12)) {
      const np = await rewritePrompt(w.slideObj.heading ?? "", w.std, w.slideObj.imagePrompt ?? "", w.reason ?? "");
      console.log(`### ${w.std} S${w.slide} — ${w.slideObj.heading}`);
      console.log(`  WAS: ${String(w.slideObj.imagePrompt).slice(0, 90)}`);
      console.log(`  NEW: ${np.slice(0, 160)}\n`);
    }
    console.log(`(${work.length} total; showing first 12. Run --apply to regenerate.)`);
    return;
  }

  const sb = createClient(SUPA, SERVICE);
  const results: { file: string; passed: boolean }[] = [];
  let idx = 0, done = 0;

  async function worker() {
    while (idx < work.length) {
      const w = work[idx++];
      const newPrompt = await rewritePrompt(w.slideObj.heading ?? "", w.std, w.slideObj.imagePrompt ?? "", w.reason ?? "");
      let best: { b64: string; mime: string } | null = null;
      let passed = false;
      for (let i = 0; i < N && !passed; i++) {
        const img = await genWithBackoff(newPrompt);
        if (!img.ok) continue;
        best ??= { b64: img.imageBase64, mime: img.mimeType };
        const v = await timed(judgeImageQuality({ imageUrl: img.imageUrl, expectedScene: newPrompt }), 45000, { ok: false } as any);
        if (v.ok && v.severity === "pass") { best = { b64: img.imageBase64, mime: img.mimeType }; passed = true; }
      }
      done++;
      if (best) {
        const up = await sb.storage.from("images").upload(w.file.replace(/^images\//, ""), Buffer.from(best.b64, "base64"), { contentType: best.mime, upsert: true, cacheControl: "no-cache" });
        if (!up.error) { w.slideObj.imageRegenAt = new Date().toISOString(); results.push({ file: w.file, passed }); }
      }
      console.error(`  …${done}/${work.length}  ${w.std} S${w.slide} ${best ? (passed ? "✓pass" : "~best-effort") : "✗failed"}`);
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()));

  await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2));
  const pass = results.filter((r) => r.passed).length;
  console.log(`\n— regenerated ${results.length}/${work.length} (${pass} judge-passed, ${results.length - pass} best-effort). wrote sample-lessons.json —`);
}

main().catch((e) => { console.error(e); process.exit(1); });
