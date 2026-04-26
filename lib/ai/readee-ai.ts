import { GoogleGenAI, Type } from "@google/genai";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { trackError } from "@/lib/observability/track";
import {
  assertSafePrompt,
  assertSafeOutput,
  IMAGE_SAFETY_PREFIX,
} from "@/lib/ai/safety";
import {
  CREDIT_COST,
  HOURLY_CREDIT_LIMIT,
  MONTHLY_CREDIT_LIMIT,
  type AiKind,
} from "@/lib/ai/credits";
import { getTopUpBalance, spendTopUp } from "@/lib/ai/credit-balance";

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

const MODEL_ID = "gemini-2.5-flash";
// Was "gemini-2.5-flash-image-preview" — Google retired the preview
// alias and image gen started 404'ing. The GA name is the same model.
const IMAGE_MODEL_ID = "gemini-2.5-flash-image";
const TTS_MODEL_ID = "gemini-2.5-flash-preview-tts";
const TTS_DEFAULT_VOICE = "Autonoe";
const TTS_SAMPLE_RATE = 24000;

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

export type BudgetCheck = {
  allowed: boolean;
  reason?: "hourly" | "monthly";
  costCredits: number;
  hourlyUsed: number;
  monthlyUsed: number;
  hourlyLimit: number;
  monthlyLimit: number;
  topUpBalance: number;
};

/**
 * Check whether a teacher can spend `CREDIT_COST[kind]` more credits
 * without blowing the hourly or monthly cap. This is the single budget
 * gate for all Readee.ai generators.
 *
 * Only successful calls (success = true in ai_usage_log) count against
 * the budget, so a failed request doesn't punish the teacher.
 */
export async function checkRateLimit(
  teacherId: string,
  kind: AiKind,
): Promise<BudgetCheck> {
  const admin = supabaseAdmin();
  const now = Date.now();
  const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const cost = CREDIT_COST[kind] ?? 1;

  const [{ data: rows }, topUpBalance] = await Promise.all([
    admin
      .from("ai_usage_log")
      .select("credits_used, created_at")
      .eq("teacher_id", teacherId)
      .eq("success", true)
      .gte("created_at", thirtyDaysAgo),
    getTopUpBalance(teacherId, "teacher"),
  ]);

  let hourlyUsed = 0;
  let monthlyUsed = 0;
  for (const r of (rows ?? []) as any[]) {
    const c = Number(r.credits_used ?? 0);
    monthlyUsed += c;
    if (r.created_at >= oneHourAgo) hourlyUsed += c;
  }

  // Effective monthly pool = entitlement + top-ups. Top-ups don't apply
  // to the hourly rate limit (which is abuse control, not economic).
  const effectiveMonthlyLimit = MONTHLY_CREDIT_LIMIT + topUpBalance;

  if (monthlyUsed + cost > effectiveMonthlyLimit) {
    return {
      allowed: false,
      reason: "monthly",
      costCredits: cost,
      hourlyUsed,
      monthlyUsed,
      hourlyLimit: HOURLY_CREDIT_LIMIT,
      monthlyLimit: MONTHLY_CREDIT_LIMIT,
      topUpBalance,
    };
  }
  if (hourlyUsed + cost > HOURLY_CREDIT_LIMIT) {
    return {
      allowed: false,
      reason: "hourly",
      costCredits: cost,
      hourlyUsed,
      monthlyUsed,
      hourlyLimit: HOURLY_CREDIT_LIMIT,
      monthlyLimit: MONTHLY_CREDIT_LIMIT,
      topUpBalance,
    };
  }
  return {
    allowed: true,
    costCredits: cost,
    hourlyUsed,
    monthlyUsed,
    hourlyLimit: HOURLY_CREDIT_LIMIT,
    monthlyLimit: MONTHLY_CREDIT_LIMIT,
    topUpBalance,
  };
}

function budgetError(rl: BudgetCheck): string {
  if (rl.reason === "monthly") {
    return `You've used this month's Readee.ai budget (${rl.monthlyUsed}/${rl.monthlyLimit} credits${
      rl.topUpBalance > 0 ? ` + ${rl.topUpBalance} top-up credits` : ""
    }). Top up your credits from the Readee.ai menu to keep building.`;
  }
  return `You've generated a lot in the last hour (${rl.hourlyUsed}/${rl.hourlyLimit} credits). Try again in a bit — this limit resets continuously.`;
}

