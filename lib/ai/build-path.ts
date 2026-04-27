/**
 * Personalized learning path orchestrator.
 *
 * Takes a child's placement-assessment result + the catalog of
 * available lessons, and asks the AI to write a sequenced path of
 * 10-20 items that addresses the child's specific weaknesses while
 * building up to grade-level mastery.
 *
 * Output items:
 *   { position, kind: "lesson" | "practice", standard_id,
 *     lesson_id (kind=lesson), title, reason }
 *
 * The AI sees the full lesson catalog AND a grouped weakness summary
 * derived from the assessment's per-question answers. We then run a
 * deterministic post-process to:
 *   1) ensure every item references an existing lesson/standard
 *   2) enforce a foundational-before-comprehension dependency rule
 *   3) cap at 20 items
 *
 * Cost: 1 quiz_generation credit per build (one Gemini call). Free
 * for v1 — we eat the cost rather than charge against teacher budget,
 * since this is core product not on-demand authoring.
 */

import { Type } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getClient,
  logUsage,
  MODEL_ID,
} from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";
import lessons from "@/app/data/sample-lessons.json";

type LessonRef = {
  standardId: string;
  grade: string;
  domain: string;
  title: string;
  slides: any[];
};

const LESSONS = lessons as LessonRef[];
const LESSON_BY_STANDARD = new Map<string, LessonRef>(
  LESSONS.map((l) => [l.standardId, l]),
);

// Domains broken into a "foundations first" ordering. The post-process
// uses this to make sure the AI doesn't recommend higher-order
// comprehension lessons before a struggling reader has nailed
// foundational decoding.
const DOMAIN_TIER: Record<string, number> = {
  "Reading Foundational Skills": 1,
  "Language": 2,
  "Reading Informational": 3,
  "Reading Literature": 3,
};

export type PathItem = {
  position: number;
  kind: "lesson" | "practice";
  standard_id: string;
  lesson_id?: string;
  title: string;
  reason: string;
};

export type WeakStrand = {
  standardId: string;
  domain: string;
  attempted: number;
  correct: number;
  accuracy: number;
};

const PATH_SYSTEM = `You are a senior K-4 reading specialist. You design personalized learning paths for individual students based on their placement test results.

You will receive:
- The child's tested grade and placement reading level.
- A breakdown of their WEAK standards (from the placement test) — standards where they got fewer than half right.
- The full catalog of available lessons keyed by CCSS standard.

Output: a JSON path of 10-18 items. Each item is either:
- A LESSON (kind: "lesson") that teaches a specific standard, OR
- A PRACTICE block (kind: "practice") that drills questions for a specific standard.

Rules:
1. Foundational standards (Reading Foundational Skills like RF.K.1, RF.K.2, RF.K.3, RF.1.x.x) come BEFORE higher-order comprehension standards (RL.x, RI.x). A struggling reader can't comprehend if decoding is shaky.
2. Address the child's WEAKEST standards first (lower accuracy = earlier in the path).
3. Mix lessons and practice — about 60% lessons (concept-building), 40% practice (consolidation). After a lesson on standard X, often follow with a practice block on the same standard.
4. Stay within the child's reading level. Don't recommend 3rd-grade lessons to a kindergartener placed at K-easy. You can stretch slightly above — by ONE level — for the final 2-3 items as a growth target.
5. Each item needs a "reason" — a single sentence in plain language ("Maya struggled with letter sounds, so we start with the alphabet.") that the teacher / parent can read. Speak about the child by name if a name is provided, otherwise say "this reader."
6. Only reference standards that exist in the catalog. Don't invent.
7. Path length: 10-18 items. Shorter is better than longer if the data doesn't support more.`;

const PATH_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          kind: { type: Type.STRING, enum: ["lesson", "practice"] },
          standard_id: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["kind", "standard_id", "reason"],
      },
    },
  },
  required: ["items"],
};

export type BuildPathInput = {
  childId: string;
  childFirstName: string | null;
  gradeTested: string;
  readingLevelPlaced: string | null;
  weakStrands: WeakStrand[];
  /** The placement test row id this path was built from. */
  assessmentId: string | null;
};

