/**
 * Heal handler: canon_missing_example.
 *
 * Authors a canon-quality "Let's Try One" example slide for lessons that
 * have none, matching the nearest CANON example of the same skill type.
 *
 *   npx tsx scripts/qc-heal-canon-missing-example.ts --dry-run --standard=RL.1.3
 *   npx tsx scripts/qc-heal-canon-missing-example.ts --dry-run --grade="1st Grade" --limit=3
 *   npx tsx scripts/qc-heal-canon-missing-example.ts --apply  --standard=RL.1.3   (not yet — see below)
 *
 * Pilot scope (Filip 2026-05-30): 1st grade first; K is EXCLUDED (its
 * examples are age-appropriate tap/diagram interactions, not Q→A — don't
 * 4th-grade-ify kindergarten). --dry-run authors + validates + prints the
 * slide JSON for inspection; --apply (asset gen + persist) lands next.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync, execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import {
  authorExampleSlide,
  skillTypeForStandard,
  type SkillType,
} from "../lib/qc/example-author";
import { isCanonLesson } from "../lib/qc/lesson-canon";
import { generateImage } from "@/lib/ai/readee-ai";
import { generateSpeechVertex } from "@/lib/ai/vertex-tts";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const QC_BOT_TEACHER_ID = process.env.QC_BOT_TEACHER_ID!;

// Grade-conditional pre-roll: the visual reveal leads the audio so an
// emergent reader sees the answer just as it is spoken (matches the
// aligner's convention — see align-slide-timings.ts).
const PRE_ROLL_MS: Record<string, number> = {
  Kindergarten: 150,
  "1st Grade": 120,
  "2nd Grade": 100,
  "3rd Grade": 60,
  "4th Grade": 40,
};

type WordTiming = { word: string; start: number; end: number };

/** Local Whisper word-timestamps (same model the timing aligner uses). */
function whisperWords(mp3Path: string): WordTiming[] {
  const py = `
import sys, json, whisper, warnings
warnings.filterwarnings("ignore")
model = whisper.load_model("base", in_memory=True)
r = model.transcribe(sys.argv[1], word_timestamps=True, fp16=False, verbose=False, language="en")
out=[]
for seg in r.get("segments", []):
    for w in seg.get("words", []):
        out.append({"word": w["word"].strip(), "start": float(w["start"]), "end": float(w["end"])})
print(json.dumps(out))
`;
  const raw = execFileSync("python3", ["-c", py, mp3Path], {
    encoding: "utf-8",
    maxBuffer: 1024 * 1024 * 8,
  });
  return JSON.parse(raw);
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9']/g, "");
}

/** Start-ms of the first occurrence of `target` at/after cursor word index. */
function wordStartMs(words: WordTiming[], target: string, cursor = 0): number | null {
  const t = norm(target);
  if (!t) return null;
  for (let i = cursor; i < words.length; i++) {
    const w = norm(words[i].word);
    if (w && (w === t || w.startsWith(t) || t.startsWith(w))) {
      return Math.round(words[i].start * 1000);
    }
  }
  return null;
}

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const DRY = args.includes("--dry-run") || !APPLY;
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;
const stdArg = args.find((a) => a.startsWith("--standard="));
const STANDARD = stdArg ? stdArg.split("=")[1] : null;
const gradeArg = args.find((a) => a.startsWith("--grade="));
const GRADE = gradeArg ? gradeArg.split("=")[1] : null;

const GRADE_FILE: Record<string, string> = {
  Kindergarten: "kindergarten-standards-questions.json",
  "1st Grade": "1st-grade-standards-questions.json",
  "2nd Grade": "2nd-grade-standards-questions.json",
  "3rd Grade": "3rd-grade-standards-questions.json",
  "4th Grade": "4th-grade-standards-questions.json",
};

