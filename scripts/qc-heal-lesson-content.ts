/**
 * Lesson-content heal script — fixes two systemic bugs Filip caught
 * on L.4.4b (May 8, 2026):
 *
 *  1) step_audio_overscope — ≥2 sub-steps in a slide share the same
 *     `ttsScript`. The audio for each step plays the FULL multi-clause
 *     line while the displayParts only show that step's fragment.
 *     Kid hears "Bio means life. Photo means light. Telephone — far
 *     sound." three times. 23 G3/G4 slides currently broken.
 *
 *  2) broken_mcq_ref — lesson references mcqId not present in the
 *     standards question bank. The lesson plays through teaching slides,
 *     then mounts a `<mcq>` slide with an id (e.g. L.4.4b-Q1) that the
 *     renderer can't find, so the practice reinforcement silently
 *     drops. 26 lessons affected, often L.x.4/L.x.5 vocab strands.
 *
 * Heal logic per bug:
 *
 *  audio_overscope:
 *    - derive new ttsScript per step by concatenating displayParts.text
 *    - shift all animation delays by -min(delay) so the first cue lands
 *      at 0ms relative to the (now shorter) per-step audio
 *    - regenerate audio with the new script (TTS via readee-ai)
 *    - upload to canonical path: audio/lessons/{stdId}/S{n}{sub}.mp3
 *    - set step.audioRegenAt and update lessons_db row
 *
 *  broken_mcq_ref:
 *    - load standard's question bank from app/data/{grade}-...json
 *    - swap broken mcqIds for existing ones in the bank (preserving
 *      order, not reusing across slides)
 *    - if the standard has fewer existing Qs than mcq slide count,
 *      drop the extra mcq slides entirely (the lesson still ends
 *      cleanly on its last teaching slide)
 *
 * Usage:
 *   npx tsx scripts/qc-heal-lesson-content.ts --dry-run
 *   npx tsx scripts/qc-heal-lesson-content.ts --standard=L.4.4b
 *   npx tsx scripts/qc-heal-lesson-content.ts --limit=5
 *   npx tsx scripts/qc-heal-lesson-content.ts            (full run)
 *
 * After running, also run: npx tsx scripts/sync-content-from-db.ts
 * so sample-lessons.json picks up the lessons_db changes.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { generateSpeech } from "@/lib/ai/readee-ai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const QC_TEACHER = process.env.QC_BOT_TEACHER_ID!;
if (!SUPABASE_URL || !SERVICE_KEY || !QC_TEACHER) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + QC_BOT_TEACHER_ID",
  );
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const DRY = process.argv.includes("--dry-run");
const SKIP_AUDIO = process.argv.includes("--skip-audio");
const stdArg = process.argv.find((a) => a.startsWith("--standard="));
const STANDARD = stdArg ? stdArg.split("=")[1] : null;
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;

const DATA_DIR = path.join(process.cwd(), "app", "data");
const QUESTION_BANKS = [
  { file: "kindergarten-standards-questions.json" },
  { file: "1st-grade-standards-questions.json" },
  { file: "2nd-grade-standards-questions.json" },
  { file: "3rd-grade-standards-questions.json" },
  { file: "4th-grade-standards-questions.json" },
];

type Step = {
  sub?: string;
  ttsScript?: string;
  audioFile?: string;
  audioRegenAt?: string;
  displayParts?: { text: string; delay?: number }[];
  highlightWord?: { word: string; delay?: number };
  highlightPills?: { pill: number; delay?: number }[];
  sfxClaps?: { delay?: number }[];
  [k: string]: any;
};
type Slide = {
  type?: string;
  slide?: number;
  steps?: Step[];
  mcqId?: string;
  [k: string]: any;
};

function isTeachingSlide(s: Slide): boolean {
  return s?.type !== "mcq" && Array.isArray(s.steps);
}

async function loadQuestionsByStandard(): Promise<Map<string, string[]>> {
  const m = new Map<string, string[]>();
  for (const { file } of QUESTION_BANKS) {
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
      const d = JSON.parse(raw);
      for (const s of d.standards ?? []) {
        const ids = (s.questions ?? []).map((q: any) => q.id);
        m.set(s.standard_id, ids);
      }
    } catch (e: any) {
      console.warn(`  ! bank read failed: ${file} — ${e.message}`);
    }
  }
  return m;
}

/**
 * Derive per-step ttsScript from displayParts. Concats the text and
 * normalizes whitespace so " means " + "life." becomes " means life."
 * cleanly.
 */
