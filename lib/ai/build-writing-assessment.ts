/**
 * Student writing assessment.
 *
 * Kid types or dictates a response to a prompt. Gemini scores it
 * against a 4-domain rubric (ideas, organization, voice, conventions),
 * gives kid-friendly feedback, and flags growth areas.
 *
 * Margin: 1 Gemini call ≈ $0.005. Charge 3 credits as B2B value.
 * For B2C, Readee+ unlocks unlimited writing checks.
 *
 * Upcharge: districts pay extra for "automated writing rubric" — the
 * 4-point CCSS-aligned scale is what state-test prep relies on. This
 * is a candidate paid add-on for districts ($1/student/year).
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

const SYSTEM = `You are Readee, a K-4 reading specialist scoring a student's writing response. Use a CCSS-aligned 4-domain rubric:

- ideas (1-4):           Does the response stay on the prompt? Are ideas relevant and developed?
- organization (1-4):    Is there a beginning, middle, end? Logical order? Transitions?
- voice (1-4):           Does the writing sound like a real kid? Is the audience considered?
- conventions (1-4):     Capitalization, end punctuation, spelling, complete sentences. Be lenient for K-2.

Scoring scale (each domain): 1 = beginning, 2 = developing, 3 = proficient, 4 = above grade level.

Be developmentally appropriate. A 1st grader writing "I lik my dog he is brown" with a heart drawing is proficient on ideas/voice for that grade — don't dock for spelling severity.

Rules for feedback:
- One specific strength sentence ("You used the word 'gigantic' — what a great choice!").
- One specific growth tip in kid-friendly language ("Next time, try adding ONE detail about how it felt.").
- No grades like "C+", no harsh language, no comparisons to other students.
- Stay safe — refuse anything off-topic or unsafe.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ideas: { type: Type.INTEGER },
    organization: { type: Type.INTEGER },
    voice: { type: Type.INTEGER },
    conventions: { type: Type.INTEGER },
    overall_band: { type: Type.STRING },
    strength: { type: Type.STRING },
    growth_tip: { type: Type.STRING },
    encouraging_close: { type: Type.STRING },
  },
  required: ["ideas", "organization", "voice", "conventions", "overall_band", "strength", "growth_tip"],
};

export type WritingAssessment = {
  ideas: number;
  organization: number;
  voice: number;
  conventions: number;
  overallBand: string;
  strength: string;
  growthTip: string;
  encouragingClose: string;
};

export async function assessWriting(input: {
  userId: string;
  prompt: string;
  response: string;
  gradeLevel?: string | null;
}): Promise<{ ok: true; assessment: WritingAssessment } | { ok: false; error: string }> {
  const r = input.response.trim();
  if (r.length < 10) return { ok: false, error: "Write at least one sentence first." };

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const userMsg = [
    `Grade level: ${input.gradeLevel ?? "unknown"}`,
    "",
    `Prompt the student was given:`,
    `"""`,
    input.prompt.trim(),
    `"""`,
    "",
    `Student's response:`,
    `"""`,
    r,
    `"""`,
    "",
    "Score per the schema. Be developmentally appropriate.",
  ].join("\n");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: userMsg,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.4,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as Partial<{
      ideas: number;
      organization: number;
      voice: number;
      conventions: number;
      overall_band: string;
      strength: string;
      growth_tip: string;
      encouraging_close: string;
    }>;
    const clamp = (n: any) => Math.max(1, Math.min(4, Number(n) || 1));
    const assessment: WritingAssessment = {
      ideas: clamp(parsed.ideas),
      organization: clamp(parsed.organization),
      voice: clamp(parsed.voice),
      conventions: clamp(parsed.conventions),
      overallBand: (parsed.overall_band ?? "").trim(),
      strength: (parsed.strength ?? "").trim(),
      growthTip: (parsed.growth_tip ?? "").trim(),
      encouragingClose: (parsed.encouraging_close ?? "").trim(),
    };

    await logUsage({
      teacherId: input.userId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.passage_generation * 3,
      success: true,
      requestSummary: `writing_assess: ${input.prompt.slice(0, 80)}`,
    });

    return { ok: true, assessment };
  } catch (e: any) {
    trackError(e, { route: "build-writing-assessment", userId: input.userId });
    return { ok: false, error: e?.message ?? "Couldn't score that response." };
  }
}
