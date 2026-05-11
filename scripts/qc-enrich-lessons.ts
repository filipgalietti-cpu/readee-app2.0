/**
 * Lesson enrichment proposer.
 *
 * Closes the loop on `lesson.thin_animation` findings: takes a
 * thin G1-4 lesson and writes an enriched proposal to
 * content_review_queue using a hand-audited K lesson (same domain)
 * as the few-shot reference.
 *
 * Why a proposal queue, not a direct write:
 *   - app/data/sample-lessons.json is checked into git; the cron
 *     can't push commits from Vercel.
 *   - Filip / Jen review and merge the approved proposals into
 *     the JSON during the weekly content cycle.
 *   - Same pattern the factory uses (asset_kind='leveled_passage'
 *     etc.) — extends asset_kind to include 'lesson_enrichment'.
 *
 * Run:
 *   npx tsx scripts/qc-enrich-lessons.ts --dry-run
 *   npx tsx scripts/qc-enrich-lessons.ts --limit=5
 *   npx tsx scripts/qc-enrich-lessons.ts --standard=RL.4.2
 *
 * Cost: ~$0.03 per proposal (Gemini 2.5 Flash). 60 thin lessons ≈
 * $1.80 to enrich the entire G2-4 backlog.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI, Type } from "@google/genai";
import { checkLessonStructure, checkLessonRichness } from "@/lib/ai/qc-lesson";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const QC_TEACHER = process.env.QC_BOT_TEACHER_ID;
if (!SUPABASE_URL || !SERVICE_KEY || !GEMINI_KEY || !QC_TEACHER) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + GEMINI_API_KEY + QC_BOT_TEACHER_ID",
  );
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const gemini = new GoogleGenAI({ apiKey: GEMINI_KEY });

// Lazy-loaded generateSpeech so the script only pulls google-auth-
// library when actually generating audio (and the cost shows up
// only when --skip-audio isn't passed).
let _generateSpeech: any | null = null;
async function getGenerateSpeech(): Promise<any> {
  if (_generateSpeech) return _generateSpeech;
  const mod = await import("@/lib/ai/readee-ai");
  _generateSpeech = mod.generateSpeech;
  return _generateSpeech;
}

/**
 * Per-step audio generator. Mirrors scripts/qc-enrich-audio.ts but
 * runs inline at enrichment time so freshly enriched lessons ship
 * with each sub-step backed by its own unique mp3 (the K reference
 * pattern). Without this, sub-step b/c reuse step a's audioFile and
 * the renderer plays the wrong line. May 8 incident.
 */
async function generateStepAudio(
  standardId: string,
  slideNum: number,
  step: any,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sub = step?.sub ?? "a";
  const text = String(step?.ttsScript ?? "").trim();
  if (!text) return { ok: false, error: "no ttsScript" };
  const targetPath = `lessons/${standardId}/S${slideNum}${sub}.mp3`;
  const generateSpeech = await getGenerateSpeech();
  const tts = await generateSpeech({ teacherId: QC_TEACHER!, text });
  if (!tts.ok) return { ok: false, error: `generateSpeech: ${tts.error}` };
  const fetched = await fetch(tts.audioUrl);
  if (!fetched.ok) return { ok: false, error: `fetch: HTTP ${fetched.status}` };
  const buf = Buffer.from(await fetched.arrayBuffer());
  const { error: upErr } = await sb.storage
    .from("audio")
    .upload(targetPath, buf, { contentType: "audio/mpeg", upsert: true });
  if (upErr) return { ok: false, error: `upload: ${upErr.message}` };
  step.audioFile = `audio/${targetPath}`;
  step.audioRegenAt = new Date().toISOString();
  return { ok: true };
}

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : 10;
const standardArg = args.find((a) => a.startsWith("--standard="));
const STANDARD_FILTER = standardArg ? standardArg.split("=")[1] : null;
// Skip the inline audio generation (used during testing of the prompt
// changes when audio cost would be wasted). Default is to generate.
const SKIP_AUDIO = args.includes("--skip-audio");
// Same-batch audit. After each lesson writes to lessons_db, re-run
// the structural + richness checks against the freshly-written row.
// If any severity='fail' finding emerges, halt the batch so a new
// bug class can't propagate through 20 lessons before someone
// spot-checks. Override with --continue-on-audit-fail when you've
// already triaged a known issue and want throughput. May 8 incident
// would've been caught after lesson 1 with this gate.
const CONTINUE_ON_FAIL = args.includes("--continue-on-audit-fail");