export async function logUsage(input: {
  teacherId: string;
  kind: AiKind;
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

/**
 * After an orchestrator completes a batch, detect whether the total
 * spend pushed the user past their pool's monthly entitlement and
 * debit the overflow from their top-up balance. Call once per batch
 * with the pre-batch monthly-used value and the just-consumed total.
 */
export async function settleBatchAgainstTopUp(input: {
  profileId: string;
  pool: "teacher" | "parent";
  monthlyUsedBefore: number;
  creditsConsumed: number;
  monthlyLimit: number;
}): Promise<void> {
  if (input.creditsConsumed <= 0) return;
  const overflow = Math.max(
    0,
    input.monthlyUsedBefore + input.creditsConsumed - input.monthlyLimit,
  );
  if (overflow <= 0) return;
  await spendTopUp({
    profileId: input.profileId,
    pool: input.pool,
    amount: Math.min(overflow, input.creditsConsumed),
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

const MATCHING_SYSTEM = `You design matching-pair exercises for elementary reading. Teacher gives you a topic; you return pairs that belong together.

Rules:
- Each pair is {left, right}. Left is the item the student sees first (word, picture concept, character name). Right is what it matches with (definition, synonym, meaning, trait).
- Keep both sides short — under 60 characters each.
- Pairs must be mutually exclusive: no right-side answer should reasonably match a different left-side item.
- Grade-appropriate vocabulary (K-2 simpler; 3-4 richer).
- The hint field (optional per question) is a single sentence that helps a struggling student think about the category, not give away the answer.`;

const MATCHING_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    pairs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          left: { type: Type.STRING },
          right: { type: Type.STRING },
        },
        required: ["left", "right"],
      },
    },
    hint: { type: Type.STRING },
  },
  required: ["pairs"],
};

const PASSAGE_SYSTEM = `You write short decodable reading passages for K-4 elementary students aligned to the Science of Reading.

Rules:
- Keep it SHORT: K = 30-60 words, 1st = 60-120, 2nd = 120-200, 3rd = 200-300, 4th = 300-400.
- Use grade-appropriate vocabulary. Prefer common decodable words for K-2.
- If the teacher names a phonics pattern (short a, long e, r-controlled, -tion), use it consistently. Bold the target words with **asterisks**.
- Narrative style: simple characters, clear setting, a small problem, a small resolution. No fantasy jargon or historical-era vocabulary.
- Return ONLY the passage text in the "passage" field, and a short "title" field (≤ 8 words). No preamble.`;

const PASSAGE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    passage: { type: Type.STRING },
    suggested_questions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["title", "passage"],
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

  const safety = assertSafePrompt(input.topic);
  if (!safety.ok) return { ok: false, error: safety.error };

  const rl = await checkRateLimit(input.teacherId, "quiz_generation");
  if (!rl.allowed) {
    return { ok: false, error: budgetError(rl) };
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

    // Gemini doesn't strictly enforce the `count` instruction — it
    // sometimes returns 4-5 when you ask for 3. Hard-clamp to the
    // requested count so teachers get exactly what they asked for.
    if (questions.length > count) {
      questions.length = count;
    }

    const outputSafety = assertSafeOutput(
      questions.flatMap((qq) => [qq.prompt, ...qq.choices, qq.hint ?? ""]),
    );
    if (!outputSafety.ok) {
      throw new Error(outputSafety.error);
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
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

// ═══ Matching pair generator ═════════════════════════════════════════

export type GeneratedPair = { left: string; right: string };

// ═══ True/false generator ═════════════════════════════════════════

export type GeneratedTrueFalse = {
  prompt: string;
  correct: "True" | "False";
  hint: string | null;
};

const TF_SYSTEM = `You write true/false reading-comprehension statements for elementary students.

Rules:
- Each statement is a SHORT declarative sentence the student can mark True or False after reading the passage.
- Mix of true and false statements (don't make all true or all false).
- Statements must be unambiguously true or false based on the passage. No trick wording.
- Grade-appropriate vocabulary; K-2 simpler, 3-4 richer.
- Hint = one sentence pointing the reader back to the relevant part of the passage.
- The "correct" field is exactly the string "True" or "False".`;

const TF_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          prompt: { type: Type.STRING },
          correct: { type: Type.STRING },
          hint: { type: Type.STRING },
        },
        required: ["prompt", "correct", "hint"],
        propertyOrdering: ["prompt", "correct", "hint"],
      },
    },
  },
  required: ["questions"],
};

