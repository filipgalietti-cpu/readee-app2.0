/**
 * Heal single-step teaching slides — split them into 2 staggered
 * sub-steps so they match the K reference pattern.
 *
 * Why: the deterministic audit flags `slide.few_steps` on every
 * teaching slide that has only one step. K reference (`RF.K.3b` etc.)
 * uses ≥2 sub-steps per slide so the kid sees a staggered reveal
 * instead of a wall of text appearing at once. Currently ~41 lessons
 * carry this warn.
 *
 * Strategy:
 *   For each single-step teaching slide:
 *     1. Read the step's ttsScript.
 *     2. Find a natural sentence-boundary split (period, then comma,
 *        else a word-count midpoint).
 *     3. Move first half into sub "a" with its own ttsScript +
 *        displayParts; second half into sub "b" with its own.
 *     4. Regenerate audio for each new sub-step.
 *     5. Write the new slides back to lessons_db.
 *
 * SAFETY: dry-run by default. `--apply` is required to actually
 * mutate lessons_db. `--limit=N` caps the run. `--standard=ID` scopes
 * to one row.
 *
 *   npx tsx scripts/qc-heal-single-step-slides.ts                 # dry-run all
 *   npx tsx scripts/qc-heal-single-step-slides.ts --standard=L.3.4 # dry-run one
 *   npx tsx scripts/qc-heal-single-step-slides.ts --apply --limit=5
 *
 * Heuristic note: ttsScript is the source of truth. If displayParts
 * already exist on the original step, we preserve their styling on
 * the FIRST sub; the second sub gets a single displayPart with the
 * post-split remainder. Pill highlights and other primitives stay
 * on the first sub by default.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

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

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;
const stdArg = args.find((a) => a.startsWith("--standard="));
const STANDARD = stdArg ? stdArg.split("=")[1] : null;

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
  [k: string]: any;
};

function isTeachingSlide(s: Slide): boolean {
  return s?.type !== "mcq" && Array.isArray(s.steps);
}

/**
 * Find the best split point in a sentence. Only splits at strong
 * punctuation boundaries — a mid-sentence period (preferred) or a
 * comma + conjunction. Returns null if no clean boundary exists,
 * which is the safer default: leave the slide single-step rather
 * than ship choppy karaoke. Both halves must contain ≥3 words and
 * ≥10 characters or the split is rejected.
 */
function splitText(text: string): [string, string] | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;

  const isClean = (a: string, b: string) => {
    const aWords = a.trim().split(/\s+/).filter(Boolean).length;
    const bWords = b.trim().split(/\s+/).filter(Boolean).length;
    return aWords >= 3 && bWords >= 3 && a.trim().length >= 10 && b.trim().length >= 10;
  };

  // (a) Period / ! / ? followed by a space and more text — strong
  // sentence boundary.
  const sentenceBreak = trimmed.match(/^(.+?[.!?])\s+(.+)$/);
  if (sentenceBreak) {
    const [, a, b] = sentenceBreak;
    if (isClean(a, b)) return [a.trim(), b.trim()];
  }

  // (b) Comma followed by a conjunction (and / but / so / or /
  // because / then) — natural pause point.
  const commaBreak = trimmed.match(
    /^(.+?),\s+(and|but|so|or|because|then)\s+(.+)$/i,
  );
  if (commaBreak) {
    const a = commaBreak[1] + ",";
    const b = `${commaBreak[2]} ${commaBreak[3]}`;
    if (isClean(a, b)) return [a.trim(), b.trim()];
  }

  // Anything else (mid-clause comma, word-count midpoint) is too
  // risky — choppy splits hurt karaoke worse than the warn does.
  return null;
}