const LESSONS_PATH = path.join(
  process.cwd(),
  "app",
  "data",
  "sample-lessons.json",
);

type Lesson = {
  standardId: string;
  grade: string;
  domain?: string;
  title: string;
  slides: any[];
};

async function loadLessons(): Promise<Lesson[]> {
  const raw = await fs.readFile(LESSONS_PATH, "utf-8");
  return JSON.parse(raw) as Lesson[];
}

let standardsDescCache: Map<string, string> | null = null;
async function loadStandardDescriptions(): Promise<Map<string, string>> {
  if (standardsDescCache) return standardsDescCache;
  const files = [
    "kindergarten-standards-questions.json",
    "1st-grade-standards-questions.json",
    "2nd-grade-standards-questions.json",
    "3rd-grade-standards-questions.json",
    "4th-grade-standards-questions.json",
  ];
  const map = new Map<string, string>();
  for (const f of files) {
    try {
      const raw = await fs.readFile(
        path.join(process.cwd(), "app", "data", f),
        "utf-8",
      );
      const data = JSON.parse(raw) as { standards?: Array<{ standard_id?: string; standard_description?: string }> };
      for (const s of data.standards ?? []) {
        if (s.standard_id && s.standard_description) {
          map.set(s.standard_id, s.standard_description);
        }
      }
    } catch {
      // Skip missing files (e.g., during local dev with stripped data)
    }
  }
  standardsDescCache = map;
  return map;
}

function lookupStandardDescription(standardId: string, _lessons: Lesson[]): string {
  // _lessons param kept for symmetry with future passage-based lookups.
  return standardsDescCache?.get(standardId) ?? "";
}

/**
 * Pick a K lesson in the same domain (RL/RI/RF/L) as the thin
 * lesson — same skill family means the timing patterns transfer.
 * If no domain-match exists, fall back to any K lesson.
 */
function pickKReference(thin: Lesson, all: Lesson[]): Lesson | null {
  const domainPrefix = thin.standardId.split(".")[0]; // "RL", "RI", etc.
  const sameDomain = all.filter(
    (l) =>
      l.grade === "Kindergarten" && l.standardId.startsWith(domainPrefix + "."),
  );
  if (sameDomain.length > 0) {
    // Prefer one with rich primitives — sort by step count desc.
    return sameDomain.sort(
      (a, b) =>
        (b.slides ?? []).reduce(
          (acc, s) => acc + (s.steps?.length ?? 0),
          0,
        ) -
        (a.slides ?? []).reduce(
          (acc, s) => acc + (s.steps?.length ?? 0),
          0,
        ),
    )[0];
  }
  return all.find((l) => l.grade === "Kindergarten") ?? null;
}

