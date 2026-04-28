/**
 * Generate fresh, kid-tailored content for each Reading Buddy mode.
 *
 *   read_with_me  → a 50-90 word passage at the kid's grade, biased
 *                    toward their target patterns + a hook on what
 *                    they liked last session.
 *   quick_quiz    → same but with 3 comprehension questions attached.
 *   story_time    → a 3-4 sentence STORY OPENING on a kid-picked
 *                    topic + one prediction question Readee will ask.
 *   word_meaning  → 6 suggested vocab words the kid might ask about,
 *                    drawn from their recent buddy_memories +
 *                    grade-appropriate vocab if not enough.
 *
 * Margin: 1 Gemini text call per generation ≈ \$0.005. Charged 1
 * credit so Readee can absorb most of these as "wow factor" cost.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";
import { loadRecentMemories } from "@/lib/ai/buddy-memory";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

export type GenerateInput = {
  mode: "read_with_me" | "quick_quiz" | "story_time" | "word_meaning";
  childId: string | null;
  theme?: string | null;
  /** Caller can pass a hint to bias generation, e.g. "easier" / "scarier" / "about dragons" */
  remix?: string | null;
};

export type GeneratedContent =
  | {
      mode: "read_with_me";
      title: string;
      passage: string;
      gradeLevel: string;
      targetPattern?: string | null;
    }
  | {
      mode: "quick_quiz";
      title: string;
      passage: string;
      gradeLevel: string;
      questions: { prompt: string; choices: string[]; correct: string }[];
    }
  | {
      mode: "story_time";
      topic: string;
      opening: string;
      predictionPrompt: string;
    }
  | {
      mode: "word_meaning";
      suggestions: { word: string; reason: string }[];
    };

async function fetchKidContext(childId: string | null): Promise<{
  firstName: string | null;
  grade: string;
  targetPatterns: string[];
  recentSummaries: string[];
}> {
  if (!childId) {
    return { firstName: null, grade: "2nd", targetPatterns: [], recentSummaries: [] };
  }
  try {
    const supabase = await createClient();
    const { data: child } = await supabase
      .from("children")
      .select("name, reading_level")
      .eq("id", childId)
      .maybeSingle();
    const firstName = ((child as any)?.name ?? "").split(" ")[0] || null;
    const grade = (child as any)?.reading_level ?? "2nd";

    const { data: fluency } = await supabase
      .from("fluency_readings")
      .select("target_patterns")
      .eq("child_id", childId)
      .order("updated_at", { ascending: false })
      .limit(1);
    const tp = ((fluency ?? []) as any[])[0]?.target_patterns;
    const targetPatterns = Array.isArray(tp) ? tp.slice(0, 3) : [];

    const memories = await loadRecentMemories({ childId, limit: 3 });
    const recentSummaries = memories.map((m) => m.summary);

    return { firstName, grade, targetPatterns, recentSummaries };
  } catch {
    return { firstName: null, grade: "2nd", targetPatterns: [], recentSummaries: [] };
  }
}

const PASSAGE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    passage: { type: Type.STRING },
  },
  required: ["title", "passage"],
};

const QUIZ_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    passage: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          prompt: { type: Type.STRING },
          choices: { type: Type.ARRAY, items: { type: Type.STRING } },
          correct: { type: Type.STRING },
        },
        required: ["prompt", "choices", "correct"],
      },
    },
  },
  required: ["title", "passage", "questions"],
};

const STORY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    opening: { type: Type.STRING },
    prediction_prompt: { type: Type.STRING },
  },
  required: ["topic", "opening", "prediction_prompt"],
};

const WORDS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["word", "reason"],
      },
    },
  },
  required: ["suggestions"],
};

const GRADE_WORDS: Record<string, string> = {
  K: "30-50",
  "1st": "50-90",
  "2nd": "80-120",
  "3rd": "120-180",
  "4th": "150-220",
};

