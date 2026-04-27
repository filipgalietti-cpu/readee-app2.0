/**
 * Roster CSV/text normalizer for school onboarding.
 *
 * Districts hand us rosters in 100 different shapes. Some are
 * pipe-separated, some have weird headers ("Stu_FName"), some have
 * grade as "Kindergarten" / "K" / "0", some smush first+last into one
 * column. Gemini structured output reads any of them and emits a
 * normalized JSON array we can ingest.
 *
 * Margin: 1 call ≈ \$0.01 for a 200-row roster (still under 1¢/student).
 * Charged at 0 credits internally — the real value is the saved
 * onboarding time (30 min/school × hundreds of schools = real money).
 *
 * For SOC2-pinned districts that won't send rosters to a third-party
 * model, we'll layer Document AI / Form Parser later for on-prem-style
 * deterministic extraction. Today: Gemini.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { trackError } from "@/lib/observability/track";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

const SYSTEM = `You normalize a student roster from any CSV/TSV/text shape into a clean JSON array. Each output row must have:
  - first_name (string)
  - last_name (string, may be empty)
  - grade (one of: "K","1","2","3","4")
  - class_name (string, may be empty — use the homeroom/teacher name if present)
  - student_id (string, may be empty)

Conventions:
  - "Kindergarten", "K", "0", "TK" → "K"
  - "1st Grade", "Grade 1", "01" → "1"
  - Same for 2/3/4. If grade is outside K-4, omit the row.
  - Smushed names → split intelligently (FirstLast: detect title case boundary; comma-form "Doe, Jane" → "Jane Doe").
  - Strip honorifics ("Mr.", "Ms.").
  - Keep duplicates so the human can dedupe later — don't drop them.

Anti-hallucination: don't invent students. If a row is too garbled to parse, omit it (don't guess).`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    students: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          first_name: { type: Type.STRING },
          last_name: { type: Type.STRING },
          grade: { type: Type.STRING },
          class_name: { type: Type.STRING },
          student_id: { type: Type.STRING },
        },
        required: ["first_name", "grade"],
      },
    },
    detected_format: { type: Type.STRING },
    skipped_count: { type: Type.INTEGER },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["students"],
};

export type NormalizedStudent = {
  firstName: string;
  lastName: string;
  grade: string;
  className: string;
  studentId: string;
};

export type RosterNormalization = {
  students: NormalizedStudent[];
  detectedFormat: string;
  skippedCount: number;
  warnings: string[];
};

export async function normalizeRoster(input: {
  adminId: string;
  rawText: string;
}): Promise<{ ok: true; result: RosterNormalization } | { ok: false; error: string }> {
  const text = input.rawText.trim();
  if (!text) return { ok: false, error: "Roster text required." };
  if (text.length > 200_000) {
    return { ok: false, error: "Roster too large. Split into multiple uploads." };
  }

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: `Normalize this roster:\n\n${text.slice(0, 180_000)}`,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.1,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as Partial<{
      students: any[];
      detected_format: string;
      skipped_count: number;
      warnings: string[];
    }>;
    const students: NormalizedStudent[] = ((parsed.students ?? []) as any[])
      .map((s) => ({
        firstName: String(s.first_name ?? "").trim(),
        lastName: String(s.last_name ?? "").trim(),
        grade: String(s.grade ?? "").trim(),
        className: String(s.class_name ?? "").trim(),
        studentId: String(s.student_id ?? "").trim(),
      }))
      .filter((s) => s.firstName && /^(K|0|1|2|3|4)$/.test(s.grade))
      .map((s) => ({ ...s, grade: s.grade === "0" ? "K" : s.grade }));
    const result: RosterNormalization = {
      students,
      detectedFormat: (parsed.detected_format ?? "").toString(),
      skippedCount: Number(parsed.skipped_count ?? 0),
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
    };

    await logUsage({
      teacherId: input.adminId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: 0,
      success: true,
      requestSummary: `normalize_roster: ${students.length} students`,
    });

    return { ok: true, result };
  } catch (e: any) {
    trackError(e, { route: "normalize-roster", userId: input.adminId });
    return { ok: false, error: e?.message ?? "Couldn't read that roster." };
  }
}