async function regenStepAudio(
  standardId: string,
  slideNum: number,
  sub: string,
  text: string,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const targetPath = `lessons/${standardId}/S${slideNum}${sub}.mp3`;
  if (!APPLY) return { ok: true, path: targetPath };
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

type LessonRow = { standard_id: string; slides: Slide[] };

async function healLesson(row: LessonRow): Promise<{
  slidesSplit: number;
  audioRegen: number;
  errors: string[];
  preview: string[];
}> {
  const stats = { slidesSplit: 0, audioRegen: 0, errors: [] as string[], preview: [] as string[] };
  const slides = Array.isArray(row.slides) ? [...row.slides] : [];
  let mutated = false;

  for (const slide of slides) {
    if (!isTeachingSlide(slide)) continue;
    const steps = (slide.steps ?? []) as Step[];
    if (steps.length !== 1) continue;
    const step = steps[0];
    const script = (step.ttsScript ?? "").trim();
    if (!script) continue;

    const split = splitText(script);
    if (!split) {
      stats.preview.push(
        `  [${row.standard_id} slide ${slide.slide}] SKIP — text too short / no clean split: "${script.slice(0, 60)}"`,
      );
      continue;
    }
    const [first, second] = split;
    const slideNum = typeof slide.slide === "number" ? slide.slide : steps.indexOf(step) + 1;

    stats.preview.push(
      `  [${row.standard_id} slide ${slideNum}] split:\n      a) "${first}"\n      b) "${second}"`,
    );

    // Build sub a: keep the rich primitives (displayParts, pills,
    // sfxClaps, highlightWord). Override its ttsScript + audioFile.
    const subA: Step = {
      ...step,
      sub: "a",
      ttsScript: first,
      audioFile: `audio/lessons/${row.standard_id}/S${slideNum}a.mp3`,
      displayParts: [{ text: first, delay: 0 }],
    };

    // Build sub b: minimal — single displayPart with the second half,
    // a small starting delay so it doesn't fight sub a's animation.
    const subB: Step = {
      sub: "b",
      ttsScript: second,
      audioFile: `audio/lessons/${row.standard_id}/S${slideNum}b.mp3`,
      displayParts: [{ text: second, delay: 0 }],
    };

    const ra = await regenStepAudio(row.standard_id, slideNum, "a", first);
    if (!ra.ok) {
      stats.errors.push(`S${slideNum}a: ${ra.error}`);
      continue;
    }
    const rb = await regenStepAudio(row.standard_id, slideNum, "b", second);
    if (!rb.ok) {
      stats.errors.push(`S${slideNum}b: ${rb.error}`);
      continue;
    }

    if (APPLY) {
      subA.audioRegenAt = new Date().toISOString();
      subB.audioRegenAt = new Date().toISOString();
    }
    slide.steps = [subA, subB];
    stats.slidesSplit++;
    stats.audioRegen += 2;
    mutated = true;

    if (APPLY) {
      await sb.from("content_qc_log").insert({
        target_kind: "lesson_slide",
        target_id: `${row.standard_id}#S${slideNum}`,
        change_type: "split_single_step_slide",
        before: { step_count: 1, ttsScript: script },
        after: { step_count: 2, sub_a: first, sub_b: second },
        reason:
          "Single-step teaching slide split into 2 sub-steps so the kid sees a staggered reveal (K reference pattern).",
        agent: "qc-bot/heal-single-step",
      });
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  if (mutated && APPLY) {
    const { error } = await sb
      .from("lessons_db")
      .update({ slides, updated_at: new Date().toISOString() })
      .eq("standard_id", row.standard_id)
      .eq("language", "en");
    if (error) stats.errors.push(`lesson update: ${error.message}`);
  }

  return stats;
}

async function main() {
  console.log(
    `QC bot — split single-step slides ${APPLY ? "[APPLY — writing to lessons_db]" : "[DRY RUN — no DB writes, no audio regen]"}`,
  );

  let q = sb
    .from("lessons_db")
    .select("standard_id, slides")
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
  const rows = (data ?? []) as LessonRow[];
  console.log(`Scanning ${rows.length} lessons.\n`);

  let touched = 0;
  let totalSplit = 0;
  let totalAudio = 0;
  let totalErr = 0;
  const allPreview: string[] = [];

  for (const row of rows) {
    const slides = Array.isArray(row.slides) ? row.slides : [];
    const hasSingleStep = slides.some(
      (s: any) => isTeachingSlide(s) && (s.steps ?? []).length === 1,
    );
    if (!hasSingleStep) continue;
    touched++;
    const r = await healLesson(row);
    allPreview.push(...r.preview);
    totalSplit += r.slidesSplit;
    totalAudio += r.audioRegen;
    totalErr += r.errors.length;
    if (r.errors.length > 0) {
      for (const e of r.errors) console.log(`    ! ${e}`);
    }
  }

  console.log(allPreview.join("\n"));
  console.log(
    `\nTouched ${touched} lessons. ${totalSplit} slides ${APPLY ? "split" : "would split"}, ${totalAudio} audio steps ${APPLY ? "regenerated" : "would regenerate"}, errors=${totalErr}.`,
  );
  if (!APPLY) {
    console.log(
      "\nThis was a dry run. Re-run with --apply to actually mutate lessons_db + regenerate audio.",
    );
  } else if (touched > 0) {
    console.log("\nNext: npx tsx scripts/sync-content-from-db.ts");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
