/**
 * Parent snaps a photo of a worksheet, library book page, or text from
 * a school packet. Gemini Vision reads it, identifies the CCSS standard
 * it targets, and returns a structured payload Readee can use to launch
 * matching practice.
 *
 * Margin: 1 multimodal Gemini call ≈ $0.0008 (input image + ~150 token
 * output). Charge as 4 parent credits. Net margin ~99%. Strong upsell —
 * "Scan any homework, get instant practice on the same skill" is a
 * killer demo for B2C.
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

const SYSTEM = `You are Readee, a K-4 reading specialist. A parent has uploaded a photo of homework, a worksheet, a library-book page, or a school packet. Your job:

1. Read the visible text.
2. Identify what reading skill it's testing or practicing — CCSS strand if obvious (RL.K.1, RF.2.3, L.3.4, etc.). If unsure, give your best guess.
3. Estimate the grade level (K, 1st, 2nd, 3rd, 4th).
4. Pick a kid-friendly skill name a parent will understand ("finding key details," "long vowel sounds," "context clues").
5. Pull out 2-4 example questions you'd ask the kid to practice the same skill.

Be honest about uncertainty. If the image is blurry or doesn't contain readable text, set readable=false and explain.

Stay safe — refuse anything not related to children's reading.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    readable: { type: Type.BOOLEAN },
    extracted_text: { type: Type.STRING },
    grade_level: { type: Type.STRING },
    standard_id: { type: Type.STRING },
    skill_kid_name: { type: Type.STRING },
    skill_summary: { type: Type.STRING },
    practice_questions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    notes: { type: Type.STRING },
  },
  required: ["readable", "extracted_text", "grade_level", "skill_kid_name", "practice_questions"],
};

export type HomeworkScanResult = {
  readable: boolean;
  extractedText: string;
  gradeLevel: string;
  standardId: string;
  skillKidName: string;
  skillSummary: string;
  practiceQuestions: string[];
  notes: string;
};

export async function scanHomeworkImage(input: {
  parentId: string;
  imageBase64: string;
  mimeType: string;
}): Promise<{ ok: true; result: HomeworkScanResult } | { ok: false; error: string }> {
  if (!input.imageBase64) return { ok: false, error: "Image is required." };

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: input.mimeType, data: input.imageBase64 } },
            { text: "Analyze this homework image per the schema." },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.3,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as Partial<HomeworkScanResult> & {
      readable?: boolean;
      extracted_text?: string;
      grade_level?: string;
      standard_id?: string;
      skill_kid_name?: string;
      skill_summary?: string;
      practice_questions?: string[];
    };
    const result: HomeworkScanResult = {
      readable: !!parsed.readable,
      extractedText: (parsed.extracted_text ?? "").slice(0, 4000),
      gradeLevel: (parsed.grade_level ?? "").trim(),
      standardId: (parsed.standard_id ?? "").trim(),
      skillKidName: (parsed.skill_kid_name ?? "").trim(),
      skillSummary: (parsed.skill_summary ?? "").trim(),
      practiceQuestions: Array.isArray(parsed.practice_questions)
        ? parsed.practice_questions.map((s) => String(s).trim()).filter(Boolean).slice(0, 6)
        : [],
      notes: ((parsed as any).notes ?? "").trim(),
    };

    await logUsage({
      teacherId: input.parentId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      // Image input + small text out ≈ 4 credits worth of cost.
      creditsUsed: 4,
      success: true,
      requestSummary: `homework_scan: ${result.skillKidName.slice(0, 80)}`,
    });

    return { ok: true, result };
  } catch (e: any) {
    trackError(e, { route: "build-homework-scan", userId: input.parentId });
    return { ok: false, error: e?.message ?? "Couldn't read that image. Try a clearer photo." };
  }
}