const SLIDE_ENRICHMENT_SYSTEM = `You are a senior K-4 reading specialist enriching ONE slide of a lesson with karaoke-style animation primitives.

You receive:
  LESSON_CONTEXT: the lesson's standard, grade, title, and CCSS description.
  REFERENCE_K_SLIDE: a hand-authored Kindergarten slide that is the quality bar.
  THIN_SLIDE: the slide to rewrite — has audio + text but no per-step animation.

CRITICAL: Match the EXACT renderer schema below. The renderer ignores
unknown fields silently — content that "looks rich" but uses wrong
field names won't render at all. Copy the shapes verbatim.

────────── Step-level primitives (pick what fits, you don't need all) ──────────

displayParts: Array<{ text: string, delay: number }>
  Staggered text reveals. Each part appears at delay ms from step start.
  Example:
    "displayParts": [
      { "text": "A noun names a ", "delay": 0 },
      { "text": "person", "delay": 1000 },
      { "text": ", place", "delay": 2000 },
      { "text": ", or thing.", "delay": 3000 }
    ]

highlightPills: Array<{ pill: number, delay: number }>
  ⚠ pill is an INTEGER INDEX into displayParts on this same step. Use only
  when the step has displayParts; the index points at which part to bounce.
  Example (pair with the displayParts above):
    "displayPills": [],
    "highlightPills": [
      { "pill": 1, "delay": 1000 },   // bounces "person"
      { "pill": 2, "delay": 2000 },   // bounces ", place"
      { "pill": 3, "delay": 3000 }    // bounces ", or thing."
    ]

highlightWord: { word: string, delay: number }
  ⚠ SINGLE OBJECT (not an array). Underlines one word in a visible passage.
  Use for the "anchor" vocabulary word in this step's ttsScript.
  Example:
    "highlightWord": { "word": "noun", "delay": 300 }

displayDiagram: { letters: Array<{ text: string, role?: "start"|"end" }>, delay: number, revealCount?: number }
  Letter-tile row. Use ONLY for K-1 phonics lessons.
  Example: "displayDiagram": { "letters": [{"text":"c"},{"text":"a"},{"text":"t"}], "delay": 500 }

displayTableRow: { label: string, value: string, example?: string, exampleDelay?: number, tableHeaders?: string[] }
  Table row. Use for compare/contrast lessons. tableHeaders only on the first row.

sfxClaps: Array<{ delay: number }>
  Clap sound effects. Use SPARINGLY — celebration moments only, not every step.

afterPhonemes: Array<string>
  Phoneme audio queue. Use ONLY for RF.K.x and RF.1.x phonics lessons.

────────── Rules ──────────

  1. Don't change ttsScript text or audioFile paths.
  2. K-bar is ~3 steps per slide; if THIN_SLIDE has 1 step, split into 2-3.
  3. delay values are integer ms from step audio start. Conservative 300-2500ms.
  4. ALL grades (K-4) get displayParts + highlightWord + sfxClaps. Only K-1 get displayDiagram and afterPhonemes.
  5. highlightPills.pill MUST be an integer index into THIS step's displayParts. If the step has no displayParts, omit highlightPills.
  6. highlightWord is a SINGLE object, never an array.
  7. Preserve slide.slide, slide.type, slide.heading, slide.imagePrompt, slide.imageFile EXACTLY.
  8. Output the FULL enriched slide JSON.

Output ONLY the JSON object, no commentary.`;

// Intentionally NO responseSchema — the schema's `properties: {}` on
// the steps array constrained Gemini to emit empty step objects (the
// catastrophic "RI.1.10 had [{},{},{}]" bug on May 7). responseMimeType
// + the prompt instructions handle JSON shape just fine without
// over-constraining the step structure.

/**
 * Pick a K reference slide that pairs with the thin slide we're
 * enriching. Strategy: same slide.type if available (intro→intro,
 * teach→teach, etc); otherwise position-matched (slide N of K
 * lesson aligns with slide N of thin lesson); otherwise the first
 * teaching slide. Returns null only if the K lesson has no
 * teaching slides at all.
 */
function pickKSlideReference(
  thinSlide: any,
  kLesson: Lesson,
): any | null {
  const kSlides = (kLesson.slides ?? []).filter(
    (s: any) => s?.type !== "mcq" && Array.isArray(s?.steps) && s.steps.length > 0,
  );
  if (kSlides.length === 0) return null;
  const sameType = kSlides.find((s: any) => s.type === thinSlide?.type);
  if (sameType) return sameType;
  const positional = kSlides.find((s: any) => s.slide === thinSlide?.slide);
  if (positional) return positional;
  return kSlides[0];
}

/**
 * Enrich one slide. Cheap (~3-5k output tokens) and always fits.
 * Caller loops over all teaching slides; mcq slides pass through.
 */
