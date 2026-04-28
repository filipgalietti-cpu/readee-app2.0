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

// Exported so the QC engine (lib/ai/qc.ts) and other peer modules can
// reuse the same model + client without duplicating setup.
export const MODEL_ID = "gemini-2.5-flash";
// Was "gemini-2.5-flash-image-preview" — Google retired the preview
// alias and image gen started 404'ing. The GA name is the same model.
const IMAGE_MODEL_ID = "gemini-2.5-flash-image";
// Imagen 4 Ultra — higher fidelity, better prompt adherence, supports
// readable text-in-image. Gated to Readee+/Teacher Solo+ ("publish
// quality"). Cost ~$0.06/image vs $0.04 for Flash Image.
const IMAGE_ULTRA_MODEL_ID = "imagen-4.0-ultra-generate-001";
const TTS_MODEL_ID = "gemini-2.5-flash-preview-tts";
const TTS_DEFAULT_VOICE = "Autonoe";
const TTS_SAMPLE_RATE = 24000;

export type GeneratedMCQ = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

/**
 * Defensive whitespace cleanup for AI-generated passage bodies.
 * Even with the system prompt instructing line breaks + space after
 * punctuation, models occasionally serialize "day,Spring" — comma
 * directly against the next word with no whitespace at all. This
 * happens most with poems where the model treats line ends as
 * implicit separators.
 *
 * We:
 *   1. Insert a space after , . ! ? : ; if followed immediately
 *      by a letter/digit (most common bug)
 *   2. Insert a newline before a capital letter that follows a
 *      sentence-end-punctuation+space when the surrounding context
 *      looks like verse (multiple short clauses, end-rhyme cadence).
 *      Conservative — only acts when the model clearly intended
 *      line breaks and dropped them.
 */
function normalizePassageWhitespace(s: string): string {
  if (!s) return s;
  // Bug 1: punctuation glued to next token.  e.g. "day,Spring" → "day, Spring"
  let out = s.replace(/([,.!?;:])(?=[A-Za-z0-9])/g, "$1 ");
  // Bug 2: collapse repeat spaces but preserve newlines.
  out = out.replace(/[ \t]{2,}/g, " ");
  return out;
}