export async function generateTrueFalseQuestions(input: {
  teacherId: string;
  topic: string;
  gradeLevel?: string | null;
  count: number;
}): Promise<{ ok: true; questions: GeneratedTrueFalse[] } | { ok: false; error: string }> {
  if (!input.topic.trim()) return { ok: false, error: "Topic is required." };
  const count = Math.max(1, Math.min(10, Math.floor(input.count)));

  const safety = assertSafePrompt(input.topic);
  if (!safety.ok) return { ok: false, error: safety.error };

  const rl = await checkRateLimit(input.teacherId, "quiz_generation");
  if (!rl.allowed) return { ok: false, error: budgetError(rl) };

  let client: GoogleGenAI;
  try {
    client = getClient();
  } catch (e: any) {
    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      success: false,
      error: e.message,
      requestSummary: `tf: ${input.topic.slice(0, 150)}`,
    });
    return { ok: false, error: e.message ?? "AI is not configured." };
  }

  const gradeLine = input.gradeLevel
    ? `Grade level: ${input.gradeLevel}.`
    : "Grade level: 2nd.";
  const userPrompt = `${gradeLine}

Topic / focus: ${input.topic.trim()}

Generate exactly ${count} true/false statement${count === 1 ? "" : "s"} per the schema. Mix true and false answers — do not make them all the same. Each correct field must be exactly "True" or "False".`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: TF_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: TF_SCHEMA,
        temperature: 0.6,
      },
    });
    const text = response.text;
    if (!text) throw new Error("Empty response from the model.");
    const parsed = JSON.parse(text) as {
      questions?: { prompt?: string; correct?: string; hint?: string }[];
    };
    const raw = parsed.questions ?? [];
    const questions: GeneratedTrueFalse[] = [];
    for (const q of raw) {
      const prompt = (q.prompt ?? "").trim();
      const norm = (q.correct ?? "").trim().toLowerCase();
      const hint = q.hint ? String(q.hint).trim() : null;
      if (!prompt) continue;
      if (norm !== "true" && norm !== "false") continue;
      questions.push({
        prompt,
        correct: norm === "true" ? "True" : "False",
        hint: hint || null,
      });
    }
    if (questions.length === 0) {
      throw new Error("The model returned no usable T/F items. Try rephrasing.");
    }
    if (questions.length > count) questions.length = count;

    const outputSafety = assertSafeOutput(
      questions.flatMap((q) => [q.prompt, q.hint ?? ""]),
    );
    if (!outputSafety.ok) throw new Error(outputSafety.error);

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `tf: ${input.topic.slice(0, 150)}`,
    });
    return { ok: true, questions };
  } catch (e: any) {
    trackError(e, {
      route: "readee-ai.generateTrueFalseQuestions",
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
      requestSummary: `tf: ${input.topic.slice(0, 150)}`,
    });
    return { ok: false, error: e?.message ?? "T/F generation failed." };
  }
}

export async function generateMatchingPairs(input: {
  teacherId: string;
  topic: string;
  gradeLevel?: string | null;
  count: number;
}): Promise<
  { ok: true; pairs: GeneratedPair[] } | { ok: false; error: string }