export async function generateBuddyContent(input: GenerateInput): Promise<
  { ok: true; content: GeneratedContent } | { ok: false; error: string }
> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const ctx = await fetchKidContext(input.childId);
  const wordRange = GRADE_WORDS[ctx.grade] ?? "80-120";
  const personaLine = ctx.firstName
    ? `The reader is ${ctx.firstName}, a ${ctx.grade} grader.`
    : `The reader is a ${ctx.grade} grader.`;
  const targetLine =
    ctx.targetPatterns.length > 0
      ? `Bias the writing toward these phonics/skill targets the reader is working on: ${ctx.targetPatterns.join(", ")}.`
      : "";
  const memoryLine =
    ctx.recentSummaries.length > 0
      ? `Recent buddy memories (you can callback to these subtly):\n${ctx.recentSummaries.map((s) => "  - " + s).join("\n")}`
      : "";
  const remixLine = input.remix?.trim() ? `Remix request: ${input.remix.trim()}` : "";

  try {
    if (input.mode === "read_with_me") {
      const sys = `You write short fresh reading passages for a Reading Buddy session. Today the kid is doing READ-WITH-ME — they will read your passage out loud. Make it engaging and fun.

Rules:
- Length: ${wordRange} words.
- Grade-appropriate vocabulary.
- One small problem + small resolution. Warm, kid-safe.
- Use the reader's name naturally, but only ONCE if at all.
- Keep sentences readable for an out-loud reader (not too long).
- Title ≤ 6 words.
Return ONLY the JSON.`;
      const prompt = [personaLine, targetLine, memoryLine, remixLine, "Write the passage."]
        .filter(Boolean)
        .join("\n");
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: prompt,
        config: {
          systemInstruction: sys,
          responseMimeType: "application/json",
          responseSchema: PASSAGE_SCHEMA,
          temperature: 0.95,
        },
      });
      const parsed = JSON.parse(response.text ?? "{}") as { title?: string; passage?: string };
      await logUsage({
        teacherId: input.childId ?? "anonymous",
        kind: "passage_generation",
        model: MODEL_ID,
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
        creditsUsed: CREDIT_COST.passage_generation,
        success: true,
        requestSummary: `buddy_content read_with_me: ${parsed.title ?? "—"}`,
      });
      return {
        ok: true,
        content: {
          mode: "read_with_me",
          title: (parsed.title ?? "A New Story").trim(),
          passage: (parsed.passage ?? "").trim(),
          gradeLevel: ctx.grade,
          targetPattern: ctx.targetPatterns[0] ?? null,
        },
      };
    }

    if (input.mode === "quick_quiz") {
      const sys = `You write a short reading passage + 3 comprehension questions for a quick quiz. Kid will read the passage, then Readee will ask the questions.

Rules:
- Passage: ${wordRange} words. Same fiction/non-fiction balance as a typical lesson.
- 3 multiple-choice questions, each with EXACTLY 4 choices, one correct. Vary across literal recall, inference, and vocabulary in context.
- Title ≤ 6 words.
Return ONLY the JSON.`;
      const prompt = [personaLine, targetLine, memoryLine, remixLine, "Write the passage + 3 MCQs."]
        .filter(Boolean)
        .join("\n");
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: prompt,
        config: {
          systemInstruction: sys,
          responseMimeType: "application/json",
          responseSchema: QUIZ_SCHEMA,
          temperature: 0.85,
        },
      });
      const parsed = JSON.parse(response.text ?? "{}") as {
        title?: string;
        passage?: string;
        questions?: { prompt: string; choices: string[]; correct: string }[];
      };
      await logUsage({
        teacherId: input.childId ?? "anonymous",
        kind: "passage_generation",
        model: MODEL_ID,
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
        creditsUsed: CREDIT_COST.passage_generation,
        success: true,
        requestSummary: `buddy_content quick_quiz: ${parsed.title ?? "—"}`,
      });
      return {
        ok: true,
        content: {
          mode: "quick_quiz",
          title: (parsed.title ?? "Quick Read").trim(),
          passage: (parsed.passage ?? "").trim(),
          gradeLevel: ctx.grade,
          questions: (parsed.questions ?? []).slice(0, 3).map((q) => ({
            prompt: q.prompt,
            choices: q.choices,
            correct: q.correct,
          })),
        },
      };
    }

    if (input.mode === "story_time") {
      const sys = `You're Readee opening a brand new short story for a kid. Write the FIRST 3-4 sentences only — a hook, a character, a hint of conflict — and end with a SINGLE prediction question for the kid to answer ("what do you think will happen?").

Rules:
- Grade-appropriate.
- Warm, kid-safe. No scary content.
- Topic comes from the input. If no topic, pick something fun.
- Use the reader's name naturally if it fits.
Return ONLY the JSON.`;
      const topicLine = input.theme?.trim()
        ? `Topic: ${input.theme.trim()}.`
        : `Topic: pick something fun (e.g. dragons, space, friendship, mystery).`;
      const prompt = [personaLine, topicLine, memoryLine, remixLine, "Write the story opening."]
        .filter(Boolean)
        .join("\n");
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: prompt,
        config: {
          systemInstruction: sys,
          responseMimeType: "application/json",
          responseSchema: STORY_SCHEMA,
          temperature: 1.0,
        },
      });
      const parsed = JSON.parse(response.text ?? "{}") as {
        topic?: string;
        opening?: string;
        prediction_prompt?: string;
      };
      await logUsage({
        teacherId: input.childId ?? "anonymous",
        kind: "passage_generation",
        model: MODEL_ID,
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
        creditsUsed: CREDIT_COST.passage_generation,
        success: true,
        requestSummary: `buddy_content story: ${parsed.topic ?? "—"}`,
      });
      return {
        ok: true,
        content: {
          mode: "story_time",
          topic: (parsed.topic ?? input.theme ?? "Adventure").trim(),
          opening: (parsed.opening ?? "").trim(),
          predictionPrompt: (parsed.prediction_prompt ?? "What do you think happens next?").trim(),
        },
      };
    }

    if (input.mode === "word_meaning") {
      const sys = `Suggest 6 interesting vocabulary words a ${ctx.grade} grader might ask about today. Pick words slightly above grade level — words that feel grown-up but are reachable. Mix concrete and abstract. Avoid words the kid has already asked about (in memory). Each gets a short kid-friendly reason it's interesting.

Rules:
- 6 words exactly.
- Each "reason" ≤ 10 words.
Return ONLY the JSON.`;
      const prompt = [personaLine, targetLine, memoryLine, remixLine, "Pick 6 words."]
        .filter(Boolean)
        .join("\n");
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: prompt,
        config: {
          systemInstruction: sys,
          responseMimeType: "application/json",
          responseSchema: WORDS_SCHEMA,
          temperature: 0.9,
        },
      });
      const parsed = JSON.parse(response.text ?? "{}") as {
        suggestions?: { word: string; reason: string }[];
      };
      await logUsage({
        teacherId: input.childId ?? "anonymous",
        kind: "passage_generation",
        model: MODEL_ID,
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
        creditsUsed: CREDIT_COST.passage_generation,
        success: true,
        requestSummary: `buddy_content words`,
      });
      return {
        ok: true,
        content: {
          mode: "word_meaning",
          suggestions: (parsed.suggestions ?? []).slice(0, 6).map((s) => ({
            word: s.word,
            reason: s.reason,
          })),
        },
      };
    }

    return { ok: false, error: "Unknown mode." };
  } catch (e: any) {
    trackError(e, { route: "buddy-content.generate", tags: { mode: input.mode } });
    return { ok: false, error: e?.message ?? "Generation failed." };
  }
}
