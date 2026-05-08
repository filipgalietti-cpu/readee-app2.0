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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_KEY = process.env.GEMINI_API_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY || !GEMINI_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + GEMINI_API_KEY");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const gemini = new GoogleGenAI({ apiKey: GEMINI_KEY });

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : 10;
const standardArg = args.find((a) => a.startsWith("--standard="));
const STANDARD_FILTER = standardArg ? standardArg.split("=")[1] : null;

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

const ENRICHMENT_SYSTEM = `You are a senior K-4 reading specialist enriching a lesson with karaoke-style animation primitives.

You receive:
  REFERENCE_K: a hand-authored Kindergarten lesson that is the quality bar.
  THIN_LESSON: a lesson that has audio + text but no per-step animation.

Your job: rewrite THIN_LESSON's slides[].steps[] arrays so EVERY teaching slide has at least one of:
  - displayParts[]: staggered reveals { text, delay (ms from step start) }
  - highlightPills[]: bounce a pill at delay ms
  - highlightWord: { word, delay }  underline a target word in a passage
  - displayDiagram: { letters: [{text, role}], delay, revealCount }
  - displayTableRow: { label, value, example, exampleDelay, tableHeaders }
  - sfxClaps: [{ delay }]  (use sparingly, celebrations only)
  - afterPhonemes: ["s","short_a"]  (only on phonics-domain lessons RF.x.x)

Rules:
  1. Don't change ttsScript text or audioFile paths — just split steps if needed and add the rich primitives.
  2. K reference is ~3 steps per slide; if a thin slide has 1 step, split it into 2-3.
  3. delay values are integer ms from the start of THAT step's audio. Be conservative (300-2500 ms).
  4. Match THIN_LESSON's grade — 4th-grade lessons should still use richer primitives (displayParts, highlightWord), but skip phoneme tiles (those are K-1 only).
  5. Preserve the lesson's standardId, grade, title, and slide.type values exactly.
  6. Output the FULL enriched lesson JSON — same shape as the input, just with richer steps.

Output ONLY the JSON object, no commentary.`;

const LESSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    standardId: { type: Type.STRING },
    grade: { type: Type.STRING },
    title: { type: Type.STRING },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          slide: { type: Type.NUMBER },
          type: { type: Type.STRING },
          heading: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
          imageFile: { type: Type.STRING },
          mcqId: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT, properties: {} },
          },
        },
      },
    },
  },
  required: ["standardId", "grade", "title", "slides"],
};

async function proposeEnrichment(
  thin: Lesson,
  reference: Lesson,
  ccssDescription: string,
): Promise<{ ok: true; proposed: Lesson } | { ok: false; error: string }> {
  const ccssLine = ccssDescription
    ? `CCSS ${thin.standardId}: ${ccssDescription}\n\n`
    : "";
  const prompt = `${ccssLine}REFERENCE_K (this is the quality bar):
${JSON.stringify(reference, null, 2).slice(0, 12000)}

THIN_LESSON (rewrite this):
${JSON.stringify(thin, null, 2).slice(0, 8000)}

Return the enriched lesson JSON.`;

  try {
    const res = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: ENRICHMENT_SYSTEM,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: LESSON_SCHEMA,
      },
    });
    const txt = (res.text ?? "").trim();
    const parsed = JSON.parse(txt);
    if (!parsed?.slides || !Array.isArray(parsed.slides)) {
      return { ok: false, error: "model returned no slides" };
    }
    return { ok: true, proposed: parsed as Lesson };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "unknown" };
  }
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
    // 4. Write proposal to content_review_queue.
    const proposed = result.proposed;
    const teachingSlides = proposed.slides.filter((s: any) => s.type !== "mcq");
    const stepCount = teachingSlides.reduce(
      (acc: number, s: any) => acc + (s.steps?.length ?? 0),
      0,
    );
    const { error: insertErr } = await sb.from("content_review_queue").insert({
      asset_kind: "lesson_enrichment",
      asset_ref: {
        table: "sample-lessons.json",
        standardId,
        grade: thin.grade,
        kReference: reference.standardId,
      },
      source: "enrichment_v1",
      prompt_version: "k-reference-2026-05-07",
      standard_id: standardId,
      status: "needs_review",
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
    if (insertErr) {
      console.log(`    ! insert: ${insertErr.message}`);
      skipped++;
      continue;
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
    made++;
    console.log(`    ✓ proposal queued (${stepCount} enriched steps)`);
    // Throttle to avoid Gemini rate caps.
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`Done — proposed ${made}, skipped ${skipped}.`);
  console.log(
    `Review at /admin/batch-qc?asset_kind=lesson_enrichment, then merge approved proposals into app/data/sample-lessons.json.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
