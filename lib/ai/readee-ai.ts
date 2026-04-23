import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Readee.ai — teacher-facing AI assistant for generating MCQ questions
 * and decodable passages. Rate-limited per teacher (hourly rolling cap)
 * and audit-logged to ai_usage_log.
 *
 * Requires ANTHROPIC_API_KEY in the environment. Falls back to a clear
 * error when missing so the teacher gets an actionable message instead
 * of a 500.
 */

const HOURLY_CAP_PER_TEACHER = 10;
const MODEL_ID = "claude-opus-4-7";

export type GeneratedMCQ = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured on the server.");
  }
  return new Anthropic({ apiKey });
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
- Output ONLY valid JSON in the exact schema below. No preamble, no trailing text, no markdown fences.

Schema:
{
  "questions": [
    {
      "prompt": "string",
      "choices": ["string", "string", "string", "string"],
      "correct": "string (must exactly match one of the choices)",
      "hint": "string"
    }
  ]
}`;

type RawOutput = {
  questions?: {
    prompt?: string;
    choices?: string[];
    correct?: string;
    hint?: string;
  }[];
};

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* ignore */
      }
    }
    throw new Error("Model output was not valid JSON.");
  }
}

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

  let client: Anthropic;
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

Generate ${count} multiple-choice question${count === 1 ? "" : "s"} following the schema.`;

  try {
    const response = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: [
        {
          type: "text",
          text: MCQ_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (!textBlock) throw new Error("Empty response from the model.");

    const parsed = extractJson(textBlock.text) as RawOutput;
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
      questions.push({
        prompt,
        choices,
        correct,
        hint: hint || null,
      });
    }

    if (questions.length === 0) {
      throw new Error("The model returned no usable questions. Try rephrasing the topic.");
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      success: true,
      requestSummary: input.topic.slice(0, 200),
    });

    return { ok: true, questions };
  } catch (e: any) {
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
