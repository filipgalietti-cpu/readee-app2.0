/**
 * Lesson linter — automated QC for engine lessons. Run after authoring or asset
 * generation; humans should only ever see the exception list, not hunt bugs in
 * the player. Checks, per lesson in the manifest:
 *   • every narration mp3 / word clip / image referenced actually exists
 *   • every cue's `at` word RESOLVES against the Whisper timings
 *   • narration scenes have a timings entry (else cues fall back to clip-end)
 *   • interaction data is coherent (transform options contain `add`; choose
 *     correctId exists; sequence order ids ⊆ items; highlight targets appear
 *     in the text; sort item buckets exist)
 *   • auto scenes have narration + at least one fire cue
 *
 *   npx tsx scripts/lesson-lint.ts                 # all lessons
 *   npx tsx scripts/lesson-lint.ts --lesson=<id>
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { LESSONS } from "../app/data/lessons-v2";
import { resolveCueTime } from "../lib/lesson-engine/cues";
import { SUPPORTED_EFFECTS } from "../app/components/lesson-v2/TextFX";

const only = (process.argv.find((a) => a.startsWith("--lesson=")) ?? "").split("=")[1];
const PUB = path.resolve(process.cwd(), "public");

async function exists(rel: string): Promise<boolean> {
  try {
    await fs.access(path.join(PUB, rel));
    return true;
  } catch {
    return false;
  }
}

function norm(w: string) {
  return w.toLowerCase().replace(/[^a-z']/g, "");
}

async function main() {
  let problems = 0;
  for (const [id, entry] of Object.entries(LESSONS)) {
    if (only && id !== only) continue;
    const { lesson } = entry;
    const errs: string[] = [];

    // Scene 0 must be an opener (hook/listen/read-along), never an answerable
    // question: (a) pedagogy — lessons start by teaching, not quizzing; (b) the
    // per-playthrough shuffle salt is only hydration-safe off the first render.
    const first = lesson.scenes[0];
    const ANSWERABLE = new Set(["choose", "transform", "sort", "sequence", "speak", "highlight"]);
    if (first?.interaction && ANSWERABLE.has(first.interaction.type))
      errs.push(`[${first.id}] scene 0 is an answerable "${first.interaction.type}" — lessons must open with a hook/listen/read-along`);

    for (const s of lesson.scenes) {
      const at = (msg: string) => errs.push(`[${s.id}] ${msg}`);

      // NO EM-DASH rule (Filip: "#1 AI slop clue") — kid-facing copy only
      const facing = [s.prompt, s.narration?.script, s.fx?.text].filter(Boolean) as string[];
      const iAny = s.interaction as { coachWrong?: string } | undefined;
      if (iAny?.coachWrong) facing.push(iAny.coachWrong);
      for (const txt of facing) {
        if (txt.includes("—")) at(`em-dash in kid-facing copy: "${txt.slice(0, 60)}…"`);
      }

      // fx effect must exist in the motion library
      if (s.fx && !(SUPPORTED_EFFECTS as readonly string[]).includes(s.fx.effect))
        at(`fx effect "${s.fx.effect}" not in the motion library (TextFX SUPPORTED_EFFECTS)`);

      // narration + timings
      if (s.narration) {
        if (!(await exists(s.narration.audio))) at(`missing narration audio ${s.narration.audio}`);
        if (!lesson.timings?.[s.id]) at(`no Whisper timings entry (cues fall back to clip-end)`);
      }

      // cues resolve
      for (const c of s.cues ?? []) {
        if (!s.narration) at(`cue "${c.at}" but scene has no narration`);
        const t = resolveCueTime(c.at, lesson.timings?.[s.id]?.words);
        if (t == null) at(`cue "${c.at}" does NOT resolve in timings — transform would only fire at clip end`);
      }

      // auto sanity
      if (s.auto) {
        if (!s.narration) at(`auto scene without narration`);
        if (!(s.cues ?? []).some((c) => c.do.effect === "fire")) at(`auto scene without a fire cue`);
      }

      // interaction coherence + assets
      const i = s.interaction;
      if (!i) continue;

      // Interaction items must be SINGLE short words (K can't read sentences on tiles).
      // G1+ kids READ (FACTORY_SOP "Grade 1 production"): decodable phrases and short
      // sentences are legitimate tiles, so higher grades only cap total length.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const labels: string[] = [];
      const ix = i as any;
      if (ix.items) for (const it of ix.items) labels.push(it.label ?? it.word ?? "");
      if (ix.options) for (const o of ix.options) labels.push(o.label ?? "");
      const kTiles = lesson.grade === "Kindergarten";
      for (const lbl of labels) {
        if (kTiles && (/\s/.test(String(lbl).trim()) || String(lbl).length > 12))
          at(`interaction label "${String(lbl).slice(0, 30)}" is not a single short word`);
        if (!kTiles && String(lbl).length > 28)
          at(`interaction label "${String(lbl).slice(0, 30)}" too long for a tile (28-char cap)`);
      }

      // NO-REVEAL rule (Filip, Aug 17): independent CHALLENGE scenes must not
      // name the answer in the prompt or narration — a kid could copy it.
      if (s.purpose === "challenge") {
        const spoken = `${s.prompt} ${s.narration?.script ?? ""}`.toLowerCase();
        const answers: string[] = [];
        if (i.type === "transform") answers.push(i.result.toLowerCase());
        if (i.type === "choose") {
          const c = i.options.find((o) => o.id === i.correctId);
          if (c) answers.push(c.label.toLowerCase());
        }
        for (const a of answers) {
          if (a.length <= 1) continue; // letter-matching tasks must name the letter
          // word-boundary match (substring false-positives on short answers like "s")
          const re = new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
          if (re.test(spoken)) at(`challenge REVEALS the answer "${a}" in prompt/narration (no-reveal rule)`);
        }
      }
      const checkAsset = async (label: string, ref?: string) => {
        if (ref && !(await exists(ref))) at(`missing ${label}: ${ref}`);
      };
      if (i.type === "listen") {
        for (const it of i.items) {
          await checkAsset(`audio for "${it.label}"`, it.audio);
          await checkAsset(`image for "${it.label}"`, it.image);
        }
      }
      if (i.type === "transform") {
        const opts = (i.options ?? [i.add]).map((o) => o.toUpperCase());
        if (!opts.includes(i.add.toUpperCase())) at(`transform options missing the correct piece "${i.add}"`);
        if (i.base.toUpperCase() + i.add.toUpperCase() !== i.result.toUpperCase())
          at(`transform base+add ("${i.base}"+"${i.add}") ≠ result "${i.result}"`);
        if (i.changeIndex < 0 || i.changeIndex >= i.base.length) at(`transform changeIndex out of range`);
        await checkAsset("imageBefore", i.imageBefore);
        await checkAsset("imageAfter", i.imageAfter);
        await checkAsset("successAudio", i.successAudio);
      }
      if (i.type === "sort") {
        for (const it of i.items) {
          if (!i.buckets.includes(it.bucket)) at(`sort item "${it.label}" → unknown bucket "${it.bucket}"`);
          await checkAsset(`audio for "${it.label}"`, it.audio);
        }
      }
      if (i.type === "choose") {
        if (!i.options.some((o) => o.id === i.correctId)) at(`choose correctId "${i.correctId}" not in options`);
        for (const o of i.options) {
          await checkAsset(`audio for "${o.label}"`, o.audio);
          await checkAsset(`image for "${o.label}"`, o.image);
        }
      }
      if (i.type === "sequence") {
        const ids = new Set(i.items.map((it) => it.id));
        for (const oid of i.order) if (!ids.has(oid)) at(`sequence order id "${oid}" not in items`);
        if (i.order.length !== i.items.length) at(`sequence order length ≠ items length`);
        for (const it of i.items) {
          await checkAsset(`audio for "${it.label}"`, it.audio);
          await checkAsset(`image for "${it.label}"`, it.image);
        }
      }
      if (i.type === "highlight") {
        const wordsInText = new Set(i.text.split(/\s+/).map(norm));
        for (const t of i.targets) {
          if (!wordsInText.has(norm(t))) at(`highlight target "${t}" not present in text`);
        }
        // NO-REVEAL: if the prompt/narration contains every target word, the
        // slide hands the kid the answer instead of making them find it.
        const spokenWords = new Set(`${s.prompt} ${s.narration?.script ?? ""}`.split(/\s+/).map(norm));
        if (i.targets.length > 0 && i.targets.every((t) => spokenWords.has(norm(t))))
          at(`highlight prompt/narration REVEALS all target words (no-reveal rule)`);
      }
    }

    // lesson-level copy checks
    if (lesson.objective.includes("—")) errs.push("[lesson] em-dash in objective");
    if (lesson.completion) {
      for (const t of [lesson.completion.script, lesson.completion.title, lesson.completion.body]) {
        if (t.includes("—")) errs.push("[lesson] em-dash in completion copy");
      }
    }

    if (errs.length === 0) {
      console.log(`✓ ${id} — clean (${lesson.scenes.length} scenes)`);
    } else {
      problems += errs.length;
      console.log(`✗ ${id} — ${errs.length} problem(s):`);
      for (const e of errs) console.log(`    ${e}`);
    }
  }
  if (problems > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
