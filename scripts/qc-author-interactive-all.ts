/**
 * Author the interactive "Your Turn" fork across the catalog. For each
 * lesson the author CHOOSES the kind (tap vs match) from its skill +
 * content, writes the question/choices-or-pairs/hint + the 3 coaching
 * scripts, and the fork is inserted between the tip and the practice MCQs.
 *
 *   npx tsx scripts/qc-author-interactive-all.ts --grade=4th --dry-run
 *   npx tsx scripts/qc-author-interactive-all.ts --grade=4th --apply
 *   npx tsx scripts/qc-author-interactive-all.ts --apply            # whole catalog
 *   npx tsx scripts/qc-author-interactive-all.ts --limit=8 --dry-run # quick sample
 *
 * Idempotent: skips canon lessons (hand-authored forks) and any lesson
 * that already has an interactive slide (use --force to re-author).
 * Audio is NOT generated here — run qc-gen-interactive-audio.ts after,
 * then gate with qc-judge-interactive.ts.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { authorInteractiveFork, skillTypeForStandard } from "../lib/qc/interactive-author";
import { isCanonLesson } from "../lib/qc/lesson-canon";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const FORCE = args.includes("--force");
const GRADE = args.find((a) => a.startsWith("--grade="))?.split("=")[1] ?? null;
const STD = args.find((a) => a.startsWith("--standard="))?.split("=")[1] ?? null;
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);
const CONC = 4;

function lessonContent(l: any): string {
  const out: string[] = [];
  for (const s of l.slides ?? []) {
    if (!["intro", "teach", "example"].includes(s.type)) continue;
    out.push(`[${s.type}] ${s.heading ?? ""}`);
    for (const st of s.steps ?? []) {
      if (st.ttsScript) out.push(`  ${st.ttsScript}`);
      const parts = (st.displayParts ?? []).map((p: any) => p.text).join(" / ");
      if (parts) out.push(`  (screen: ${parts})`);
      else if (st.displayText) out.push(`  (screen: ${st.displayText})`);
    }
  }
  return out.join("\n");
}

function buildSlide(std: string, payload: any) {
  const base = `audio/lessons/${std}`;
  const it: any = {
    kind: payload.kind,
    prompt: payload.prompt,
    hint: payload.hint,
    correctAudio: `${base}/interactive-correct.mp3`,
    wrongAudio: `${base}/interactive-wrong.mp3`,
    correctScript: payload.correctScript,
    wrongScript: payload.wrongScript,
  };
  if (payload.kind === "tap") { it.choices = payload.choices; it.correct = payload.correct; }
  else { it.leftItems = payload.leftItems; it.rightItems = payload.rightItems; it.correctPairs = payload.correctPairs; }
  return {
    type: "interactive",
    slide: 0,
    heading: payload.heading,
    imageFile: "",
    imagePrompt: "",
    steps: [{ sub: "a", audioFile: `${base}/interactive-q.mp3`, ttsScript: payload.questionScript }],
    interactive: it,
  };
}

function insertFork(l: any, slide: any) {
  const slides = l.slides;
  let at: number | null = null;
  for (let i = 0; i < slides.length; i++) if (slides[i].type === "tip") at = i + 1;
  if (at === null) for (let i = 0; i < slides.length; i++) if (["practice-intro", "mcq"].includes(slides[i].type)) { at = i; break; }
  if (at === null) at = slides.length;
  slides.splice(at, 0, slide);
  slides.forEach((s: any, i: number) => (s.slide = i + 1));
}

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  let pool = lessons.filter((l) => l.standardId && !isCanonLesson(l.standardId));
  if (GRADE) pool = pool.filter((l) => (l.grade ?? "").toLowerCase().includes(GRADE.toLowerCase()));
  if (STD) pool = pool.filter((l) => l.standardId === STD);
  if (!FORCE) pool = pool.filter((l) => !(l.slides ?? []).some((s: any) => s.type === "interactive"));
  if (LIMIT) pool = pool.slice(0, LIMIT);

  console.log(`\n${APPLY ? "APPLY" : "DRY-RUN"} · authoring forks for ${pool.length} lessons (conc ${CONC})\n`);

  const kinds: Record<string, number> = { tap: 0, match: 0 };
  const fails: { std: string; error: string }[] = [];
  const samples: any[] = [];
  let idx = 0, done = 0;

  async function worker() {
    while (idx < pool.length) {
      const l = pool[idx++];
      try {
        const res = await authorInteractiveFork({
          standardId: l.standardId,
          lessonTitle: l.title ?? l.standardId,
          grade: l.grade ?? "",
          skillType: skillTypeForStandard(l.standardId),
          lessonContent: lessonContent(l),
        });
        if (!res.ok) { fails.push({ std: l.standardId, error: res.error }); }
        else {
          kinds[res.payload.kind] = (kinds[res.payload.kind] ?? 0) + 1;
          if (FORCE) l.slides = (l.slides ?? []).filter((s: any) => s.type !== "interactive");
          insertFork(l, buildSlide(l.standardId, res.payload));
          samples.push({ std: l.standardId, ...res.payload });
        }
      } catch (e: any) { fails.push({ std: l.standardId, error: String(e?.message ?? e) }); }
      done++;
      if (done % 10 === 0) console.error(`  …${done}/${pool.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()));

  await fs.writeFile(path.resolve(process.cwd(), "scripts/interactive-authored-preview.json"), JSON.stringify(samples, null, 2));
  console.log(`\n── kind chosen ──  tap: ${kinds.tap}   match: ${kinds.match}`);
  console.log(`authored ${kinds.tap + kinds.match}/${pool.length}  ·  ${fails.length} failed authoring`);
  console.log(`(full payloads → scripts/interactive-authored-preview.json)\n`);
  for (const s of samples.slice(0, 12)) {
    const detail = s.kind === "tap"
      ? `Q: "${s.prompt}"  [${(s.choices ?? []).join(" · ")}]  ✓${s.correct}`
      : `"${s.prompt}"  {${(s.leftItems ?? []).map((l: string, i: number) => `${l}→${s.rightItems?.[i]}`).join(", ")}}`;
    console.log(`  ${s.std} [${s.kind}] ${detail}`);
  }
  if (fails.length) { console.log(`\n── authoring failures ──`); for (const f of fails.slice(0, 20)) console.log(`  ${f.std}: ${f.error}`); }

  if (APPLY) { await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2)); console.log(`\n✓ wrote sample-lessons.json (run qc-gen-interactive-audio.ts, then qc-judge-interactive.ts)`); }
  else console.log(`\n(dry-run — nothing written. add --apply to insert.)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
