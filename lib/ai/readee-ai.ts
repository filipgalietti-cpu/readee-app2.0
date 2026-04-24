import { GoogleGenAI, Type } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { trackError } from "@/lib/observability/track";

/**
 * Readee.ai — teacher-facing AI assistant for generating MCQ questions
 * and decodable passages. Rate-limited per teacher (hourly rolling cap)
 * and audit-logged to ai_usage_log.
 *
 * Uses Gemini 2.5 Flash via the Google GenAI SDK. Auth is GEMINI_API_KEY
 * — the same Google account that powers the TTS + image pipelines.
 *
 * Model choice: Flash is ~10x cheaper than Pro and plenty strong for
 * constrained MCQ generation with a JSON response schema. Upgrade to
 * Pro later if output quality isn't hitting Jennifer's bar.
 */

const HOURLY_CAP_PER_TEACHER = 10;
const MODEL_ID = "gemini-2.5-flash";

export type GeneratedMCQ = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function checkRateLimit(
  teacherId: string,
  kind: "quiz_generation" | "image_generation" | "tts_generation" | "passage_generation",
): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const admin = supabaseAdmin();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("ai_usage_log")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", teacherId)
    .eq("kind", kind)
    .gte("created_at", oneHourAgo);
  const used = count ?? 0;
  const remaining = Math.max(0, HOURLY_CAP_PER_TEACHER - used);
  return { allowed: remaining > 0, used, remaining };
}

export async function logUsage(input: {
  teacherId: string;
  kind: "quiz_generation" | "image_generation" | "tts_generation" | "passage_generation";
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  creditsUsed?: number;
  success: boolean;
  error?: string;
  requestSummary?: string;
}): Promise<void> {
  const admin = supabaseAdmin();
  await admin.from("ai_usage_log").insert({
    teacher_id: input.teacherId,
    kind: input.kind,
    model: input.model ?? null,
    input_tokens: input.inputTokens ?? null,
    output_tokens: input.outputTokens ?? null,
    credits_used: input.creditsUsed ?? 1,
    success: input.success,
    error: input.error ?? null,
    request_summary: input.requestSummary ?? null,
  });
}

const MCQ_SYSTEM = `You write age-appropriate multiple-choice reading comprehension questions for elementary students.

Rules:
- Write for the grade level the teacher specifies. Use simple, direct vocabulary for K-2. For 3-4, vocabulary may be richer but still kid-friendly.
- Each question must have EXACTLY 4 choices, one correct. Incorrect choices must be plausible but clearly wrong once read carefully.
- Randomize correct answer position across questions (don't always put the correct one first).
- Make the correct answer unambiguous — no trick questions, no "all of the above", no "none of the above".
- Keep prompts under 350 characters. If a passage is needed, include it inline.
- Write a short hint (one sentence) that helps a struggling student re-read for the answer.
- The "correct" field must match one of the choices exactly, character-for-character.`;

const MCQ_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          prompt: { type: Type.STRING },
          choices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correct: { type: Type.STRING },
          hint: { type: Type.STRING },
        },
        required: ["prompt", "choices", "correct", "hint"],
        propertyOrdering: ["prompt", "choices", "correct", "hint"],
      },
    },
  },
  required: ["questions"],
};

type RawOutput = {
  questions?: {
    prompt?: string;
    choices?: string[];
    correct?: string;
    hint?: string;
  }[];
};

export async function generateMCQQuestions(input: {
  teacherId: string;
  topic: string;
  gradeLevel?: string | null;
  count: number;
}): Promise<{ ok: true; questions: GeneratedMCQ[] } | { ok: false; error: string }> {
  if (!input.topic.trim()) return { ok: false, error: "Topic is required." };
  const count = Math.max(1, Math.min(10, Math.floor(input.count)));

  const rl = await checkRateLimit(input.teacherId, "quiz_generation");
  if (!rl.allowed) {
    return {
      ok: false,
      error: `Hourly AI limit reached (${HOURLY_CAP_PER_TEACHER} generations/hr). Try again in a bit.`,
    };
  }

  let client: GoogleGenAI;
  try {
    client = getClient();
  } catch (e: any) {
    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      success: false,
      error: e.message,
      requestSummary: input.topic.slice(0, 200),
    });
    return { ok: false, error: e.message ?? "AI is not configured." };
  }

  const gradeLine = input.gradeLevel
    ? `Grade level: ${input.gradeLevel}.`
    : "Grade level: 2nd (assume elementary reading comprehension).";

  const userPrompt = `${gradeLine}

Topic / focus: ${input.topic.trim()}

Generate exactly ${count} multiple-choice question${count === 1 ? "" : "s"} following the schema. Each question needs 4 choices with one correct answer.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: MCQ_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: MCQ_SCHEMA,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from the model.");

    const parsed = JSON.parse(text) as RawOutput;
    const raw = parsed.questions ?? [];

    const questions: GeneratedMCQ[] = [];
    for (const q of raw) {
      const prompt = (q.prompt ?? "").trim();
      const choices = Array.isArray(q.choices)
        ? q.choices.map((c) => String(c).trim()).filter(Boolean)
        : [];
      const correct = (q.correct ?? "").trim();
      const hint = q.hint ? String(q.hint).trim() : null;
      if (!prompt || choices.length < 2 || !choices.includes(correct)) continue;
      questions.push({ prompt, choices, correct, hint: hint || null });
    }

    if (questions.length === 0) {
      throw new Error("The model returned no usable questions. Try rephrasing the topic.");
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      success: true,
      requestSummary: input.topic.slice(0, 200),
    });

    return { ok: true, questions };
  } catch (e: any) {
    trackError(e, {
      route: "readee-ai.generateMCQQuestions",
      userId: input.teacherId,
      tags: { model: MODEL_ID, kind: "quiz_generation" },
      extra: { topic: input.topic.slice(0, 200), count },
    });
    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      success: false,
      error: e.message,
      requestSummary: input.topic.slice(0, 200),
    });
    return {
      ok: false,
      error: e?.message ?? "The AI hit an error. Try again, or rephrase the topic.",
    };
  }
}