export function getClient(): GoogleGenAI {
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
- ALWAYS put a single space after every comma, period, question mark, and exclamation point — even when a line break follows.
- For poems / verse, separate every poem line with a real newline character (\\n) inside the JSON string. Do NOT smash lines together.
- For prose, separate paragraphs with a blank line (two newlines). One sentence per line is fine; never run multiple sentences together with no whitespace.
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

// ═══ Image brief (text → visual scene description) ══════════════════
//
// The image model is much better when handed a concrete visual scene
// ("A young boy in a hockey uniform on the ice, smiling, holding a
// stick, soft sunset light") than a writing brief ("Friendly,
// encouraging tone"). This step asks Gemini to read the just-generated
// passage and write a short visual description, which then feeds the
// image generator. Costs one quiz_generation credit per build.

const IMAGE_BRIEF_SYSTEM = `You translate short children's reading passages into single-sentence visual scene descriptions for an illustrator.

Rules:
- One sentence, 12-30 words. No lists, no markdown, no extra commentary.
- Describe a single concrete scene the illustration should show: who is in it, what they are doing, the setting, and the mood/lighting.
- Use kid-friendly, school-appropriate visuals. No weapons, no violence, no scary creatures, no romantic content.
- Do NOT include style words like "cartoon", "illustration", "vibrant" — that is set elsewhere. Just describe the scene.
- Do NOT include any text that would appear in the image (no signs, no captions).
- Pick the most evocative single moment from the passage — not a montage.`;

export async function generateImageBrief(input: {
  teacherId: string;
  passageTitle: string;
  passageBody: string;
}): Promise<{ ok: true; brief: string } | { ok: false; error: string }> {
  const text = (input.passageTitle + " " + input.passageBody).trim();
  if (!text) return { ok: false, error: "Passage is empty." };

  const safety = assertSafePrompt(text);
  if (!safety.ok) return { ok: false, error: safety.error };

  const rl = await checkRateLimit(input.teacherId, "quiz_generation");
  if (!rl.allowed) return { ok: false, error: budgetError(rl) };

  let client: GoogleGenAI;
  try {
    client = getClient();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI is not configured." };
  }

  const userPrompt = `Title: ${input.passageTitle}\n\nPassage:\n${input.passageBody.slice(0, 1500)}\n\nWrite the single-sentence visual scene description.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: IMAGE_BRIEF_SYSTEM,
        temperature: 0.6,
      },
    });

    const raw = (response.text ?? "").trim();
    // Strip any leading "Description:"/"Scene:" labels the model might add.
    const brief = raw.replace(/^(Description|Scene|Image):\s*/i, "").trim();
    if (!brief) {
      return { ok: false, error: "Image brief was empty." };
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `image_brief: ${input.passageTitle.slice(0, 80)}`,
    });

    return { ok: true, brief };
  } catch (e: any) {
    trackError(e, {
      route: "readee-ai.generateImageBrief",
      userId: input.teacherId,
      tags: { model: MODEL_ID, kind: "quiz_generation" },
    });
    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      success: false,
      error: e.message,
      requestSummary: `image_brief: ${input.passageTitle.slice(0, 80)}`,
    });
    return { ok: false, error: e.message ?? "Could not write the image brief." };
  }
}

// ═══ Image generation (Gemini 2.5 Flash Image) ══════════════════════

const IMAGE_STYLE_PREFIX =
  "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, kid-friendly, no text, no watermarks. ";

export type ImageQuality = "standard" | "ultra";

export async function generateImage(input: {
  teacherId: string;
  prompt: string;
  /** Optional reference image (base64 + mime). Locks the model onto a
   *  visual anchor — used for cross-page character consistency in books. */
  referenceImage?: { data: string; mimeType: string } | null;
  /** "standard" = Gemini 2.5 Flash Image (~$0.04, default).
   *  "ultra"   = Imagen 4 Ultra (~$0.06, publish-quality).
   *  Gating happens at the caller site. Reference-image conditioning
   *  only works on standard — Imagen doesn't accept image input. */
  quality?: ImageQuality;
}): Promise<
  { ok: true; imageUrl: string; storagePath: string; imageBase64: string; mimeType: string } | { ok: false; error: string }
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
    const useUltra = input.quality === "ultra";
    // Imagen Ultra path — generateImages, no image conditioning.
    let response: any;
    if (useUltra) {
      response = await (client.models as any).generateImages({
        model: IMAGE_ULTRA_MODEL_ID,
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "1:1",
        },
      });
    } else {
      // If a reference image is provided, send it as inlineData alongside the
      // text. Gemini 2.5 Flash Image uses the image as a visual anchor for
      // the new generation — same character, new scene.
      const contents = input.referenceImage
        ? [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: input.referenceImage.mimeType,
                    data: input.referenceImage.data,
                  },
                },
                {
                  text:
                    "Use the character(s) shown in the reference image. Keep their species, breed, coat color, eye color, and signature features identical. Only change the scene/pose/setting per the description below.\n\n" +
                    fullPrompt,
                },
              ],
            },
          ]
        : fullPrompt;
      response = await client.models.generateContent({
        model: IMAGE_MODEL_ID,
        contents: contents as any,
      });
    }

    let imageBase64: string | null = null;
    let mimeType = "image/png";
    if (useUltra) {
      // Imagen response: { generatedImages: [{ image: { imageBytes, mimeType } }] }
      const gi = (response as any)?.generatedImages?.[0]?.image;
      imageBase64 = gi?.imageBytes ?? null;
      mimeType = gi?.mimeType ?? mimeType;
    } else {
      // Gemini Flash Image response: parts with inlineData.
      const parts = (response as any)?.candidates?.[0]?.content?.parts ?? [];
      for (const p of parts) {
        if (p.inlineData?.data) {
          imageBase64 = p.inlineData.data;
          mimeType = p.inlineData.mimeType ?? mimeType;
          break;
        }
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
      model: useUltra ? IMAGE_ULTRA_MODEL_ID : IMAGE_MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      // Ultra costs ~50% more on Google's side. Charge teacher 2x credits
      // (16 vs 8) so margin stays consistent.
      creditsUsed: useUltra ? CREDIT_COST.image_generation * 2 : CREDIT_COST.image_generation,
      success: true,
      requestSummary: `${useUltra ? "[ultra] " : ""}${input.prompt.slice(0, 200)}`,
    });

    return { ok: true, imageUrl, storagePath, imageBase64, mimeType };
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

export const GEMINI_PREBUILT_VOICES = [
  { id: "Autonoe",   name: "Autonoe",   description: "Warm, motherly (default)" },
  { id: "Puck",      name: "Puck",      description: "Upbeat, kid-friendly" },
  { id: "Charon",    name: "Charon",    description: "Calm, even-tempered" },
  { id: "Kore",      name: "Kore",      description: "Bright, lively" },
  { id: "Fenrir",    name: "Fenrir",    description: "Deeper, narrator-style" },
  { id: "Aoede",     name: "Aoede",     description: "Soft, gentle" },
  { id: "Leda",      name: "Leda",      description: "Clear, neutral" },
  { id: "Orus",      name: "Orus",      description: "Friendly young adult" },
  { id: "Zephyr",    name: "Zephyr",    description: "Light, airy" },
  { id: "Callirrhoe",name: "Callirrhoe",description: "Older, grandmotherly" },
] as const;

export async function generateSpeech(input: {
  teacherId: string;
  text: string;
  /** Underlying Gemini prebuilt voice name (e.g. "Autonoe", "Puck"). */
  voice?: string;
  /** Style direction layered onto the read ("warmly, slowly, with smiles"). */
  style?: string | null;
  /** Provider override. Defaults to "gemini". When "elevenlabs", uses
   *  the teacher's cloned voice via cloneVoiceId. Requires ELEVENLABS_API_KEY. */
  provider?: "gemini" | "elevenlabs";
  /** ElevenLabs voice id (returned from voice cloning). */
  cloneVoiceId?: string | null;
}): Promise<
  { ok: true; audioUrl: string; storagePath: string } | { ok: false; error: string }
> {
  const text = input.text.trim();
  if (!text) return { ok: false, error: "Text is required." };
  if (text.length > 1200) {
    return { ok: false, error: "Keep the text under 1,200 characters for audio." };
  }
  const voiceName = input.voice ?? TTS_DEFAULT_VOICE;
  const provider = input.provider ?? "gemini";

  const safety = assertSafePrompt(text);
  if (!safety.ok) return { ok: false, error: safety.error };

  const rl = await checkRateLimit(input.teacherId, "tts_generation");
  if (!rl.allowed) {
    return { ok: false, error: budgetError(rl) };
  }

  // ── ElevenLabs path (true cloned voice) ─────────────────────────────
  if (provider === "elevenlabs") {
    const elKey = process.env.ELEVENLABS_API_KEY;
    if (!elKey) {
      return {
        ok: false,
        error: "Cloned voice requires ELEVENLABS_API_KEY on the server.",
      };
    }
    if (!input.cloneVoiceId) {
      return { ok: false, error: "No cloned voice id on file." };
    }
    try {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${input.cloneVoiceId}`;
      const elRes = await fetch(url, {
        method: "POST",
        headers: {
          "xi-api-key": elKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (!elRes.ok) {
        const body = await elRes.text();
        throw new Error(`ElevenLabs ${elRes.status}: ${body.slice(0, 200)}`);
      }
      const buf = Buffer.from(await elRes.arrayBuffer());
      const uuid = randomUUID();
      const storagePath = `custom/${input.teacherId}/${uuid}.mp3`;
      const admin = supabaseAdmin();
      const upload = await admin.storage
        .from("audio")
        .upload(storagePath, buf, { contentType: "audio/mpeg", upsert: false });
      if (upload.error) throw new Error(`Upload failed: ${upload.error.message}`);
      const { data: pub } = admin.storage.from("audio").getPublicUrl(storagePath);
      const audioUrl = pub?.publicUrl;
      if (!audioUrl) throw new Error("Could not resolve audio URL.");
      await logUsage({
        teacherId: input.teacherId,
        kind: "tts_generation",
        model: "elevenlabs:eleven_turbo_v2_5",
        // ElevenLabs costs ~$0.30/1K chars ≈ ~3x Gemini TTS. Charge 6
        // credits vs the Gemini 2 to keep margin neutral.
        creditsUsed: CREDIT_COST.tts_generation * 3,
        success: true,
        requestSummary: `[clone] ${text.slice(0, 180)}`,
      });
      return { ok: true, audioUrl, storagePath };
    } catch (e: any) {
      trackError(e, { route: "readee-ai.generateSpeech.elevenlabs", userId: input.teacherId });
      await logUsage({
        teacherId: input.teacherId,
        kind: "tts_generation",
        model: "elevenlabs",
        success: false,
        error: e.message,
        requestSummary: `[clone] ${text.slice(0, 180)}`,
      });
      return { ok: false, error: e?.message ?? "Cloned-voice TTS failed." };
    }
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
    const styleDirection = (input.style?.trim() || "warmly for a young student, clearly and unhurried");
    const response = await client.models.generateContent({
      model: TTS_MODEL_ID,
      contents: `Read this ${styleDirection}: ${text}`,
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
    const passage = normalizePassageWhitespace((parsed.passage ?? "").trim());
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

// ═══ Lesson structure (slide-shaped output) ═════════════════════════════
//
// Produces a real instructional slideshow — not a story chunked into
// slides. The model first decides whether the topic is a reading skill
// (concept lesson) or an informational topic, then writes slides in the
// right teaching arc. Each slide carries its own headline, narration,
// and image scene so we don't need a separate image-brief pass.

export type LessonSlide = {
  display_text: string;
  body: string;
  image_scene: string;
};

export type GeneratedLesson = {
  title: string;
  kind: "concept" | "topic";
  slides: LessonSlide[];
};

const LESSON_SYSTEM = `You are Readee, a K-4 reading specialist. You design ONE instructional slideshow (not a short story) that teaches what the teacher asked for.

STEP 1 — Classify the topic:
- "concept": a reading SKILL or strategy (e.g. "key details", "main idea", "context clues", "story elements", "compare and contrast", "long a sound", "blends", "syllable types"). Most teacher requests are this.
- "topic": an informational subject the kids should learn ABOUT (e.g. "the water cycle", "honeybees", "Harriet Tubman", "winter").

STEP 2 — Pick the arc that fits.

For "concept" lessons (5 slides default), use this teaching arc — DO NOT write a story:
  1. Hook + name the skill ("Today we are learning about KEY DETAILS — the small facts in a story that help us understand it.")
  2. Define it in kid-friendly words + give a tiny everyday example.
  3. Show a 2-3 sentence model passage, then point out the key details inside it.
  4. Guided try-it: a short passage + a question that walks the kid through finding the skill.
  5. Recap: "Today we learned…" + 1-sentence reminder of how to use it.

For "topic" lessons (5 slides default), use:
  1. Hook + question to wonder about.
  2-4. Three informational beats — each a different angle (what it is, why it matters, how it works, etc).
  5. Wrap-up + one thing to remember.

If the teacher asks for a different slide count, scale proportionally — never drop the hook or the recap.

PER-SLIDE FIELDS:
- display_text: the big headline shown on the slide (≤ 8 words). Direct and kid-facing. NOT a label like "Slide 1".
- body: 2-5 sentences narrated/read on the slide. Grade-appropriate vocabulary. For K-1, keep sentences under 10 words.
- image_scene: ONE concrete visual scene to illustrate this slide (12-30 words). Describe a single moment — who, where, doing what, mood. NO style words ("cartoon", "vibrant"). NO text-in-image. NO montages.

GRADE BANDS:
- K: 30-50 words per slide body, sight words + decodable.
- 1st: 50-90 words, simple sentences.
- 2nd: 80-130 words.
- 3rd: 120-180 words.
- 4th: 150-220 words.

ANTI-HALLUCINATION:
- Do NOT invent specific verifiable facts you cannot ground (no fake dates, fake numbers, fake names, fake quotes, fake "scientists say"). If unsure, stay general.
- Concept lessons should be skill-true; topic lessons should be cautious and plausibly accurate. When in doubt, lean general ("many bees live in hives") over specific ("there are 19,847 bees in a hive").
- No moral lessons, no preachiness, no romantic content, no violence, no scary content.
- Use straight quotes (").
- Return ONLY the JSON per the schema. No preamble.`;

const LESSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    kind: { type: Type.STRING, enum: ["concept", "topic"] },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          display_text: { type: Type.STRING },
          body: { type: Type.STRING },
          image_scene: { type: Type.STRING },
        },
        required: ["display_text", "body", "image_scene"],
      },
    },
  },
  required: ["title", "kind", "slides"],
};

export async function generateLessonStructure(input: {
  teacherId: string;
  topic: string;
  gradeLevel?: string | null;
  slideCount: number;
}): Promise<{ ok: true; lesson: GeneratedLesson } | { ok: false; error: string }> {
  if (!input.topic.trim()) return { ok: false, error: "Topic is required." };
  const slideCount = Math.max(3, Math.min(10, Math.floor(input.slideCount)));

  const safety = assertSafePrompt(input.topic);
  if (!safety.ok) return { ok: false, error: safety.error };

  const rl = await checkRateLimit(input.teacherId, "passage_generation");
  if (!rl.allowed) return { ok: false, error: budgetError(rl) };

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
  const userPrompt = [
    gradeLine,
    `Slide count: exactly ${slideCount}.`,
    "",
    `Teacher request: ${input.topic.trim()}`,
    "",
    "Classify the topic, pick the right arc, and write the lesson per the schema.",
  ].join("\n");

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: LESSON_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: LESSON_SCHEMA,
        temperature: 0.7,
      },
    });
    const text = response.text;
    if (!text) throw new Error("Empty response from the model.");

    const parsed = JSON.parse(text) as {
      title?: string;
      kind?: "concept" | "topic";
      slides?: { display_text?: string; body?: string; image_scene?: string }[];
    };
    const title = (parsed.title ?? "").trim();
    const kind = parsed.kind === "topic" ? "topic" : "concept";
    const slides: LessonSlide[] = Array.isArray(parsed.slides)
      ? parsed.slides
          .map((s) => ({
            display_text: (s.display_text ?? "").trim(),
            body: (s.body ?? "").trim(),
            image_scene: (s.image_scene ?? "").trim(),
          }))
          .filter((s) => s.body.length > 0)
      : [];

    if (!title || slides.length < 3) {
      throw new Error("The model didn't return a complete lesson. Try again.");
    }

    const safetyTexts = [
      title,
      ...slides.flatMap((s) => [s.display_text, s.body, s.image_scene]),
    ];
    const outputSafety = assertSafeOutput(safetyTexts);
    if (!outputSafety.ok) throw new Error(outputSafety.error);

    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.passage_generation,
      success: true,
      requestSummary: `lesson: ${input.topic.slice(0, 150)}`,
    });

    return { ok: true, lesson: { title, kind, slides } };
  } catch (e: any) {
    trackError(e, {
      route: "readee-ai.generateLessonStructure",
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
      requestSummary: `lesson: ${input.topic.slice(0, 150)}`,
    });
    return {
      ok: false,
      error: e?.message ?? "Couldn't build that lesson. Try rephrasing.",
    };
  }
}