async function enrichSlide(input: {
  thinSlide: any;
  kSlide: any;
  lessonContext: {
    standardId: string;
    grade: string;
    title: string;
    ccssDescription: string;
  };
}): Promise<{ ok: true; enrichedSlide: any } | { ok: false; error: string }> {
  const ctxLines = [
    `Standard: ${input.lessonContext.standardId}`,
    `Grade: ${input.lessonContext.grade}`,
    `Lesson title: ${input.lessonContext.title}`,
  ];
  if (input.lessonContext.ccssDescription) {
    ctxLines.push(`CCSS: ${input.lessonContext.ccssDescription}`);
  }

  const prompt = `LESSON_CONTEXT:
${ctxLines.join("\n")}

REFERENCE_K_SLIDE (quality bar):
${JSON.stringify(input.kSlide, null, 2)}

THIN_SLIDE (rewrite this):
${JSON.stringify(input.thinSlide, null, 2)}

Return the enriched slide JSON.`;

  try {
    const res = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SLIDE_ENRICHMENT_SYSTEM,
        temperature: 0.4,
        // No responseSchema. The prompt + responseMimeType produce
        // valid JSON with the right keys (model has the K example
        // to copy from). Schema-constrained mode emitted empty step
        // objects — bug retired in favor of free-form JSON.
        responseMimeType: "application/json",
        maxOutputTokens: 16000,
      },
    });
    const txt = (res.text ?? "").trim();
    if (!txt) return { ok: false, error: "empty response" };
    let parsed: any;
    try {
      parsed = JSON.parse(txt);
    } catch (parseErr: any) {
      return {
        ok: false,
        error: `slide JSON parse failed (${txt.length} chars): ${parseErr.message}`,
      };
    }
    if (!parsed?.steps || !Array.isArray(parsed.steps)) {
      return { ok: false, error: "model returned no steps" };
    }
    // Quality gates — any of these = reject before DB write.
    // History: empty steps shipped May 7 (schema bug) AND wrong-
    // shaped highlightPills/highlightWord were emitted by Gemini
    // even after the schema fix (e.g. highlightPills with `text`
    // instead of `pill: number`). Both ship structurally valid
    // JSON that the renderer silently drops.
    for (const [i, st] of parsed.steps.entries()) {
      if (!st || typeof st !== "object") {
        return { ok: false, error: `step ${i} is not an object` };
      }
      const hasContent =
        (typeof st.ttsScript === "string" && st.ttsScript.trim().length > 0) ||
        (typeof st.displayText === "string" && st.displayText.trim().length > 0) ||
        (typeof st.audioFile === "string" && st.audioFile.trim().length > 0);
      if (!hasContent) {
        return {
          ok: false,
          error: `step ${i} has no ttsScript / displayText / audioFile — empty object`,
        };
      }
      // highlightWord MUST be a single object, never an array.
      if (Array.isArray(st.highlightWord)) {
        return {
          ok: false,
          error: `step ${i}.highlightWord is an array; renderer expects { word, delay }`,
        };
      }
      if (
        st.highlightWord &&
        (typeof st.highlightWord !== "object" ||
          typeof (st.highlightWord as any).word !== "string")
      ) {
        return {
          ok: false,
          error: `step ${i}.highlightWord shape wrong; needs { word: string, delay: number }`,
        };
      }
      // highlightPills entries must reference {pill: number} indices
      // into displayParts, NOT {text: string}. The renderer reads
      // .pill and ignores anything else.
      if (Array.isArray(st.highlightPills)) {
        for (const [j, hp] of st.highlightPills.entries()) {
          if (
            !hp ||
            typeof (hp as any).pill !== "number" ||
            typeof (hp as any).delay !== "number"
          ) {
            return {
              ok: false,
              error: `step ${i}.highlightPills[${j}] shape wrong; needs { pill: number, delay: number }`,
            };
          }
        }
        // highlightPills requires displayParts to index into.
        if (!Array.isArray(st.displayParts) || st.displayParts.length === 0) {
          return {
            ok: false,
            error: `step ${i}.highlightPills present but no displayParts to index into`,
          };
        }
        // Pill indices must be in range.
        for (const hp of st.highlightPills) {
          if (
            (hp as any).pill < 0 ||
            (hp as any).pill >= st.displayParts.length
          ) {
            return {
              ok: false,
              error: `step ${i}.highlightPills index out of range`,
            };
          }
        }
      }
    }
    return { ok: true, enrichedSlide: parsed };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "unknown" };
  }
}

/**
 * Enrich a thin lesson slide-by-slide. Each slide is one Gemini
 * call; output stays small + reliable. MCQ slides pass through
 * unchanged. Returns the assembled lesson.
 */
