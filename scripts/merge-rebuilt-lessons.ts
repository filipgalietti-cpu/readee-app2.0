/**
 * Merge the 18 rebuilt weak lessons (from the rebuild workflow) into the
 * catalog. Reads scripts/rebuilt-lessons.json — array of {std, slides:[...]}.
 * Replaces each lesson's NON-mcq (teaching) slides with the rebuilt set,
 * keeps the MCQs, reuses the old images by slide-type, assigns fresh audio
 * paths, and marks teaching slides `_new` so gen-new-slide-audio.ts only
 * synthesizes these. Forks get their audio from qc-gen-interactive-audio.ts.
 *
 *   npx tsx scripts/merge-rebuilt-lessons.ts --dry
 *   npx tsx scripts/merge-rebuilt-lessons.ts
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const REBUILT = path.resolve(process.cwd(), "scripts/rebuilt-lessons.json");
const DRY = process.argv.includes("--dry");

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  const rebuilt: any[] = JSON.parse(await fs.readFile(REBUILT, "utf-8"));
  const byStd = new Map(lessons.map((l) => [l.standardId, l]));
  let merged = 0;
  const skipped: string[] = [];

  for (const rb of rebuilt) {
    const l = byStd.get(rb.std);
    if (!l || !Array.isArray(rb.slides) || !rb.slides.length) { skipped.push(rb.std); continue; }
    const base = `audio/lessons/${rb.std}`;
    // old images by slide type (reuse on-brand art for the matching type)
    const oldImg: Record<string, string[]> = {};
    for (const s of l.slides ?? []) if (s.imageFile) (oldImg[s.type] ??= []).push(s.imageFile);
    const imgIdx: Record<string, number> = {};
    const mcqs = (l.slides ?? []).filter((s: any) => s.type === "mcq");

    const newSlides = rb.slides.map((s: any, i: number) => {
      const reuse = (oldImg[s.type] ?? [])[imgIdx[s.type] ?? 0];
      imgIdx[s.type] = (imgIdx[s.type] ?? 0) + 1;
      if (s.type === "interactive") {
        const it = s.interactive ?? {};
        const payload: any = { kind: it.kind, prompt: it.prompt, hint: it.hint, correctAudio: `${base}/interactive-correct.mp3`, wrongAudio: `${base}/interactive-wrong.mp3`, correctScript: it.correctScript, wrongScript: it.wrongScript };
        if (it.kind === "tap") { payload.choices = it.choices; payload.correct = it.correct; }
        else { payload.leftItems = (it.pairs ?? []).map((p: any) => p.left); payload.rightItems = (it.pairs ?? []).map((p: any) => p.right); payload.correctPairs = Object.fromEntries((it.pairs ?? []).map((p: any) => [p.left, p.right])); }
        return { type: "interactive", slide: 0, heading: s.heading, imageFile: "", imagePrompt: "", steps: [{ sub: "a", audioFile: `${base}/interactive-q.mp3`, ttsScript: s.steps?.[0]?.ttsScript ?? "" }], interactive: payload };
      }
      const steps = (s.steps ?? []).map((st: any) => {
        const out: any = { sub: st.sub, audioFile: `${base}/rb-${i}${st.sub}.mp3`, ttsScript: st.ttsScript };
        const hasParts = Array.isArray(st.displayParts) && st.displayParts.length > 0;
        if (st.displayText && !hasParts) out.displayText = st.displayText;
        if (hasParts) out.displayParts = st.displayParts.map((p: any, k: number) => ({ text: p.text, delay: k === 0 ? 0 : 2000 }));
        if (st.highlightWord) out.highlightWord = { word: st.highlightWord, delay: 2000 };
        return out;
      });
      return { type: s.type, slide: 0, heading: s.heading, imageFile: reuse ?? "", imagePrompt: "", steps, _new: true };
    });

    l.slides = [...newSlides, ...mcqs];
    l.slides.forEach((s: any, i: number) => (s.slide = i + 1));
    merged++;
    if (DRY) console.log(`  ${rb.std}: ${newSlides.length} rebuilt slides + ${mcqs.length} mcqs (${newSlides.filter((s:any)=>s.imageFile).length} reuse img)`);
  }

  if (skipped.length) console.log(`\n  skipped: ${skipped.join(", ")}`);
  if (DRY) { console.log(`\n(dry — ${merged} would merge)`); return; }
  await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2));
  console.log(`✓ merged ${merged} rebuilt lessons. Run: gen-new-slide-audio.ts --apply, then qc-gen-interactive-audio for each std, then derive+align timing, then re-review.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