export async function buildLearningPath(
  input: BuildPathInput,
): Promise<
  { ok: true; itemCount: number } | { ok: false; error: string }
> {
  const admin = supabaseAdmin();

  // Catalog the AI can choose from. Compress to id + grade + title +
  // tier so the prompt stays small (~12KB).
  const catalog = LESSONS.map((l) => ({
    standard_id: l.standardId,
    grade: l.grade,
    domain: l.domain,
    title: l.title,
    tier: DOMAIN_TIER[l.domain] ?? 9,
  }));

  const userPrompt = `Child: ${input.childFirstName ?? "this reader"}
Grade tested: ${input.gradeTested}
Placement level: ${input.readingLevelPlaced ?? "unspecified"}

Weak standards (sorted lowest accuracy first):
${
  input.weakStrands.length === 0
    ? "(no specific weaknesses surfaced — build a foundational on-grade path)"
    : input.weakStrands
        .map(
          (w) =>
            `- ${w.standardId} (${w.domain}): ${w.correct}/${w.attempted} = ${w.accuracy}%`,
        )
        .join("\n")
}

Available lesson catalog (standards we have lessons for):
${catalog.map((c) => `- ${c.standard_id} (${c.grade}, ${c.domain}): ${c.title}`).join("\n")}

Generate the personalized path now.`;

  let raw: { items: { kind: string; standard_id: string; reason: string }[] };
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: PATH_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: PATH_SCHEMA,
        temperature: 0.4,
      },
    });
    raw = JSON.parse(response.text || "{}");

    await logUsage({
      teacherId: input.childId, // log against the child for now — not a teacher cost
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `learning_path: ${input.gradeTested} ${input.childFirstName ?? ""}`.slice(
        0,
        200,
      ),
    });
  } catch (e: any) {
    trackError(e, { route: "build-path.generate", userId: input.childId });
    return { ok: false, error: e.message ?? "Path generation failed." };
  }

  // Deterministic post-process:
  //  1) Drop items referencing standards not in the catalog (or where
  //     no lesson exists for kind=lesson).
  //  2) Enforce foundational-tier before higher-tier (stable sort by
  //     tier first, then preserve AI's intra-tier order).
  //  3) Cap at 20.
  const items: PathItem[] = [];
  let pos = 1;
  for (const r of raw.items ?? []) {
    if (!r.standard_id || !["lesson", "practice"].includes(r.kind)) continue;
    const lesson = LESSON_BY_STANDARD.get(r.standard_id);
    if (r.kind === "lesson" && !lesson) continue;
    // For "practice", we accept any standard_id (practice questions
    // exist beyond the lesson catalog).
    items.push({
      position: pos++,
      kind: r.kind as "lesson" | "practice",
      standard_id: r.standard_id,
      lesson_id: r.kind === "lesson" ? r.standard_id : undefined,
      title: lesson?.title ?? r.standard_id,
      reason: r.reason ?? "",
    });
    if (items.length >= 20) break;
  }

  // Stable tier sort
  items.sort((a, b) => {
    const ta = DOMAIN_TIER[LESSON_BY_STANDARD.get(a.standard_id)?.domain ?? ""] ?? 9;
    const tb = DOMAIN_TIER[LESSON_BY_STANDARD.get(b.standard_id)?.domain ?? ""] ?? 9;
    if (ta !== tb) return ta - tb;
    return a.position - b.position;
  });
  // Renumber after sort
  items.forEach((it, i) => {
    it.position = i + 1;
  });

  if (items.length === 0) {
    return { ok: false, error: "AI returned no usable items." };
  }

  // Persist (upsert — one path per child).
  const { error } = await admin
    .from("learning_paths")
    .upsert(
      {
        child_id: input.childId,
        source_assessment_id: input.assessmentId,
        grade_level: input.gradeTested,
        reading_level: input.readingLevelPlaced ?? null,
        items,
        next_index: 0,
        qc_overall: "pass",
        qc_report: null,
      },
      { onConflict: "child_id" },
    );

  if (error) {
    return { ok: false, error: `Persist failed: ${error.message}` };
  }

  return { ok: true, itemCount: items.length };
}