// ═══ Single-question regenerator (teacher-feedback driven) ═══════════════
//
// Used when a teacher rejects a Readee.ai question and provides a reason
// ("too easy", "ambiguous", "not aligned to passage"). We feed the
// rejected question + reason + passage back to Gemini to produce ONE
// replacement. Bypasses the rate limit because Readee eats this as
// QC training cost — the feedback signal is more valuable than the
// credit. Logged with creditsUsed=0 so it doesn't drain the teacher's
// monthly cap, but still appears in usage logs for accounting.

const REGEN_SYSTEM = `You rewrite a single multiple-choice reading-comprehension question that a teacher rejected. The teacher gave a reason — fix THAT specific issue.

Rules:
- Stay grounded in the provided passage. Don't invent facts.
- EXACTLY 4 choices, one correct. The "correct" field must match a choice character-for-character.
- Address the rejection reason directly. If "too easy" → make it inferential. If "ambiguous" → tighten the wording so only one answer fits. If "not aligned" → re-anchor to a specific detail in the passage. If "wrong answer" → re-check the answer key.
- Do NOT produce the same question again with cosmetic changes. The new question should feel meaningfully different.
- Grade-appropriate vocabulary. Hint (one sentence) should re-direct to the part of the passage that contains the answer.
- Randomize correct-answer position (don't always put it at A).`;

