/**
 * Merge rebuilt forks (from the fork-fix workflow) back into the catalog.
 * Reads scripts/fork-fixes.json — an array of:
 *   { std, kind, prompt, hint, choices?, correct?, pairs?,
 *     questionScript, correctScript, wrongScript }
 * Replaces each lesson's interactive payload + question audio script in
 * place (audio paths preserved). Run qc-gen-interactive-audio.ts after to
 * regenerate the 3 clips per changed lesson, then qc-judge-interactive.ts.
 *
 *   npx tsx scripts/merge-fork-fixes.ts          # apply
 *   npx tsx scripts/merge-fork-fixes.ts --dry    # preview
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const FIXES = path.resolve(process.cwd(), "scripts/fork-fixes.json");
const DRY = process.argv.includes("--dry");

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  const fixes: any[] = JSON.parse(await fs.readFile(FIXES, "utf-8"));
  const byStd = new Map(lessons.map((l) => [l.standardId, l]));

  let merged = 0;
  const skipped: string[] = [];
  for (const f of fixes) {
    const l = byStd.get(f.std);
    const slide = l?.slides?.find((s: any) => s.type === "interactive");
    if (!slide) { skipped.push(f.std); continue; }
    const base = `audio/lessons/${f.std}`;
    const it: any = {
      kind: f.kind,
      prompt: f.prompt,
      hint: f.hint,
      correctAudio: `${base}/interactive-correct.mp3`,
      wrongAudio: `${base}/interactive-wrong.mp3`,
      correctScript: f.correctScript,
      wrongScript: f.wrongScript,
    };
    if (f.kind === "tap") {
      it.choices = f.choices;
      it.correct = f.correct;
    } else {
      it.leftItems = (f.pairs ?? []).map((p: any) => p.left);
      it.rightItems = (f.pairs ?? []).map((p: any) => p.right);
      it.correctPairs = Object.fromEntries((f.pairs ?? []).map((p: any) => [p.left, p.right]));
    }
    slide.interactive = it;
    slide.steps = [{ sub: "a", audioFile: `${base}/interactive-q.mp3`, ttsScript: f.questionScript }];
    merged++;
    if (DRY) {
      const d = f.kind === "tap" ? `[${(f.choices ?? []).join(" · ")}] ✓${f.correct}` : `{${(f.pairs ?? []).map((p: any) => `${p.left}→${p.right}`).join(", ")}}`;
      console.log(`  ${f.std} [${f.kind}] "${f.prompt}" ${d}`);
    }
  }
  if (skipped.length) console.log(`\n  ⚠ no interactive slide for: ${skipped.join(", ")}`);
  if (DRY) { console.log(`\n(dry — ${merged} would merge)`); return; }
  await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2));
  console.log(`✓ merged ${merged} rebuilt forks → sample-lessons.json (now regen audio for those ${merged} lessons)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
