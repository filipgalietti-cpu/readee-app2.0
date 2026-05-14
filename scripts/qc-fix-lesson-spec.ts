/**
 * Deterministic structural fixers for lesson_slide spec findings.
 * No LLM — pure code. Targets four finding types that have
 * unambiguous mechanical fixes:
 *
 *   spec.display_parts_drift   — rebuild displayParts from ttsScript
 *   spec.animation_ghost_word  — drop highlights that don't appear
 *                                in displayParts
 *   spec.long_letter_text      — truncate letterTile-style text > 3 chars
 *   spec.image_style           — append brand style suffix to imagePrompt
 *
 * Finding target_id shape: `<STANDARD_ID>#S<step_label>` (e.g.
 * `K.L.1#S5b`). Step label is `<slide_num><sub>` where sub is the
 * letter suffix of the matching step.
 *
 * Usage:
 *   npx tsx scripts/qc-fix-lesson-spec.ts --type=spec.display_parts_drift --dry-run
 *   npx tsx scripts/qc-fix-lesson-spec.ts --type=spec.display_parts_drift --limit=10
 *   npx tsx scripts/qc-fix-lesson-spec.ts --type=spec.image_style
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const args = process.argv.slice(2);
const TYPE = args.find((a) => a.startsWith("--type="))?.split("=")[1] ?? null;
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "0") || null;
const DRY = args.includes("--dry-run");

const RESOLVER_ID = "00000000-0000-0000-0000-000000000001"; // qc_bot

const SUPPORTED = [
  "spec.display_parts_drift",
  "spec.animation_ghost_word",
  "spec.long_letter_text",
  "spec.image_style",
] as const;

type Finding = {
  id: string;
  target_id: string;
  finding_type: string;
};

type Step = {
  sub: string;
  ttsScript?: string;
  displayParts?: { text: string; delay?: number }[];
  highlightWord?: { word: string; delay?: number };
  highlightPills?: { pill: number; delay?: number }[];
  letterTile?: { letters?: string; text?: string } | any;
  [k: string]: any;
};

type Slide = {
  slide: number;
  steps: Step[];
  imagePrompt?: string;
  [k: string]: any;
};

/* ─── Fixers ─────────────────────────────────────────────────────── */

const STYLE_SUFFIX =
  "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

function fixDisplayPartsDrift(step: Step): Step {
  const tts = (step.ttsScript ?? "").trim();
  if (!tts) return step;
  // Chunk into 4-6 segments at sentence/phrase boundaries; fall back
  // to word splits if no punctuation.
  const sentenceChunks = tts
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  let chunks: string[];
  if (sentenceChunks.length >= 2 && sentenceChunks.length <= 6) {
    chunks = sentenceChunks;
  } else {
    const words = tts.split(/\s+/);
    const target = Math.max(2, Math.min(5, Math.ceil(words.length / 4)));
    const per = Math.ceil(words.length / target);
    chunks = [];
    for (let i = 0; i < words.length; i += per) {
      chunks.push(words.slice(i, i + per).join(" "));
    }
  }
  // Distribute delays across chunks (proportional to word count).
  const totalWords = tts.split(/\s+/).length;
  const msPerWord = 380;
  let cursor = 0;
  const displayParts = chunks.map((text, i) => {
    const delay = i === 0 ? 0 : cursor;
    cursor += text.split(/\s+/).length * msPerWord;
    return { text: (i === 0 ? text : " " + text), delay };
  });
  // Lose any per-token animation cues that won't survive the rebuild.
  const next = { ...step, displayParts };
  // After rebuild, ghost-word check would also pass; if highlightWord
  // or highlightPills referenced non-existent text, drop them.
  return stripGhostHighlights(next);
}

function stripGhostHighlights(step: Step): Step {
  const partsText = (step.displayParts ?? [])
    .map((p) => p.text)
    .join(" ")
    .toLowerCase();
  const next = { ...step };
  if (step.highlightWord?.word) {
    const w = step.highlightWord.word.toLowerCase();
    if (!partsText.includes(w)) {
      const { highlightWord: _drop, ...rest } = next;
      Object.assign(next, rest);
      delete (next as any).highlightWord;
    }
  }
  if (Array.isArray(step.highlightPills) && step.displayParts) {
    const validIdxs = new Set(step.displayParts.map((_, i) => i));
    const cleaned = step.highlightPills.filter((p) => validIdxs.has(p.pill));
    if (cleaned.length !== step.highlightPills.length) {
      next.highlightPills = cleaned;
    }
  }
  return next;
}

function fixLongLetterText(step: Step): Step {
  if (!step.letterTile) return step;
  const lt = { ...step.letterTile };
  const t = String(lt.letters ?? lt.text ?? "");
  if (t.length <= 3) return step;
  // Keep the first letter — letter tiles in K canon are single graphemes.
  if ("letters" in lt) lt.letters = t.slice(0, 1);
  if ("text" in lt) lt.text = t.slice(0, 1);
  return { ...step, letterTile: lt };
}

