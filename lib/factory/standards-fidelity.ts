/**
 * Standards-fidelity judge: catches the case where the AI claims a
 * question tests RL.2.1 but actually only tests recall. One LLM judge
 * call per item; cheap (~$0.001) and a major moat for B2B trust
 * ("yes, every question is calibrated to the standard it claims").
 */

import { GoogleGenAI, Type } from "@google/genai";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fidelity: {
      type: Type.STRING,
      enum: ["aligned", "partial", "mis_tagged"],
    },
    reason: { type: Type.STRING },
  },
  required: ["fidelity", "reason"],
};

const SYSTEM = `You are a CCSS standards expert. Given a question (and optionally its passage) plus a CCSS standard ID and description, decide whether answering the question correctly REQUIRES the skill described by the standard.

Verdicts:
- aligned: solving the question genuinely demands the standard's skill. Strong signal: the standard is named in the cognitive demand of the question (e.g. "main idea" question for RL.2.2).
- partial: the question touches the standard but could be solved by a simpler skill (recall, common sense, surface re-read).
- mis_tagged: the question tests a meaningfully different standard.

Be strict. The reason field must cite WHICH skill the question actually demands and WHY that does or doesn't match the claimed standard.`;

export type FidelityVerdict = "aligned" | "partial" | "mis_tagged";

export type FidelityResult = {
  verdict: FidelityVerdict;
  reason: string;
};

/**
 * Run a fidelity check on one MCQ. Pass `passageBody` if the question
 * is grounded in a passage so the judge can verify the question really
 * requires reading it.
 */
export async function checkStandardsFidelity(input: {
  standardId: string;
  standardDescription: string;
  questionPrompt: string;
  choices: string[];
  correctAnswer: string;
  passageBody?: string | null;
}): Promise<{ ok: true; result: FidelityResult } | { ok: false; error: string }> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const userMsg = [
    `Claimed standard: ${input.standardId}`,
    `Standard description: ${input.standardDescription}`,
    "",
    input.passageBody ? `Passage:\n"""\n${input.passageBody.slice(0, 1500)}\n"""\n` : "",
    `Question: ${input.questionPrompt}`,
    `Choices: ${input.choices.map((c, i) => `(${String.fromCharCode(65 + i)}) ${c}`).join("  ")}`,
    `Correct: ${input.correctAnswer}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMsg,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.0,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      fidelity?: string;
      reason?: string;
    };
    const verdict = (
      ["aligned", "partial", "mis_tagged"] as const
    ).includes(parsed.fidelity as FidelityVerdict)
      ? (parsed.fidelity as FidelityVerdict)
      : "partial";
    return {
      ok: true,
      result: { verdict, reason: String(parsed.reason ?? "").trim() },
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Fidelity check failed." };
  }
}
