/**
 * Merge Claude-authored examples + teach beats (Pass 3) into the catalog.
 * Reads scripts/content-additions.json — array of:
 *   { std, need:"example"|"teach", heading, steps:[{sub, ttsScript,
 *     displayText?, displayParts?:[{text}], highlightWord?}] }
 * Inserts each new slide after the lesson's last teach slide (examples go
 * teach -> EXAMPLE -> tip), assigns canonical audio paths, marks the slide
 * `_new:true` so gen-new-slide-audio.ts only synthesizes the additions.
 *
 *   npx tsx scripts/merge-content-add.ts --dry
 *   npx tsx scripts/merge-content-add.ts
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const ADDS = path.resolve(process.cwd(), "scripts/content-additions.json");
const DRY = process.argv.includes("--dry");

function buildSlide(std: string, item: any) {
  const base = `audio/lessons/${std}`;
  const tag = item.need === "example" ? "example" : "addteach";
  const steps = (item.steps ?? []).map((st: any) => {
    const out: any = { sub: st.sub, audioFile: `${base}/${tag}-${st.sub}.mp3`, ttsScript: st.ttsScript };
    const hasParts = Array.isArray(st.displayParts) && st.displayParts.length > 0;
    // A Q->A step uses displayParts; ignore any redundant displayText the
    // author also set on the same step (would double-render).
    if (st.displayText && !hasParts) out.displayText = st.displayText;
    if (hasParts) {
      // simple stagger — answer reveals ~2.2s after the question; the
      // Whisper align pass can tighten this later.
      out.displayParts = st.displayParts.map((p: any, i: number) => ({ text: p.text, delay: i === 0 ? 0 : 2200 }));
    }
    if (st.highlightWord) out.highlightWord = { word: st.highlightWord, delay: 2200 };
    return out;
  });
  return { type: item.need === "example" ? "example" : "teach", slide: 0, heading: item.heading, imageFile: "", imagePrompt: "", steps, _new: true };
}

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  const adds: any[] = JSON.parse(await fs.readFile(ADDS, "utf-8"));
  const byStd = new Map(lessons.map((l) => [l.standardId, l]));
  let merged = 0;
  const skipped: string[] = [];

  for (const item of adds) {
    const l = byStd.get(item.std);
    if (!l) { skipped.push(item.std); continue; }
    // already has a real example? skip example adds (idempotent safety)
    if (item.need === "example" && l.slides.some((s: any) => s.type === "example" && (s.steps ?? []).some((st: any) => Array.isArray(st.displayParts) && st.displayParts.length === 2 && String(st.displayParts[0]?.text ?? "").trim().endsWith("?")))) {
      skipped.push(`${item.std}(has-ex)`); continue;
    }
    const slide = buildSlide(item.std, item);
    const slides = l.slides;
    let at = null as number | null;
    for (let i = 0; i < slides.length; i++) if (slides[i].type === "teach") at = i + 1;
    if (at === null) for (let i = 0; i < slides.length; i++) if (["tip", "interactive", "practice-intro", "mcq"].includes(slides[i].type)) { at = i; break; }
    if (at === null) at = slides.length;
    slides.splice(at, 0, slide);
    slides.forEach((s: any, i: number) => (s.slide = i + 1));
    merged++;
    if (DRY) console.log(`  ${item.std} [${item.need}] "${item.heading}" — ${slide.steps.length} steps @ pos ${at}`);
  }

  if (skipped.length) console.log(`\n  skipped: ${skipped.join(", ")}`);
  if (DRY) { console.log(`\n(dry — ${merged} would merge)`); return; }
  await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2));
  console.log(`✓ merged ${merged} new slides (marked _new) → run gen-new-slide-audio.ts`);
}

main().catch((e) => { console.error(e); process.exit(1); });
