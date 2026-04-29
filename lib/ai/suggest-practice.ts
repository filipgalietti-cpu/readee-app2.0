/**
 * Match a running-record focus area to existing Readee lessons.
 *
 * The running record returns a freeform focus_area string like
 * "r-controlled vowels" or "vowel digraphs ea/ee". We hand that plus
 * a compact list of catalog lesson standardIds + titles to Gemini
 * and ask which 1-3 are most useful for this student. Returns the
 * top picks with one-line rationales.
 *
 * Smaller than full quiz generation: 1 cheap text call (~1 credit).
 */

import { GoogleGenAI, Type } from "@google/genai";
import { logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import sampleLessons from "@/app/data/sample-lessons.json";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

type LessonMeta = {
  standardId: string;
  title: string;
  grade: string;
  domain: string;
};

const catalog: LessonMeta[] = (sampleLessons as any[])
  .filter((l) => l && l.standardId && l.title)
  .map((l) => ({
    standardId: l.standardId,
    title: l.title,
    grade: l.grade ?? "",
    domain: l.domain ?? "",
  }));

/** Map childGrade ("K", "1st", "2nd", ...) to the catalog's grade name. */
function gradeKey(g: string | null | undefined): string | null {
  if (!g) return null;
  const map: Record<string, string> = {
    K: "Kindergarten",
    "1st": "1st Grade",
    "2nd": "2nd Grade",
    "3rd": "3rd Grade",
    "4th": "4th Grade",
  };
  return map[g] ?? null;
}

const SYSTEM = `You match a teacher-flagged reading focus area to existing K-4 reading lessons in a curriculum catalog.

Given a focus area (e.g., "r-controlled vowels", "context clues", "vowel digraphs ea/ee"), pick the 1-3 catalog lessons that would best help a student practice that skill.

Rules:
- Prefer lessons in the student's grade band. Going one grade below for remediation is OK; one grade above for stretch is OK.
- Skip lessons that are not topically relevant.
- Return between 1 and 3 lessons. Never invent standard IDs that aren't in the catalog.
- For each pick, write a single short sentence saying why it targets the focus area, written for the teacher, not the kid.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          standard_id: { type: Type.STRING },
          why: { type: Type.STRING },
        },
        required: ["standard_id", "why"],
      },
    },
  },
  required: ["suggestions"],
};

export type PracticeSuggestion = {
  standardId: string;
  title: string;
  grade: string;
  domain: string;
  why: string;
};

export async function suggestPracticeForFocus(input: {
  teacherId: string;
  focusArea: string;
  studentGrade: string | null;
}): Promise<
  { ok: true; suggestions: PracticeSuggestion[] } | { ok: false; error: string }
> {
  const focus = input.focusArea.trim();
  if (!focus) return { ok: false, error: "Focus area is empty." };

  // Narrow the catalog to a sensible band: student grade ± 1, or
  // everything if we couldn't infer the grade. Keeps the model prompt
  // small and the recommendations age-appropriate.
  const targetGrade = gradeKey(input.studentGrade);
  const gradeOrder = ["Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade"];
  const idx = targetGrade ? gradeOrder.indexOf(targetGrade) : -1;
  const allowed =
    idx === -1
      ? gradeOrder
      : gradeOrder.slice(Math.max(0, idx - 1), Math.min(gradeOrder.length, idx + 2));
  const filtered = catalog.filter((l) => allowed.includes(l.grade));

  // Compact catalog listing keeps the prompt cheap.
  const compactCatalog = filtered
    .map((l) => `- ${l.standardId} (${l.grade}, ${l.domain}): ${l.title}`)
    .join("\n");

  const userPrompt = [
    `Student grade: ${input.studentGrade ?? "unknown"}`,
    `Focus area: ${focus}`,
    "",
    "Catalog (one per line):",
    compactCatalog,
    "",
    "Pick 1-3 standard_ids that best target the focus area. Use only IDs from the catalog above.",
  ].join("\n");

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA as any,
        temperature: 0.2,
      },
    });
    const text = (response.text ?? "").trim();
    if (!text) throw new Error("Empty model response.");
    const parsed = JSON.parse(text) as {
      suggestions?: { standard_id?: string; why?: string }[];
    };

    const seen = new Set<string>();
    const suggestions: PracticeSuggestion[] = [];
    for (const s of parsed.suggestions ?? []) {
      const id = String(s?.standard_id ?? "").trim();
      if (!id || seen.has(id)) continue;
      const meta = catalog.find((l) => l.standardId === id);
      if (!meta) continue; // hallucinated
      seen.add(id);
      suggestions.push({
        ...meta,
        why: String(s.why ?? "").trim() || "Targets this focus area.",
      });
      if (suggestions.length >= 3) break;
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `practice_suggest: ${focus.slice(0, 80)}`,
    });

    return { ok: true, suggestions };
  } catch (e: any) {
    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      success: false,
      error: e?.message ?? String(e),
      requestSummary: `practice_suggest: ${focus.slice(0, 80)}`,
    });
    return { ok: false, error: e?.message ?? "Could not pick lessons." };
  }
}