> {
  if (!input.topic.trim()) return { ok: false, error: "Topic is required." };
  const count = Math.max(2, Math.min(8, Math.floor(input.count)));

  const safety = assertSafePrompt(input.topic);
  if (!safety.ok) return { ok: false, error: safety.error };

  const rl = await checkRateLimit(input.teacherId, "quiz_generation");
  if (!rl.allowed) {
    return { ok: false, error: budgetError(rl) };
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
    : "Grade level: 2nd.";
  const userPrompt = `${gradeLine}\n\nTopic / focus: ${input.topic.trim()}\n\nGenerate exactly ${count} matching pairs.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: MATCHING_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: MATCHING_SCHEMA,
        temperature: 0.7,
      },
    });
    const text = response.text;
    if (!text) throw new Error("Empty response from the model.");

    const parsed = JSON.parse(text) as { pairs?: { left?: string; right?: string }[] };
    const raw = parsed.pairs ?? [];
    const pairs: GeneratedPair[] = [];
    const rightsSeen = new Set<string>();
    const leftsSeen = new Set<string>();
    for (const p of raw) {
      const left = (p.left ?? "").trim();
      const right = (p.right ?? "").trim();
      if (!left || !right) continue;
      if (left.length > 120 || right.length > 120) continue;
      if (leftsSeen.has(left.toLowerCase())) continue;
      if (rightsSeen.has(right.toLowerCase())) continue;
      leftsSeen.add(left.toLowerCase());
      rightsSeen.add(right.toLowerCase());
      pairs.push({ left, right });
    }
    if (pairs.length < 2) {
      throw new Error("Could not produce enough distinct pairs. Try rephrasing.");
    }
    // Same hard-clamp as MCQ generator — Gemini sometimes returns more
    // than asked.
    if (pairs.length > count) {
      pairs.length = count;
    }

    const outputSafety = assertSafeOutput(pairs.flatMap((p) => [p.left, p.right]));
    if (!outputSafety.ok) {
      throw new Error(outputSafety.error);
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `pairs: ${input.topic.slice(0, 150)}`,
    });
    return { ok: true, pairs };
  } catch (e: any) {
    trackError(e, {
      route: "readee-ai.generateMatchingPairs",
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
      requestSummary: `pairs: ${input.topic.slice(0, 150)}`,
    });
    return {
      ok: false,
      error: e?.message ?? "The AI hit an error. Try rephrasing.",
    };
  }
}

/**
 * Convert matching pairs into MCQs that plug into the existing student
 * runner (MCQ / T-F / fill-in). Each pair becomes a question where the
 * LEFT is the prompt, the RIGHT is the correct answer, and 3 other
 * pairs' rights serve as distractors. Keeps the data model simple — no
 * new question kind to build UI for.
 */
export function pairsToMCQs(
  pairs: GeneratedPair[],
): { prompt: string; choices: string[]; correct: string; hint: string | null }[] {
  if (pairs.length < 2) return [];
  const out: { prompt: string; choices: string[]; correct: string; hint: string | null }[] = [];
  for (let i = 0; i < pairs.length; i++) {
    const correct = pairs[i].right;
    const others = pairs
      .filter((_, j) => j !== i)
      .map((p) => p.right);
    // Take up to 3 distractors; if fewer than 3 pairs total, fall back to
    // the ones we have (2 choices is still valid for matching-as-MCQ).
    const distractors: string[] = [];
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    for (const c of shuffled) {
      if (distractors.length >= 3) break;
      if (!distractors.includes(c)) distractors.push(c);
    }
    const choices = [correct, ...distractors].sort(() => Math.random() - 0.5);
    out.push({
      prompt: `Match: ${pairs[i].left}`,
      choices,
      correct,
      hint: null,
    });
  }
  return out;
}

// ═══ Passage writer ═════════════════════════════════════════════════

export type GeneratedPassage = {
  title: string;
  passage: string;
  suggestedQuestions: string[];
};

// ═══ Image generation (Gemini 2.5 Flash Image) ══════════════════════

const IMAGE_STYLE_PREFIX =
  "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, kid-friendly, no text, no watermarks. ";

export async function generateImage(input: {
  teacherId: string;
  prompt: string;
}): Promise<
  { ok: true; imageUrl: string; storagePath: string } | { ok: false; error: string }
> {
  if (!input.prompt.trim()) return { ok: false, error: "Prompt is required." };

  const safety = assertSafePrompt(input.prompt);
  if (!safety.ok) return { ok: false, error: safety.error };

  const rl = await checkRateLimit(input.teacherId, "image_generation");
  if (!rl.allowed) {
    return { ok: false, error: budgetError(rl) };
  }

  let client: GoogleGenAI;
  try {
    client = getClient();
  } catch (e: any) {
    await logUsage({
      teacherId: input.teacherId,
      kind: "image_generation",
      success: false,
      error: e.message,
      requestSummary: input.prompt.slice(0, 200),
    });
    return { ok: false, error: e.message ?? "AI is not configured." };
  }

  try {
    const fullPrompt = IMAGE_SAFETY_PREFIX + IMAGE_STYLE_PREFIX + input.prompt.trim();
    const response = await client.models.generateContent({
      model: IMAGE_MODEL_ID,
      contents: fullPrompt,
    });

    // The image comes back as an inline_data part on the candidate.
    const parts = (response as any)?.candidates?.[0]?.content?.parts ?? [];
    let imageBase64: string | null = null;
    let mimeType = "image/png";
    for (const p of parts) {
      if (p.inlineData?.data) {
        imageBase64 = p.inlineData.data;
        mimeType = p.inlineData.mimeType ?? mimeType;
        break;
      }
    }
    if (!imageBase64) {
      throw new Error("The model didn't return an image. Try rephrasing.");
    }

    const buffer = Buffer.from(imageBase64, "base64");
    const ext = mimeType.includes("png")
      ? "png"
      : mimeType.includes("jpeg") || mimeType.includes("jpg")
      ? "jpg"
      : mimeType.includes("webp")
      ? "webp"
      : "png";
    const uuid = randomUUID();
    const storagePath = `custom/${input.teacherId}/${uuid}.${ext}`;

    const admin = supabaseAdmin();
    const upload = await admin.storage
      .from("images")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });
    if (upload.error) {
      throw new Error(`Upload failed: ${upload.error.message}`);
    }

    const { data: publicUrl } = admin.storage.from("images").getPublicUrl(storagePath);
    const imageUrl = publicUrl?.publicUrl;
    if (!imageUrl) {
      throw new Error("Could not resolve a public URL for the image.");
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "image_generation",
      model: IMAGE_MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.image_generation,
      success: true,
      requestSummary: input.prompt.slice(0, 200),
    });

    return { ok: true, imageUrl, storagePath };
  } catch (e: any) {
    trackError(e, {
      route: "readee-ai.generateImage",
      userId: input.teacherId,
      tags: { model: IMAGE_MODEL_ID, kind: "image_generation" },
      extra: { prompt: input.prompt.slice(0, 200) },
    });
    await logUsage({
      teacherId: input.teacherId,
      kind: "image_generation",
      model: IMAGE_MODEL_ID,
      success: false,
      error: e.message,
      requestSummary: input.prompt.slice(0, 200),
    });
    return {
      ok: false,
      error: e?.message ?? "Image generation failed.",
    };
  }
}

// ═══ Speech generation (Gemini TTS) ═════════════════════════════════

function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcm.copy(buffer, 44);
  return buffer;
}

export async function generateSpeech(input: {
  teacherId: string;
  text: string;
  /** Underlying Gemini prebuilt voice name (e.g. "Autonoe", "Puck"). */
  voice?: string;
}): Promise<
  { ok: true; audioUrl: string; storagePath: string } | { ok: false; error: string }
> {
  const text = input.text.trim();
  if (!text) return { ok: false, error: "Text is required." };
  if (text.length > 1200) {
    return { ok: false, error: "Keep the text under 1,200 characters for audio." };
  }
  const voiceName = input.voice ?? TTS_DEFAULT_VOICE;

  const safety = assertSafePrompt(text);
  if (!safety.ok) return { ok: false, error: safety.error };

  const rl = await checkRateLimit(input.teacherId, "tts_generation");
  if (!rl.allowed) {
    return { ok: false, error: budgetError(rl) };
  }

  let client: GoogleGenAI;
  try {
    client = getClient();
  } catch (e: any) {
    await logUsage({
      teacherId: input.teacherId,
      kind: "tts_generation",
      success: false,
      error: e.message,
      requestSummary: text.slice(0, 200),
    });
    return { ok: false, error: e.message ?? "AI is not configured." };
  }

  try {
    const response = await client.models.generateContent({
      model: TTS_MODEL_ID,
      contents: `Read this warmly for a young student, clearly and unhurried: ${text}`,
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      } as any,
    });

    const parts = (response as any)?.candidates?.[0]?.content?.parts ?? [];
    let pcmBase64: string | null = null;
    for (const p of parts) {
      if (p.inlineData?.data) {
        pcmBase64 = p.inlineData.data;
        break;
      }
    }
    if (!pcmBase64) {
      throw new Error("The model didn't return audio. Try again.");
    }

    const pcm = Buffer.from(pcmBase64, "base64");
    const wav = pcmToWav(pcm, TTS_SAMPLE_RATE);
    const uuid = randomUUID();
    const storagePath = `custom/${input.teacherId}/${uuid}.wav`;

    const admin = supabaseAdmin();
    const upload = await admin.storage
      .from("audio")
      .upload(storagePath, wav, {
        contentType: "audio/wav",
        upsert: false,
      });
    if (upload.error) {
      throw new Error(`Upload failed: ${upload.error.message}`);
    }

    const { data: publicUrl } = admin.storage.from("audio").getPublicUrl(storagePath);
    const audioUrl = publicUrl?.publicUrl;
    if (!audioUrl) {
      throw new Error("Could not resolve a public URL for the audio.");
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "tts_generation",
      model: TTS_MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.tts_generation,
      success: true,
      requestSummary: text.slice(0, 200),
    });

    return { ok: true, audioUrl, storagePath };
  } catch (e: any) {
    trackError(e, {
      route: "readee-ai.generateSpeech",
      userId: input.teacherId,
      tags: { model: TTS_MODEL_ID, kind: "tts_generation" },
      extra: { text: text.slice(0, 200) },
    });
    await logUsage({
      teacherId: input.teacherId,
      kind: "tts_generation",
      model: TTS_MODEL_ID,
      success: false,
      error: e.message,
      requestSummary: text.slice(0, 200),
    });
    return {
      ok: false,
      error: e?.message ?? "Audio generation failed.",
    };
  }
}

// ═══ Passage writer ═════════════════════════════════════════════════

export async function generatePassage(input: {
  teacherId: string;
  topic: string;
  gradeLevel?: string | null;
  phonicsPattern?: string | null;
}): Promise<{ ok: true; passage: GeneratedPassage } | { ok: false; error: string }> {
  if (!input.topic.trim()) return { ok: false, error: "Topic is required." };

  const safety = assertSafePrompt(
    [input.topic, input.phonicsPattern ?? ""].join(" "),
  );
  if (!safety.ok) return { ok: false, error: safety.error };

  const rl = await checkRateLimit(input.teacherId, "passage_generation");
  if (!rl.allowed) {
    return { ok: false, error: budgetError(rl) };
  }

  let client: GoogleGenAI;
  try {
    client = getClient();
  } catch (e: any) {
    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      success: false,
      error: e.message,
      requestSummary: input.topic.slice(0, 200),
    });
    return { ok: false, error: e.message ?? "AI is not configured." };
  }

  const gradeLine = input.gradeLevel
    ? `Grade level: ${input.gradeLevel}.`
    : "Grade level: 2nd.";
  const phonicsLine = input.phonicsPattern?.trim()
    ? `Phonics focus: emphasize ${input.phonicsPattern.trim()}. Bold target words with **asterisks**.`
    : "";
  const userPrompt = [gradeLine, phonicsLine, "", `Topic: ${input.topic.trim()}`, "", "Write the passage per the schema. Also suggest 3 short comprehension questions (not MCQs — just prompt strings) in suggested_questions."]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: PASSAGE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: PASSAGE_SCHEMA,
        temperature: 0.8,
      },
    });
    const text = response.text;
    if (!text) throw new Error("Empty response from the model.");

    const parsed = JSON.parse(text) as {
      title?: string;
      passage?: string;
      suggested_questions?: string[];
    };
    const title = (parsed.title ?? "").trim();
    const passage = (parsed.passage ?? "").trim();
    const suggested = Array.isArray(parsed.suggested_questions)
      ? parsed.suggested_questions.map((s) => String(s).trim()).filter(Boolean).slice(0, 5)
      : [];
    if (!title || !passage) {
      throw new Error("The model didn't return a complete passage. Try again.");
    }

    const outputSafety = assertSafeOutput([title, passage, ...suggested]);
    if (!outputSafety.ok) {
      throw new Error(outputSafety.error);
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.passage_generation,
      success: true,
      requestSummary: `passage: ${input.topic.slice(0, 150)}`,
    });
    return {
      ok: true,
      passage: { title, passage, suggestedQuestions: suggested },
    };
  } catch (e: any) {
    trackError(e, {
      route: "readee-ai.generatePassage",
      userId: input.teacherId,
      tags: { model: MODEL_ID, kind: "passage_generation" },
      extra: { topic: input.topic.slice(0, 200) },
    });
    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      model: MODEL_ID,
      success: false,
      error: e.message,
      requestSummary: `passage: ${input.topic.slice(0, 150)}`,
    });
    return {
      ok: false,
      error: e?.message ?? "Couldn't write that passage. Try rephrasing.",
    };
  }
}