function deriveTtsFromDisplayParts(step: Step): string | null {
  const parts = Array.isArray(step.displayParts) ? step.displayParts : [];
  if (parts.length === 0) return null;
  const text = parts
    .map((p) => p?.text ?? "")
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

/**
 * Shift every animation delay in the step by -minDelay so the first
 * cue lands at 0ms. Mutates the step in place.
 */
function shiftStepDelays(step: Step): void {
  const delays: number[] = [];
  for (const p of step.displayParts ?? []) {
    if (typeof p?.delay === "number") delays.push(p.delay);
  }
  if (typeof step.highlightWord?.delay === "number") {
    delays.push(step.highlightWord.delay);
  }
  for (const p of step.highlightPills ?? []) {
    if (typeof p?.delay === "number") delays.push(p.delay);
  }
  for (const c of step.sfxClaps ?? []) {
    if (typeof c?.delay === "number") delays.push(c.delay);
  }
  if (delays.length === 0) return;
  const minDelay = Math.min(...delays);
  if (minDelay <= 0) return; // already step-relative

  for (const p of step.displayParts ?? []) {
    if (typeof p?.delay === "number") p.delay = p.delay - minDelay;
  }
  if (typeof step.highlightWord?.delay === "number") {
    step.highlightWord.delay = step.highlightWord.delay - minDelay;
  }
  for (const p of step.highlightPills ?? []) {
    if (typeof p?.delay === "number") p.delay = p.delay - minDelay;
  }
  for (const c of step.sfxClaps ?? []) {
    if (typeof c?.delay === "number") c.delay = c.delay - minDelay;
  }
}

async function regenStepAudio(
  standardId: string,
  slideNum: number,
  step: Step,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const sub = step.sub ?? "a";
  const text = (step.ttsScript ?? "").trim();
  if (!text) return { ok: false, error: "no ttsScript" };
  const targetPath = `lessons/${standardId}/S${slideNum}${sub}.mp3`;

  if (SKIP_AUDIO) {
    return { ok: true, path: targetPath };
  }
  if (DRY) {
    console.log(
      `      DRY [S${slideNum}${sub}] → ${targetPath} :: "${text.slice(0, 70)}"`,
    );
    return { ok: true, path: targetPath };
  }

  const tts = await generateSpeech({ teacherId: QC_TEACHER, text });
  if (!tts.ok) return { ok: false, error: `generateSpeech: ${tts.error}` };
  const fetched = await fetch(tts.audioUrl);
  if (!fetched.ok) return { ok: false, error: `fetch: HTTP ${fetched.status}` };
  const buf = Buffer.from(await fetched.arrayBuffer());
  const { error: upErr } = await sb.storage
    .from("audio")
    .upload(targetPath, buf, { contentType: "audio/mpeg", upsert: true });
  if (upErr) return { ok: false, error: `upload: ${upErr.message}` };
  return { ok: true, path: targetPath };
}

type HealStats = {
  audioStepsFixed: number;
  mcqRefsFixed: number;
  mcqSlidesDropped: number;
  errors: string[];
};

async function healLesson(
  row: { standard_id: string; slides: Slide[] },
  banks: Map<string, string[]>,
): Promise<HealStats> {
  const stats: HealStats = {
    audioStepsFixed: 0,
    mcqRefsFixed: 0,
    mcqSlidesDropped: 0,
    errors: [],
  };
  const slides = Array.isArray(row.slides) ? [...row.slides] : [];
  let mutated = false;

  // Pass 1 — fix audio_overscope on teaching slides.
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    if (!isTeachingSlide(slide)) continue;
    const steps = (slide.steps ?? []) as Step[];
    if (steps.length < 2) continue;

    const scriptsSet = new Set(
      steps.map((s) => (s.ttsScript ?? "").trim()).filter(Boolean),
    );
    const allHaveScript = steps.every((s) => (s.ttsScript ?? "").trim());
    if (!allHaveScript) continue;
    if (scriptsSet.size === steps.length) continue; // no duplicates, healthy

    const slideNum = typeof slide.slide === "number" ? slide.slide : i + 1;
    console.log(
      `  [${row.standard_id}] slide ${slideNum} overscope: ${steps.length} steps share ${scriptsSet.size} script(s) — repairing.`,
    );

    // Edge case: every step's displayParts span the FULL same sentence
    // (just with different words highlighted). Deriving from displayParts
    // would produce the same ttsScript again. Collapse to a single step
    // so the kid hears the line once. Lose the staggered emphasis but
    // preserve the content — better than 3× audio repetition.
    const derivedScripts = steps.map((s) => deriveTtsFromDisplayParts(s) ?? "");
    if (
      derivedScripts.every(Boolean) &&
      new Set(derivedScripts).size === 1 &&
      derivedScripts.length >= 2
    ) {
      console.log(
        `    → all steps derive to the same script; collapsing slide ${slideNum} to a single step.`,
      );
      const first = steps[0];
      first.ttsScript = derivedScripts[0];
      shiftStepDelays(first);
      const result = await regenStepAudio(row.standard_id, slideNum, first);
      if (!result.ok) {
        stats.errors.push(`S${slideNum}${first.sub ?? "?"}: ${result.error}`);
      } else {
        first.audioFile = `audio/${result.path}`;
        first.audioRegenAt = new Date().toISOString();
        stats.audioStepsFixed++;
      }
      slide.steps = [first];
      mutated = true;
      if (!DRY) {
        await sb.from("content_qc_log").insert({
          target_kind: "lesson_slide",
          target_id: `${row.standard_id}#S${slideNum}`,
          change_type: "collapse_redundant_steps",
          before: { step_count: steps.length, shared_ttsScript: true },
          after: { step_count: 1, ttsScript: derivedScripts[0] },
          reason:
            "All sub-steps spanned the same sentence with different word emphasis; collapsed to a single step so the kid hears the line once.",
          agent: "qc-bot/heal-lesson-content",
        });
        await new Promise((r) => setTimeout(r, 600));
      }
      continue; // move on to the next slide
    }

    for (const step of steps) {
      const newScript = deriveTtsFromDisplayParts(step);
      if (!newScript) {
        stats.errors.push(
          `S${slideNum}${step.sub ?? "?"}: no displayParts text to derive ttsScript`,
        );
        continue;
      }
      step.ttsScript = newScript;
      shiftStepDelays(step);

      const result = await regenStepAudio(row.standard_id, slideNum, step);
      if (!result.ok) {
        stats.errors.push(`S${slideNum}${step.sub ?? "?"}: ${result.error}`);
        continue;
      }
      step.audioFile = `audio/${result.path}`;
      step.audioRegenAt = new Date().toISOString();
      stats.audioStepsFixed++;
      mutated = true;

      if (!DRY) {
        await sb.from("content_qc_log").insert({
          target_kind: "lesson_slide",
          target_id: `${row.standard_id}#S${slideNum}${step.sub ?? "?"}`,
          change_type: "heal_step_audio_overscope",
          before: { audio_url: step.audioFile, ttsScript_was_shared: true },
          after: { audio_url: step.audioFile, ttsScript: newScript },
          reason:
            "Sub-steps shared one ttsScript; derived per-step script from displayParts and regenerated unique audio.",
          agent: "qc-bot/heal-lesson-content",
        });
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }

  // Pass 2 — fix broken_mcq_ref by substituting from the question bank.
  const stdQs = banks.get(row.standard_id) ?? [];
  const stdQSet = new Set(stdQs);
  const usedQs = new Set<string>();
  // First, collect any already-valid IDs as used.
  for (const slide of slides) {
    if (slide?.type === "mcq" && typeof slide.mcqId === "string" && stdQSet.has(slide.mcqId)) {
      usedQs.add(slide.mcqId);
    }
  }
  // Available pool: bank IDs not yet used in this lesson.
  const pool = stdQs.filter((id) => !usedQs.has(id));
  const newSlides: Slide[] = [];
  for (const slide of slides) {
    if (slide?.type !== "mcq" || typeof slide.mcqId !== "string") {
      newSlides.push(slide);
      continue;
    }
    if (stdQSet.has(slide.mcqId)) {
      newSlides.push(slide);
      continue; // already valid
    }
    // Broken ref — try to substitute.
    const replacement = pool.shift();
    if (replacement) {
      console.log(
        `  [${row.standard_id}] mcq ${slide.mcqId} → ${replacement}`,
      );
      stats.mcqRefsFixed++;
      mutated = true;
      if (!DRY) {
        await sb.from("content_qc_log").insert({
          target_kind: "lesson_slide",
          target_id: `${row.standard_id}#mcq#${slide.slide ?? "?"}`,
          change_type: "heal_broken_mcq_ref",
          before: { mcqId: slide.mcqId },
          after: { mcqId: replacement },
          reason: "Original mcqId not in standards question bank; substituted with existing question for the same standard.",
          agent: "qc-bot/heal-lesson-content",
        });
      }
      newSlides.push({ ...slide, mcqId: replacement });
    } else {
      console.log(
        `  [${row.standard_id}] mcq ${slide.mcqId} dropped (no replacement in bank).`,
      );
      stats.mcqSlidesDropped++;
      mutated = true;
      if (!DRY) {
        await sb.from("content_qc_log").insert({
          target_kind: "lesson_slide",
          target_id: `${row.standard_id}#mcq#${slide.slide ?? "?"}`,
          change_type: "drop_broken_mcq_slide",
          before: { mcqId: slide.mcqId },
          after: null,
          reason: "Original mcqId missing from question bank and no replacement available; mcq slide removed so the lesson ends cleanly.",
          agent: "qc-bot/heal-lesson-content",
        });
      }
      // do not push
    }
  }

  if (mutated && !DRY) {
    const { error } = await sb
      .from("lessons_db")
      .update({ slides: newSlides, updated_at: new Date().toISOString() })
      .eq("standard_id", row.standard_id)
      .eq("language", "en");
    if (error) stats.errors.push(`lesson update: ${error.message}`);
  }
  return stats;
}

async function main() {
  console.log(`QC bot — lesson content heal ${DRY ? "(DRY RUN)" : ""}${SKIP_AUDIO ? " [skip-audio]" : ""}`);
  const banks = await loadQuestionsByStandard();
  console.log(`Loaded question bank for ${banks.size} standards.`);

  let q = sb
    .from("lessons_db")
    .select("standard_id, grade, slides")
    .eq("language", "en")
    .neq("qc_status", "quarantined")
    .neq("qc_status", "retired");
  if (STANDARD) q = q.eq("standard_id", STANDARD);
  q = q.order("standard_id", { ascending: true });
  if (LIMIT) q = q.limit(LIMIT);

  const { data, error } = await q;
  if (error) {
    console.error("query failed:", error.message);
    process.exit(1);
  }
  const rows = (data ?? []) as any[];
  console.log(`Scanning ${rows.length} lessons.`);

  let totalAudio = 0;
  let totalMcqFix = 0;
  let totalMcqDrop = 0;
  let totalErr = 0;
  let touched = 0;

  for (const row of rows) {
    // Quick pre-flight: does this row have either bug?
    const slides = Array.isArray(row.slides) ? row.slides : [];
    let hasAudioBug = false;
    let hasMcqBug = false;
    for (const s of slides) {
      const steps = Array.isArray(s?.steps) ? s.steps : [];
      if (steps.length >= 2) {
        const scripts = steps
          .map((st: any) => (st?.ttsScript ?? "").trim())
          .filter(Boolean);
        if (new Set(scripts).size < scripts.length && scripts.length >= 2) {
          hasAudioBug = true;
        }
      }
      if (s?.type === "mcq" && typeof s.mcqId === "string") {
        const bankIds = banks.get(row.standard_id);
        if (bankIds && !bankIds.includes(s.mcqId)) hasMcqBug = true;
      }
    }
    if (!hasAudioBug && !hasMcqBug) continue;

    touched++;
    const r = await healLesson(row, banks);
    totalAudio += r.audioStepsFixed;
    totalMcqFix += r.mcqRefsFixed;
    totalMcqDrop += r.mcqSlidesDropped;
    totalErr += r.errors.length;
    if (r.errors.length > 0) {
      for (const e of r.errors) console.log(`    ! ${e}`);
    }
  }

  console.log(
    `\nDone — touched ${touched} lessons. audio steps fixed=${totalAudio}, mcq refs fixed=${totalMcqFix}, mcq slides dropped=${totalMcqDrop}, errors=${totalErr}.`,
  );
  if (!DRY && touched > 0) {
    console.log(
      "\nNext: npx tsx scripts/sync-content-from-db.ts  # writes the changes back to app/data/sample-lessons.json",
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