function fixImageStyle(slide: Slide): Slide {
  const ip = (slide.imagePrompt ?? "").trim();
  if (!ip) return slide;
  if (ip.toLowerCase().includes("bright 2d cartoon")) return slide;
  return { ...slide, imagePrompt: `${ip} ${STYLE_SUFFIX}` };
}

/* ─── Lookup + apply ─────────────────────────────────────────────── */

function parseTargetId(target_id: string): { standardId: string; slideNum: number; sub: string } | null {
  // Step-level shape: "K.L.1#S5b" → { standardId: "K.L.1", slideNum: 5, sub: "b" }
  let m = target_id.match(/^(.+)#S(\d+)([a-z])$/);
  if (m) return { standardId: m[1], slideNum: Number(m[2]), sub: m[3] };
  // Slide-level shape: "RI.K.4#slide-5" → { standardId: "RI.K.4", slideNum: 5, sub: "" }
  m = target_id.match(/^(.+)#slide-(\d+)$/);
  if (m) return { standardId: m[1], slideNum: Number(m[2]), sub: "" };
  return null;
}

async function loadLesson(standardId: string): Promise<{ id: string; slides: Slide[] } | null> {
  const { data, error } = await sb
    .from("lessons_db")
    .select("id, slides")
    .eq("standard_id", standardId)
    .maybeSingle();
  if (error) {
    console.error(`  lesson lookup: ${error.message}`);
    return null;
  }
  return data as any;
}

async function applyFix(finding: Finding): Promise<{ ok: boolean; reason: string }> {
  const parsed = parseTargetId(finding.target_id);
  if (!parsed) return { ok: false, reason: `unparseable target_id: ${finding.target_id}` };
  const lesson = await loadLesson(parsed.standardId);
  if (!lesson) return { ok: false, reason: `no lesson for ${parsed.standardId}` };

  const slideIdx = lesson.slides.findIndex((s: any) => Number(s.slide) === parsed.slideNum);
  if (slideIdx < 0) return { ok: false, reason: `no slide ${parsed.slideNum} in ${parsed.standardId}` };

  let nextSlides = lesson.slides.slice();
  if (finding.finding_type === "spec.image_style") {
    nextSlides[slideIdx] = fixImageStyle(lesson.slides[slideIdx]);
  } else {
    // Step-level fix
    const steps = (lesson.slides[slideIdx].steps ?? []).slice();
    const stepIdx = steps.findIndex((st: any) => st.sub === parsed.sub);
    if (stepIdx < 0) return { ok: false, reason: `no step ${parsed.sub} in slide ${parsed.slideNum}` };

    let step = steps[stepIdx];
    if (finding.finding_type === "spec.display_parts_drift") step = fixDisplayPartsDrift(step);
    if (finding.finding_type === "spec.animation_ghost_word") step = stripGhostHighlights(step);
    if (finding.finding_type === "spec.long_letter_text") step = fixLongLetterText(step);

    steps[stepIdx] = step;
    nextSlides[slideIdx] = { ...lesson.slides[slideIdx], steps };
  }

  if (DRY) {
    console.log(`  [dry] would patch ${parsed.standardId} slide ${parsed.slideNum}${parsed.sub ?? ""}`);
    return { ok: true, reason: "dry-run" };
  }

  const { error } = await sb
    .from("lessons_db")
    .update({ slides: nextSlides, updated_at: new Date().toISOString() })
    .eq("id", lesson.id);
  if (error) return { ok: false, reason: `db update: ${error.message}` };
  return { ok: true, reason: "patched" };
}

async function closeFinding(findingId: string, note: string) {
  if (DRY) return;
  await sb
    .from("content_audit_findings")
    .update({
      status: "fixed",
      resolved_at: new Date().toISOString(),
      resolved_by: RESOLVER_ID,
      resolver_note: `qc-fix-lesson-spec :: ${note}`,
    })
    .eq("id", findingId);
}

async function main() {
  if (!TYPE || !SUPPORTED.includes(TYPE as any)) {
    console.error(`--type required. Supported: ${SUPPORTED.join(", ")}`);
    process.exit(1);
  }
  console.log(`qc-fix-lesson-spec · type=${TYPE} limit=${LIMIT ?? "all"} dry=${DRY}`);

  let query = sb
    .from("content_audit_findings")
    .select("id, target_id, finding_type")
    .eq("status", "open")
    .eq("target_kind", TYPE === "spec.image_style" ? "lesson_slide" : "lesson_slide")
    .eq("finding_type", TYPE);
  if (LIMIT) query = query.limit(LIMIT);
  const { data: findings, error } = await query;
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  const list = (findings ?? []) as Finding[];
  console.log(`  ${list.length} findings`);

  let ok = 0;
  let bad = 0;
  for (const f of list) {
    const r = await applyFix(f);
    if (r.ok && r.reason !== "dry-run") {
      await closeFinding(f.id, r.reason);
      ok++;
    } else if (r.ok) {
      ok++;
    } else {
      console.warn(`  ✗ ${f.target_id} :: ${r.reason}`);
      bad++;
    }
  }
  console.log(`\nDone. patched=${ok} failed=${bad}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