const REGEN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    prompt: { type: Type.STRING },
    choices: { type: Type.ARRAY, items: { type: Type.STRING } },
    correct: { type: Type.STRING },
    hint: { type: Type.STRING },
  },
  required: ["prompt", "choices", "correct", "hint"],
};

export async function regenerateMCQQuestion(input: {
  teacherId: string;
  passageBody: string;
  gradeLevel?: string | null;
  oldQuestion: { prompt: string; choices: string[]; correct: string };
  rejectionReason: string;
}): Promise<{ ok: true; question: GeneratedMCQ } | { ok: false; error: string }> {
  if (!input.passageBody.trim()) return { ok: false, error: "Passage is required." };

  const safety = assertSafePrompt(
    [input.passageBody, input.rejectionReason, input.oldQuestion.prompt].join(" "),
  );
  if (!safety.ok) return { ok: false, error: safety.error };

  let client: GoogleGenAI;
  try {
    client = getClient();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI is not configured." };
  }

  const gradeLine = input.gradeLevel ? `Grade level: ${input.gradeLevel}.` : "Grade level: 2nd.";
  const userPrompt = [
    gradeLine,
    "",
    "Passage students will read:",
    `"""\n${input.passageBody.slice(0, 4000)}\n"""`,
    "",
    "REJECTED question:",
    `Prompt: ${input.oldQuestion.prompt}`,
    `Choices: ${input.oldQuestion.choices.join(" | ")}`,
    `Marked correct: ${input.oldQuestion.correct}`,
    "",
    `Teacher's rejection reason: ${input.rejectionReason || "(not specified — improve generally)"}`,
    "",
    "Write ONE replacement question per the schema. Address the rejection reason head-on.",
  ].join("\n");

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: REGEN_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: REGEN_SCHEMA,
        temperature: 0.85,
      },
    });
    const text = response.text;
    if (!text) throw new Error("Empty response from the model.");

    const parsed = JSON.parse(text) as {
      prompt?: string;
      choices?: string[];
      correct?: string;
      hint?: string;
    };
    const prompt = (parsed.prompt ?? "").trim();
    const choices = Array.isArray(parsed.choices)
      ? parsed.choices.map((c) => String(c).trim()).filter(Boolean)
      : [];
    const correct = (parsed.correct ?? "").trim();
    const hint = (parsed.hint ?? "").trim() || null;
    if (!prompt || choices.length !== 4 || !correct || !choices.includes(correct)) {
      throw new Error("Regenerated question failed validation.");
    }

    const outputSafety = assertSafeOutput([prompt, ...choices, correct, hint ?? ""]);
    if (!outputSafety.ok) throw new Error(outputSafety.error);

    // Log with creditsUsed=0 — Readee absorbs this cost as QC training.
    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: 0,
      success: true,
      requestSummary: `regen (qc-feedback): ${input.rejectionReason.slice(0, 100)}`,
    });

    return { ok: true, question: { prompt, choices, correct, hint } };
  } catch (e: any) {
    trackError(e, {
      route: "readee-ai.regenerateMCQQuestion",
      userId: input.teacherId,
      tags: { model: MODEL_ID, kind: "quiz_generation" },
    });
    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      success: false,
      error: e.message,
      requestSummary: `regen (qc-feedback): ${input.rejectionReason.slice(0, 100)}`,
    });
    return {
      ok: false,
      error: e?.message ?? "Couldn't regenerate that question. Try again.",
    };
  }
}