async function standardText(grade: string, standardId: string): Promise<string> {
  const file = GRADE_FILE[grade];
  if (!file) return standardId;
  try {
    const raw = await fs.readFile(path.resolve(process.cwd(), "app/data", file), "utf-8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data) ? data : data.standards ?? [];
    const hit = list.find((s: any) => s.standard_id === standardId);
    return hit?.standard_description ?? standardId;
  } catch {
    return standardId;
  }
}

/** Pull focal words already used on the lesson's teach slides. */
function teachWords(lesson: any): string[] {
  const out = new Set<string>();
  for (const sl of lesson.slides ?? []) {
    if (sl.type !== "teach") continue;
    for (const st of sl.steps ?? []) {
      if (st.displayTableRow?.label) out.add(String(st.displayTableRow.label));
      if (st.displayTableRow?.example) out.add(String(st.displayTableRow.example));
      if (st.displayHighlight) out.add(String(st.displayHighlight));
      if (typeof st.displayText === "string" && st.displayText.trim().split(/\s+/).length <= 2) {
        out.add(st.displayText.trim());
      }
      for (const p of st.displayParts ?? []) {
        const t = String(p.text || "").trim();
        if (t && t.split(/\s+/).length === 1) out.add(t);
      }
    }
  }
  return [...out].filter(Boolean);
}

/**
 * Generate + upload the slide's image and per-step audio at CANONICAL
 * paths, and derive Q→A / highlightWord timing from the new audio.
 * Mutates `slide` in place. Throws on any failure (so the lesson is
 * skipped, not half-written).
 */
async function applyAssets(
  slide: any,
  standardId: string,
  slideNum: number,
  grade: string,
): Promise<void> {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const preRoll = PRE_ROLL_MS[grade] ?? 80;

  // ── Image ──
  slide.imageFile = `images/lessons/${standardId}/S${slideNum}.png`;
  const img = await generateImage({
    teacherId: QC_BOT_TEACHER_ID,
    prompt: slide.imagePrompt,
    quality: "standard",
  });
  if (!img.ok) throw new Error(`image gen: ${img.error}`);
  const imgUp = await sb.storage
    .from("images")
    .upload(slide.imageFile.replace(/^images\//, ""), Buffer.from(img.imageBase64, "base64"), {
      contentType: img.mimeType,
      upsert: true,
      cacheControl: "no-cache",
    });
  if (imgUp.error) throw new Error(`image upload: ${imgUp.error.message}`);
  slide.imageRegenAt = new Date().toISOString();

  // ── Audio per step ──
  for (const step of slide.steps) {
    step.audioFile = `audio/lessons/${standardId}/S${slideNum}${step.sub}.mp3`;
    const tts = await generateSpeechVertex({ text: step.ttsScript, voice: "Autonoe" });
    if (!tts.ok) throw new Error(`tts ${step.sub}: ${tts.error}`);

    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "ex-tts-"));
    const pcm = path.join(tmp, "a.pcm");
    const mp3 = path.join(tmp, "a.mp3");
    await fs.writeFile(pcm, Buffer.from(tts.pcmBase64, "base64"));
    const ff = spawnSync(
      "ffmpeg",
      ["-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm,
       "-codec:a", "libmp3lame", "-qscale:a", "2", mp3],
      { encoding: "utf-8" },
    );
    if (ff.status !== 0) throw new Error(`ffmpeg ${step.sub}: ${ff.stderr}`);

    // Derive timing from the actual audio (canon rule 6). Search for the
    // answer / highlight word AFTER the question mark so an answer word
    // that also appears in the question doesn't match the question side.
    const isQA =
      Array.isArray(step.displayParts) &&
      step.displayParts.length === 2 &&
      String(step.displayParts[0].text).trim().endsWith("?");
    if (isQA || step.highlightWord?.word) {
      const words = whisperWords(mp3);
      const qIdx = words.findIndex((w) => w.word.includes("?"));
      const cursor = qIdx >= 0 ? qIdx + 1 : 0;
      // Fallback reveal point: end of the question. Used when Whisper
      // mis-transcribes the answer word (common for proper nouns like
      // names) so the answer never pops AT the question (delay 0).
      const qEndMs = qIdx >= 0 ? Math.round(words[qIdx].end * 1000) : 0;
      if (isQA) {
        const ansFirst = String(step.displayParts[1].text)
          .split(/\s+/).map(norm).filter(Boolean)[0];
        const found = ansFirst ? wordStartMs(words, ansFirst, cursor) : null;
        const st = found ?? qEndMs;
        step.displayParts[1].delay = Math.max(0, st - preRoll);
      }
      if (step.highlightWord?.word) {
        const found = wordStartMs(words, step.highlightWord.word, cursor);
        const st = found ?? qEndMs;
        step.highlightWord.delay = Math.max(0, st - preRoll);
      }
    }

    const auUp = await sb.storage
      .from("audio")
      .upload(step.audioFile.replace(/^audio\//, ""), await fs.readFile(mp3), {
        contentType: "audio/mpeg",
        upsert: true,
        cacheControl: "no-cache",
      });
    if (auUp.error) throw new Error(`audio upload ${step.sub}: ${auUp.error.message}`);
    step.audioRegenAt = new Date().toISOString();
  }
}

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));

  // Build the canon example reference per skill type (prefer a grade-near
  // match, but skill type is the primary key).
  const canonBySkill: Record<SkillType, any[]> = {
    comprehension: [],
    phonics: [],
    vocab: [],
  };
  for (const l of lessons) {
    if (!isCanonLesson(l.standardId)) continue;
    const ex = (l.slides ?? []).find((s: any) => s.type === "example");
    if (!ex) continue;
    const skill = skillTypeForStandard(l.standardId);
    canonBySkill[skill].push({ grade: l.grade, std: l.standardId, slide: ex });
  }

  // Targets: lessons missing an example slide. Exclude canon + K.
  let targets = lessons.filter((l) => {
    if (!l.standardId || isCanonLesson(l.standardId)) return false;
    if (l.grade === "Kindergarten") return false; // pilot exclusion
    const hasExample = (l.slides ?? []).some((s: any) => s.type === "example");
    return !hasExample;
  });
  if (STANDARD) targets = targets.filter((l) => l.standardId === STANDARD);
  if (GRADE) targets = targets.filter((l) => l.grade === GRADE);
  if (LIMIT) targets = targets.slice(0, LIMIT);

  console.log(
    `\n${DRY ? "DRY-RUN" : "APPLY"} · ${targets.length} target lesson(s)` +
      `${STANDARD ? ` · standard=${STANDARD}` : ""}${GRADE ? ` · grade=${GRADE}` : ""}\n`,
  );

  let ok = 0;
  let fail = 0;
  let wrote = false;
  for (const lesson of targets) {
    const skill = skillTypeForStandard(lesson.standardId);
    const pool = canonBySkill[skill];
    const ref =
      pool.find((c) => c.grade === lesson.grade)?.slide ?? pool[0]?.slide ?? null;
    if (!ref) {
      console.log(`✗ ${lesson.standardId} (${skill}) — no canon reference found`);
      fail++;
      continue;
    }
    const slides = lesson.slides ?? [];
    // Example goes right after the last teach slide (before tip/mcq).
    const lastTeach = slides.map((s: any) => s.type).lastIndexOf("teach");
    const insertAt = (lastTeach >= 0 ? lastTeach : slides.length - 1) + 1;
    const slideNumber = insertAt + 1; // 1-based; corrected by renumber below

    const stdText = await standardText(lesson.grade, lesson.standardId);
    const result = await authorExampleSlide({
      standardId: lesson.standardId,
      standardText: stdText,
      lessonTitle: lesson.title,
      grade: lesson.grade,
      slideNumber,
      skillType: skill,
      referenceExample: ref,
      teachWords: teachWords(lesson),
    });
    if (!result.ok) {
      console.log(`✗ ${lesson.standardId} (${skill}, ref ${pool.find((c) => c.slide === ref)?.std}) — ${result.error}`);
      fail++;
      continue;
    }

    console.log(`\n${"=".repeat(70)}`);
    console.log(`✓ ${lesson.standardId} — ${lesson.title} (${lesson.grade}, skill=${skill})`);
    console.log(`  reference: ${pool.find((c) => c.slide === ref)?.std} · inserts at slide ${slideNumber}`);
    console.log(`  teach words avoided: ${teachWords(lesson).join(", ") || "(none)"}`);

    if (!APPLY) {
      console.log(`${"=".repeat(70)}`);
      console.log(JSON.stringify(result.slide, null, 2));
      ok++;
      continue;
    }

    // APPLY: generate assets (image + audio + derived timing), splice the
    // slide into the lesson, renumber non-mcq slides, write JSON.
    try {
      console.log(`  generating image + ${result.slide.steps.length} audio clips + timing…`);
      await applyAssets(result.slide, lesson.standardId, slideNumber, lesson.grade);
    } catch (e: any) {
      console.log(`✗ ${lesson.standardId} — asset gen failed: ${e?.message ?? e}`);
      fail++;
      continue;
    }
    lesson.slides.splice(insertAt, 0, result.slide);
    let n = 0;
    for (const s of lesson.slides) {
      if (s.type !== "mcq") s.slide = ++n;
    }
    wrote = true;
    ok++;
    console.log(`  ✓ applied — image + audio uploaded, spliced as slide ${result.slide.slide}`);
  }

  if (APPLY && wrote) {
    await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2));
    console.log(`\n  wrote app/data/sample-lessons.json`);
  }
  console.log(`\n— ${APPLY ? "applied" : "authored"} ${ok}, failed ${fail} —\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