async function proposeEnrichment(
  thin: Lesson,
  reference: Lesson,
  ccssDescription: string,
): Promise<{ ok: true; proposed: Lesson } | { ok: false; error: string }> {
  const lessonContext = {
    standardId: thin.standardId,
    grade: thin.grade,
    title: thin.title,
    ccssDescription,
  };
  const enrichedSlides: any[] = [];
  let enrichedCount = 0;
  let mcqCount = 0;
  for (const slide of thin.slides ?? []) {
    if (slide?.type === "mcq") {
      enrichedSlides.push(slide);
      mcqCount++;
      continue;
    }
    const kSlide = pickKSlideReference(slide, reference);
    if (!kSlide) {
      // No K reference — keep the thin slide as-is rather than
      // dropping it. Better to under-enrich than to lose content.
      enrichedSlides.push(slide);
      continue;
    }
    const r = await enrichSlide({ thinSlide: slide, kSlide, lessonContext });
    if (!r.ok) {
      // Log every gate rejection so the bot's audit trail records
      // exactly which classes of malformed output Gemini is producing.
      // Future prompt iterations can mine these to harden the system
      // prompt — every rejection is a signal that the AI's training
      // priors don't match our renderer contract.
      await sb.from("content_qc_log").insert({
        target_kind: "lesson_slide",
        target_id: `${thin.standardId}#slide${slide?.slide ?? "?"}`,
        change_type: "enrich_gate_rejected",
        before: null,
        after: null,
        reason: r.error,
        agent: "qc-bot/enrich-lessons",
      });
      return { ok: false, error: `slide ${slide?.slide}: ${r.error}` };
    }
    const enriched = r.enrichedSlide;

    // Per-step audio. The enricher splits a single audio-backed step
    // into 2-3 sub-steps for K-style staggered reveals — every sub-
    // step needs its OWN mp3 because each ttsScript is now a
    // truncated portion of the original. Generated inline so the row
    // ships ready-to-render. May 8 incident: the script previously
    // reused the original audioFile across all sub-steps, so playing
    // sub-step b/c restarted the full pre-split audio while only
    // animating the truncated displayParts.
    const slideNum = typeof slide?.slide === "number" ? slide.slide : enrichedCount + 1;
    const steps = Array.isArray(enriched?.steps) ? enriched.steps : [];
    if (!SKIP_AUDIO && !DRY && steps.length >= 2) {
      let audioOk = 0;
      let audioErr = 0;
      for (const st of steps) {
        const audio = await generateStepAudio(thin.standardId, slideNum, st);
        if (audio.ok) audioOk++;
        else {
          audioErr++;
          console.log(`        ! step S${slideNum}${st?.sub} audio: ${audio.error}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      console.log(`      → step audio: ${audioOk} ok, ${audioErr} err`);
    }

    enrichedSlides.push(enriched);
    enrichedCount++;
    // Throttle between slide calls so we don't hit Gemini rate caps.
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  const proposed: Lesson = {
    standardId: thin.standardId,
    grade: thin.grade,
    domain: thin.domain ?? "",
    title: thin.title,
    slides: enrichedSlides,
  };
  console.log(
    `      → ${enrichedCount} teaching slides enriched, ${mcqCount} MCQs preserved`,
  );
  return { ok: true, proposed };
}

async function main() {
  console.log(`Lesson enrichment proposer ${DRY ? "(DRY RUN)" : ""}`);
  console.log(`Limit: ${LIMIT}`);

  // 1. Pull open lesson.thin_animation findings.
  let q = sb
    .from("content_audit_findings")
    .select("id, target_id, target_kind, message, target_snapshot, severity")
    .eq("finding_type", "lesson.thin_animation")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(LIMIT);
  if (STANDARD_FILTER) q = q.eq("target_id", STANDARD_FILTER);

  const { data: findings, error } = await q;
  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }
  if (!findings || findings.length === 0) {
    console.log("No thin-animation findings open. Nothing to enrich.");
    return;
  }
  console.log(`Found ${findings.length} thin lesson(s).`);

  // 2. Skip ones we've already proposed (idempotent).
  const targetIds = findings.map((f: any) => f.target_id);
  const { data: existing } = await sb
    .from("content_review_queue")
    .select("asset_ref")
    .eq("asset_kind", "lesson_enrichment")
    .in("status", ["needs_review", "ready"]);
  const alreadyProposed = new Set<string>();
  for (const r of (existing ?? []) as any[]) {
    const ref = r.asset_ref;
    if (ref?.standardId) alreadyProposed.add(ref.standardId as string);
  }
  const todo = findings.filter((f: any) => !alreadyProposed.has(f.target_id));
  if (todo.length === 0) {
    console.log("All thin lessons already have proposals queued.");
    return;
  }
  console.log(`After dedupe: ${todo.length} new proposal(s) to make.`);

  // 3. For each: load existing JSON, find K reference, run AI enrichment.
  const lessons = await loadLessons();
  const lessonsByStd = new Map(lessons.map((l) => [l.standardId, l]));
  // Warm the standards-description cache so each enrichment call
  // includes the CCSS spec text in its prompt.
  await loadStandardDescriptions();

  let made = 0;
  let skipped = 0;
  for (const f of todo) {
    const standardId = (f as any).target_id as string;
    const thin = lessonsByStd.get(standardId);
    if (!thin) {
      console.log(`  [${standardId}] skip — not in JSON`);
      skipped++;
      continue;
    }
    const reference = pickKReference(thin, lessons);
    if (!reference) {
      console.log(`  [${standardId}] skip — no K reference available`);
      skipped++;
      continue;
    }
    console.log(`  [${standardId}] enriching, K ref=${reference.standardId}`);
    if (DRY) {
      made++;
      continue;
    }
    // Pull the standard's CCSS description so the AI sees both the
    // K bar and the spec it's writing to. lookupStandardDescription
    // walks the same JSONs the curriculum reads from.
    const ccssDesc = lookupStandardDescription(thin.standardId, lessons);
    const result = await proposeEnrichment(thin, reference, ccssDesc);
    if (!result.ok) {
      console.log(`    ! ${result.error}`);
      skipped++;
      continue;
    }
    const proposed = result.proposed;
    const teachingSlides = proposed.slides.filter((s: any) => s.type !== "mcq");
    const stepCount = teachingSlides.reduce(
      (acc: number, s: any) => acc + (s.steps?.length ?? 0),
      0,
    );

    // ── 4a. PRIMARY write: lessons_db with source='ai_enrich'. This
    //         is the autonomy unlock — the renderer (once flipped to
    //         DB) picks up the new version automatically. Stamps
    //         lineage_id, version+1, qc_status='warn' until the
    //         self-verify step promotes it to 'pass'.
    const gradeShort: Record<string, string> = {
      Kindergarten: "K", "1st Grade": "1", "2nd Grade": "2",
      "3rd Grade": "3", "4th Grade": "4",
    };
    const { data: existing } = await sb
      .from("lessons_db")
      .select("id, version")
      .eq("standard_id", standardId)
      .eq("language", "en")
      .maybeSingle();
    const { error: dbErr } = await sb.from("lessons_db").upsert(
      {
        standard_id: standardId,
        grade: gradeShort[thin.grade] ?? thin.grade,
        title: proposed.title ?? thin.title,
        slides: proposed.slides,
        qc_status: "warn",
        source: "ai_enrich",
        language: "en",
        lineage_id: existing?.id ?? null,
        version: existing ? (existing as any).version + 1 : 1,
      },
      { onConflict: "standard_id,language" },
    );
    if (dbErr) {
      console.log(`    ! lessons_db upsert: ${dbErr.message}`);
      skipped++;
      continue;
    }

    // ── 4a.5. POST-WRITE AUDIT GATE. Run the same structural +
    //         richness checks the nightly audit uses, against the
    //         row we just wrote. If any severity='fail' emerges, the
    //         enricher just shipped a new bug class — halt the batch
    //         so it can't propagate through every remaining lesson.
    //         (The May 7 empty-step and May 8 step_audio_mismatch
    //         incidents both got past write-time gates; this is the
    //         loop that would have caught them after lesson 1.)
    const structural = checkLessonStructure({ standardId, lesson: proposed });
    const richness = checkLessonRichness({ standardId, lesson: proposed });
    const failing = [...structural, ...richness].filter(
      (x) => x.severity === "fail",
    );
    if (failing.length > 0) {
      console.log(
        `    ✗ POST-WRITE AUDIT FAILED — ${failing.length} fail finding(s):`,
      );
      for (const v of failing) console.log(`        • ${v.type}: ${v.message}`);
      // Persist each as a real finding so the dashboard surfaces
      // them and the regen pipeline can pick them up. Loop-closure
      // is SKIPPED — the thin_animation finding stays open until
      // the bug class is fixed.
      for (const v of failing) {
        await sb.from("content_audit_findings").insert({
          finding_type: v.type,
          severity: v.severity,
          status: "open",
          target_kind: "lesson",
          target_id: standardId,
          message: v.message,
          target_snapshot: { source: "enrich-post-write-audit" },
        });
      }
      await sb.from("content_qc_log").insert({
        target_kind: "lesson",
        target_id: standardId,
        change_type: "post_write_audit_failed",
        before: null,
        after: { failing_types: failing.map((v) => v.type) },
        reason:
          "Enricher wrote a lesson that fails post-write audit. Batch halted to prevent propagation.",
        finding_id: (f as any).id,
        agent: "qc-bot/enrich-lessons",
      });
      skipped++;
      if (!CONTINUE_ON_FAIL) {
        console.log(
          `\n  HALTING BATCH — ${failing.length} fail finding(s) on ${standardId}. ` +
            `Triage the bug class, then re-run (or pass --continue-on-audit-fail to override).`,
        );
        break;
      }
      // CONTINUE_ON_FAIL: don't close thin_animation, don't make++,
      // but keep iterating. Useful when triaging a known issue.
      continue;
    }

    // ── 4b. SECONDARY: content_review_queue entry for visibility on
    //         /owner/batch-qc. Status='ready' (auto-promoted) since
    //         the canonical DB write already happened — this row is
    //         the audit trail, not the gate.
    const { error: queueErr } = await sb.from("content_review_queue").insert({
      asset_kind: "lesson_enrichment",
      asset_ref: {
        table: "lessons_db",
        standardId,
        grade: thin.grade,
        kReference: reference.standardId,
      },
      source: "enrichment_v1",
      prompt_version: "k-reference-2026-05-07",
      standard_id: standardId,
      status: "ready",
      qc_overall: "warn",
      qc_report: {
        finding_id: (f as any).id,
        thin_slide_count: teachingSlides.length,
        proposed_step_count: stepCount,
        before: thin,
        after: proposed,
      },
      title: thin.title,
    });
    if (queueErr) {
      console.log(`    (warn) review_queue insert: ${queueErr.message}`);
    }

    // Log to content_qc_log so /owner/qc-bot timeline shows it.
    await sb.from("content_qc_log").insert({
      target_kind: "lesson",
      target_id: standardId,
      change_type: "lesson_enrichment_proposed",
      before: { stepCount: thin.slides.reduce((a, s: any) => a + (s.steps?.length ?? 0), 0) },
      after: { stepCount },
      reason: "lesson.thin_animation",
      finding_id: (f as any).id,
      agent: "qc-bot/enrich-lessons",
    });

    // Loop closure: mark the lesson.thin_animation finding fixed
    // so /owner/qc-bot's "Open by finding type" panel reflects
    // reality. Without this, the dashboard says "174 thin lessons"
    // forever even after the bot has enriched them.
    await sb
      .from("content_audit_findings")
      .update({
        status: "fixed",
        resolved_at: new Date().toISOString(),
        resolver_note: `Auto-closed by qc-bot/enrich-lessons: lessons_db version ${(existing?.version ?? 0) + 1} written with ${stepCount} enriched steps.`,
      })
      .eq("id", (f as any).id);

    made++;
    console.log(`    ✓ wrote lessons_db version ${(existing?.version ?? 0) + 1} (${stepCount} steps)`);
    // Throttle to avoid Gemini rate caps.
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`Done — wrote ${made}, skipped ${skipped}.`);
  console.log(
    `View enriched lessons at /owner/qc-bot (DB content tile). Source='ai_enrich' rows are the AI-generated versions.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
