/**
 * IEP / 504 progress note generator.
 *
 * Teacher feeds in a kid's recent practice + lesson + running-records
 * data. Gemini drafts a structured progress note that follows the
 * federally-required IEP format: present levels of performance (PLOP),
 * evidence of progress (with concrete numbers), progress toward annual
 * goal (with a formal IDEA-aligned status code), and recommended next
 * supports.
 *
 * Districts will pay separately for this — it saves SPED case managers
 * 30+ min per quarterly report. Suggested SKU: "Progress Note Pack"
 * at $2/student/year for districts.
 *
 * Margin: 1 Gemini call ≈ $0.005 (input is text-heavy, ~3K tokens),
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

const PROGRESS_STATUS_CODES = [
  "on_track",
  "adequate_progress",
  "insufficient_progress",
  "mastered",
  "not_yet_introduced",
] as const;
export type ProgressStatus = (typeof PROGRESS_STATUS_CODES)[number];

const SYSTEM = `You are an expert special-education case manager writing an IEP/504 progress note. Produce ONE professionally-toned, family-readable progress note that meets the federal IDEA §300.320(a)(3) requirements.

FORMAT (each section a short paragraph):

PRESENT LEVELS OF PERFORMANCE (PLOP):
A 3-4 sentence snapshot of where the student is reading right now, grounded in the supplied practice, lesson, AND running-record data when present. Lead with quantitative anchors (WCPM, accuracy %, mastery counts) before qualitative context. If reading-level placement is supplied, name it.

EVIDENCE OF PROGRESS:
3-4 sentences citing specific data points. Always show baseline-vs-current when both are supplied (e.g., "WCPM rose from 38 to 47 across this period"). Reference standard IDs only when relevant. Prefer trend language ("trending upward", "plateaued", "regressed slightly") over single snapshots.

PROGRESS TOWARD ANNUAL GOAL:
2-3 sentences. State explicitly whether the student is on track to meet the goal by the target date, citing the supplied criterion. Justify with the data already cited above.

RECOMMENDED NEXT SUPPORTS:
3-4 concrete instructional supports for the next reporting period. Each should specify the WHAT, the FREQUENCY, and the EXPECTED OUTCOME (e.g., "Decoding push-in 3x/week, 15 min, focused on r-controlled vowels — expect 5 WCPM gain by next probe"). When running-record miscues are supplied, target them by pattern.

PROGRESS STATUS CODE:
Pick exactly one of: on_track | adequate_progress | insufficient_progress | mastered | not_yet_introduced.
- on_track: trajectory will hit the goal by target date
- adequate_progress: forward movement, but slower than ideal — should still meet goal
- insufficient_progress: not enough movement; goal at risk, supports must change
- mastered: criterion already met
- not_yet_introduced: instruction has not yet started against this goal

ONE-LINE SUMMARY:
A single sentence (max 30 words) that a busy parent could read at a glance.

Tone: professional, warm, parent-readable. NEVER pathologize or label. Refer to the student by first name only.

Anti-hallucination: if a data field isn't supplied, say "data not provided" rather than inventing a number. Do not infer a diagnosis or eligibility category. If practice + running-record + lesson data are ALL empty, set progress_status to "not_yet_introduced" and recommend a baseline probe in the supports section.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    plop: { type: Type.STRING },
    evidence: { type: Type.STRING },
    progress_toward_goal: { type: Type.STRING },
    recommended_supports: { type: Type.STRING },
    progress_status: {
      type: Type.STRING,
      enum: [...PROGRESS_STATUS_CODES],
    },
    one_line_summary: { type: Type.STRING },
  },
  required: [
    "plop",
    "evidence",
    "progress_toward_goal",
    "recommended_supports",
    "progress_status",
    "one_line_summary",
  ],
};

export type IepNote = {
  plop: string;
  evidence: string;
  progressTowardGoal: string;
  recommendedSupports: string;
  progressStatus: ProgressStatus;
  oneLineSummary: string;
};

export async function draftIepProgressNote(input: {
  teacherId: string;
  studentFirstName: string;
  gradeLevel: string;
  annualGoal: string;
  goalBaseline?: string | null;
  goalTargetCriterion?: string | null;
  goalTargetDate?: string | null;
  reportingPeriod: string;
  metricsBlock: string;
  baselineVsCurrent?: string | null;
  recentMastery: string;
  runningRecords?: string | null;
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

  const lines: string[] = [
    `Student: ${input.studentFirstName.trim()}`,
    `Grade: ${input.gradeLevel}`,
    `Reporting period: ${input.reportingPeriod}`,
    "",
    `Annual goal:`,
    input.annualGoal.trim(),
  ];
  if (input.goalBaseline) lines.push(`Goal baseline: ${input.goalBaseline}`);
  if (input.goalTargetCriterion)
    lines.push(`Goal target criterion: ${input.goalTargetCriterion}`);
  if (input.goalTargetDate) lines.push(`Goal target date: ${input.goalTargetDate}`);
  lines.push(
    "",
    `Recent practice metrics:`,
    input.metricsBlock.trim() || "No recent practice data.",
  );
  if (input.baselineVsCurrent) {
    lines.push("", `Baseline vs current trend:`, input.baselineVsCurrent.trim());
  }
  lines.push(
    "",
    `Recent lesson mastery:`,
    input.recentMastery.trim() || "No recent lesson activity.",
  );
  if (input.runningRecords) {
    lines.push("", `Running records (most recent first):`, input.runningRecords.trim());
  }
  lines.push(
    "",
    `Draft the progress note per the schema. Use the actual numbers — do not invent any. Pick the progress_status code that best matches the data.`,
  );

  const userMsg = lines.join("\n");

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
      progress_status: string;
      one_line_summary: string;
    }>;

    const status = (parsed.progress_status ?? "not_yet_introduced") as string;
    const safeStatus: ProgressStatus = (PROGRESS_STATUS_CODES as readonly string[]).includes(
      status,
    )
      ? (status as ProgressStatus)
      : "not_yet_introduced";

    const note: IepNote = {
      plop: (parsed.plop ?? "").trim(),
      evidence: (parsed.evidence ?? "").trim(),
      progressTowardGoal: (parsed.progress_toward_goal ?? "").trim(),
      recommendedSupports: (parsed.recommended_supports ?? "").trim(),
      progressStatus: safeStatus,
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
