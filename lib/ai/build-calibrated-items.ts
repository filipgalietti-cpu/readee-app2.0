/**
 * Difficulty-calibrated assessment item generator.
 *
 * Existing question generators give Gemini a topic + grade level and
 * hope difficulty lands somewhere reasonable. This one is calibrated:
 *
 *  - target difficulty 1-5 (1 = below grade level, 5 = above grade level)
 *  - grade level
 *  - standard ID
 *  - distractors must be at the SAME plausibility level
 *  - Bloom's level constraint (recall vs inference vs analysis)
 *
 * Output is a tighter, more reliable assessment item. Used to:
 *   - Build adaptive placement-test extensions on demand
 *   - Replenish weak strands per kid based on their last 10 attempts
 *   - License to other ed-tech companies (long-term moat)
 *
 * Margin: 1 Gemini call ≈ \$0.005, charged 2 credits → ~75% gross. At
 * scale (10K items/mo from a district), this is the highest-leverage
 * feature in the AI suite.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

const SYSTEM = `You are an item writer trained on CCSS K-4 reading assessments. Generate ONE multiple-choice item that hits the target difficulty PRECISELY.

Difficulty bands:
  1 = below grade level (recall, single-word vocab, very explicit)
  2 = on grade level — easy half (literal recall from a short passage)
  3 = on grade level — typical (inference within a short passage)
  4 = on grade level — hard (multi-step inference, vocabulary in context)
  5 = above grade level (analysis across multiple sentences, abstract themes)

Bloom's level (must align with difficulty):
  1-2 = Remember, Understand
  3   = Apply, Analyze (light)
  4   = Analyze
  5   = Evaluate, Synthesize

CCSS strand alignment is non-negotiable. The prompt MUST be answerable using the standard's specific skill — not a generic reading question.

Distractors:
- Exactly 3 incorrect choices, each plausible at the SAME difficulty band as the correct one. No "throwaway" wrong answers.
- Common student misconception or misread is preferred (e.g., a partially-correct surface answer that misses the key inference).
- Same length range as the correct answer (avoid the "longest answer is correct" pattern).

Hint should redirect attention to the part of the passage that contains the answer — never give it away.

Anti-hallucination: if the prompt requires a passage, INCLUDE a 2-4 sentence passage inside the prompt itself. Do not reference an external passage.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    prompt: { type: Type.STRING },
    choices: { type: Type.ARRAY, items: { type: Type.STRING } },
    correct: { type: Type.STRING },
    hint: { type: Type.STRING },
    difficulty_actual: { type: Type.INTEGER },
    blooms_level: { type: Type.STRING },
    skill_microlabel: { type: Type.STRING },
  },
  required: ["prompt", "choices", "correct", "hint", "difficulty_actual"],
};

export type CalibratedItem = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
  difficultyActual: number;
  bloomsLevel: string;
  skillMicrolabel: string;
};

export async function generateCalibratedItem(input: {
  teacherId: string;
  standardId: string;
  standardDescription: string;
  gradeLevel: string;
  targetDifficulty: 1 | 2 | 3 | 4 | 5;
  /** Optional excerpt from a passage to anchor the question. */
  passageContext?: string | null;
}): Promise<{ ok: true; item: CalibratedItem } | { ok: false; error: string }> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const userPrompt = [
    `Standard: ${input.standardId} — ${input.standardDescription}`,
    `Grade level: ${input.gradeLevel}`,
    `Target difficulty: ${input.targetDifficulty} (1-5 scale, see system).`,
    input.passageContext
      ? `Anchor passage (use as the source of truth):\n"""\n${input.passageContext.slice(0, 1500)}\n"""`
      : "",
    "Write ONE item per the schema. Distractors must be plausible at the same band.",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.7,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as Partial<{
      prompt: string;
      choices: string[];
      correct: string;
      hint: string;
      difficulty_actual: number;
      blooms_level: string;
      skill_microlabel: string;
    }>;
    const choices = (parsed.choices ?? []).map((c) => String(c).trim()).filter(Boolean);
    if (
      !parsed.prompt ||
      choices.length !== 4 ||
      !parsed.correct ||
      !choices.includes(String(parsed.correct).trim())
    ) {
      throw new Error("Item failed validation.");
    }
    const item: CalibratedItem = {
      prompt: parsed.prompt.trim(),
      choices,
      correct: String(parsed.correct).trim(),
      hint: (parsed.hint ?? "").trim() || null,
      difficultyActual: Math.max(
        1,
        Math.min(5, Number(parsed.difficulty_actual ?? input.targetDifficulty)),
      ),
      bloomsLevel: (parsed.blooms_level ?? "").trim(),
      skillMicrolabel: (parsed.skill_microlabel ?? "").trim(),
    };

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation * 2,
      success: true,
      requestSummary: `calibrated_item: ${input.standardId} d${input.targetDifficulty}`,
    });

    return { ok: true, item };
  } catch (e: any) {
    trackError(e, { route: "build-calibrated-items", userId: input.teacherId });
    return { ok: false, error: e?.message ?? "Couldn't generate the item." };
  }
}
