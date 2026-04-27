/**
 * IEP / 504 progress note generator.
 *
 * Teacher feeds in a kid's recent practice + lesson + assignment data.
 * Gemini drafts a structured progress note that follows the standard
 * IEP/504 reporting format: present levels of performance, evidence
 * data, progress toward annual goal, recommended next supports.
 *
 * Districts will pay separately for this — it saves SPED teachers
 * 30+ min per quarterly report. Suggested SKU: "Progress Note Pack"
 * at \$2/student/year for districts.
 *
 * Margin: 1 Gemini call ≈ \$0.005 (input is text-heavy, ~3K tokens),
 * charged 4 credits. ~80% gross margin.
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

const SYSTEM = `You are an expert special-education teacher writing an IEP/504 progress note. Produce ONE professionally-toned, family-readable progress note that follows the format below. Keep it factual and evidence-based — quote the supplied data points verbatim where useful.

FORMAT (each section a short paragraph):

PRESENT LEVELS OF PERFORMANCE (PLOP):
A 2-3 sentence snapshot of where the student is reading right now, grounded in the supplied practice and assignment data.

EVIDENCE OF PROGRESS:
2-3 sentences citing specific data points (accuracy %, WCPM, lessons mastered, assignments completed). Use the actual numbers from the data — do not make any up.

PROGRESS TOWARD ANNUAL GOAL:
One sentence on whether the student is "making expected progress," "exceeding expectations," or "below expected progress" toward the annual goal. Justify in one more sentence.

RECOMMENDED NEXT SUPPORTS:
2-3 specific instructional supports for the next reporting period. Be concrete (e.g., "small-group decoding practice 3x/week with focus on r-controlled vowels").

Tone: professional, warm, parent-readable. NEVER pathologize or label. Refer to the student by first name only.

Anti-hallucination: if a data field isn't supplied, say "data not provided" rather than inventing a number. Do not infer a diagnosis or eligibility category.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    plop: { type: Type.STRING },
    evidence: { type: Type.STRING },
    progress_toward_goal: { type: Type.STRING },
    recommended_supports: { type: Type.STRING },
    one_line_summary: { type: Type.STRING },
  },
  required: ["plop", "evidence", "progress_toward_goal", "recommended_supports"],
};

export type IepNote = {
  plop: string;
  evidence: string;
  progressTowardGoal: string;
  recommendedSupports: string;
  oneLineSummary: string;
};

export async function draftIepProgressNote(input: {
  teacherId: string;
  studentFirstName: string;
  gradeLevel: string;
  annualGoal: string;
  reportingPeriod: string;
  metricsBlock: string;
  recentMastery: string;
}): Promise<{ ok: true; note: IepNote } | { ok: false; error: string }> {
  if (!input.studentFirstName.trim()) {
    return { ok: false, error: "Student first name required." };
  }

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const userMsg = [
    `Student: ${input.studentFirstName.trim()}`,
    `Grade: ${input.gradeLevel}`,
    `Reporting period: ${input.reportingPeriod}`,
    "",
    `Annual goal:`,
    input.annualGoal.trim(),
    "",
    `Recent metrics:`,
    input.metricsBlock.trim(),
    "",
    `Recent mastery / completion:`,
    input.recentMastery.trim(),
    "",
    `Draft the progress note per the schema. Use the actual numbers — do not invent any.`,
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
      plop: string;
      evidence: string;
      progress_toward_goal: string;
      recommended_supports: string;
      one_line_summary: string;
    }>;
    const note: IepNote = {
      plop: (parsed.plop ?? "").trim(),
      evidence: (parsed.evidence ?? "").trim(),
      progressTowardGoal: (parsed.progress_toward_goal ?? "").trim(),
      recommendedSupports: (parsed.recommended_supports ?? "").trim(),
      oneLineSummary: (parsed.one_line_summary ?? "").trim(),
    };

    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.passage_generation * 4,
      success: true,
      requestSummary: `iep_note: ${input.studentFirstName.slice(0, 60)}`,
    });

    return { ok: true, note };
  } catch (e: any) {
    trackError(e, { route: "build-iep-note", userId: input.teacherId });
    return { ok: false, error: e?.message ?? "Couldn't draft the note." };
  }
}
