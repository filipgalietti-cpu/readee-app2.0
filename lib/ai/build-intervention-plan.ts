/**
 * Intervention Plan generator. Given a kid's IEP goal + recent data,
 * Gemini drafts a 2-week mini-plan: what to teach, when, with what
 * Readee material, and what to expect by the next probe.
 *
 * This is the "what do I do Monday?" tool — the natural next step
 * after the progress note diagnoses the gap. Where the progress note
 * is descriptive (here is what is), the plan is prescriptive (here
 * is what to do next).
 *
 * Output is JSON so the UI can render structured tabs (per-day blocks,
 * material lists, probe schedule) AND a "Push to kid" button can turn
 * recommended materials into actual assignment rows.
 *
 * Cost: 1 Gemini call ≈ $0.005, charged 4 credits. Same SKU posture
 * as IEP progress notes — district add-on.
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

const SYSTEM = `You are a special-education interventionist drafting a 2-week mini-plan against a single IEP goal. The plan must be:

CONCRETE — every session names the WHAT, the FREQUENCY, and the EXPECTED CRITERION at the next probe. No vague "practice fluency" — say "cold-read 2x/week, target 5 WCPM gain."

EVIDENCE-BASED — when running-record miscues are supplied, the plan must target those specific patterns (r-controlled vowels, blends, sight words, etc.). When practice trend data is supplied, the plan must respond to it (insufficient progress on RL.X.Y → re-teach prerequisite skill).

SAFE — never prescribe a Tier-3 intervention program by name. Stick to instructional moves a regular teacher can run with Readee resources. Defer Tier-3 selection to the school psych / SPED specialist with: "If insufficient progress at next probe, escalate to the IEP team for Tier-3 intervention selection."

PRACTICAL — exactly 4 sessions per week of 10-20 min each, intended to run Mon-Thu (Friday is reserved for the weekly fluency probe and is NOT a session). Mix skill-focused practice with grade-level exposure. The teacher will tell you the cycle length (1-4 weeks) — the plan must contain exactly that many weekly_blocks, each with exactly 4 sessions. This is one cycle in a longer intervention arc; you'll re-plan after the next probe.

CYCLE CONTEXT — when the user message names a "Cycles remaining" count, the plan you draft is one of that many cycles between now and the goal target date. If the user message names this as the FINAL cycle (cyclesRemaining: 1), explicitly state in the summary that this is the last cycle before the goal target — the plan should consolidate gains and ramp probe frequency.

OUTPUT SHAPE — JSON with these top-level fields:
- summary (1-2 sentences naming the focus skill and the expected outcome)
- focus_skills (array of 1-3 short labels — e.g. "r-controlled vowels", "sight-word automaticity")
- weekly_blocks (array of 2 weeks, each with 4-5 sessions; each session has day_label, duration_min, activity, material_hint, expected_outcome)
- probe_schedule (1-2 lines on when to re-probe and what to compare to)
- expected_criterion (1 sentence on what success looks like at end of week 2)
- escalation_trigger (1 sentence: under what data condition do you escalate to the IEP team)
- caregiver_note (1-2 parent-readable sentences, optional)

material_hint is the human-readable description shown to the teacher. In addition, you must emit STRUCTURED resolver fields per session so Readee can auto-match the material to a real assignable lesson:

- material_kind: "lesson" | "passage" | "fluency_probe" | "teacher_led"
  • "lesson" → standards-aligned practice (Readee will push a readee_lesson assignment for the named standard)
  • "passage" → reading a leveled passage (Readee will push a leveled passage assignment when one matches)
  • "fluency_probe" → cold-read or repeated-read with a timer (NOT auto-assigned; teacher-led)
  • "teacher_led" → small-group instruction, conferencing, anything the teacher runs in person (NOT auto-assigned)
- standard_id: a CCSS code like "RF.1.3b", "RL.2.1", "L.1.4", or null. REQUIRED when material_kind is "lesson". Use the standard the activity targets — not just the closest one.
- grade: "K" | "1st" | "2nd" | "3rd" | "4th" | null. The grade level the material should be at, which may be BELOW the student's enrolled grade (interventions often regress to mastered prerequisites).

Don't invent specific lesson IDs — the resolver maps standard_id + grade to a real lesson at runtime.

Tone: professional, action-oriented. Refer to the student by first name only.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    focus_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    weekly_blocks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week_label: { type: Type.STRING },
          sessions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day_label: { type: Type.STRING },
                duration_min: { type: Type.INTEGER },
                activity: { type: Type.STRING },
                material_hint: { type: Type.STRING },
                expected_outcome: { type: Type.STRING },
                material_kind: {
                  type: Type.STRING,
                  enum: ["lesson", "passage", "fluency_probe", "teacher_led"],
                },
                standard_id: { type: Type.STRING },
                grade: { type: Type.STRING },
              },
              required: [
                "day_label",
                "duration_min",
                "activity",
                "material_hint",
                "expected_outcome",
                "material_kind",
              ],
            },
          },
        },
        required: ["week_label", "sessions"],
      },
    },
    probe_schedule: { type: Type.STRING },
    expected_criterion: { type: Type.STRING },
    escalation_trigger: { type: Type.STRING },
    caregiver_note: { type: Type.STRING },
  },
  required: [
    "summary",
    "focus_skills",
    "weekly_blocks",
    "probe_schedule",
    "expected_criterion",
    "escalation_trigger",
  ],
};

export type MaterialKind = "lesson" | "passage" | "fluency_probe" | "teacher_led";

export type InterventionSession = {
  dayLabel: string;
  durationMin: number;
  activity: string;
  materialHint: string;
  expectedOutcome: string;
  materialKind: MaterialKind;
  standardId: string | null;
  grade: string | null;
};

export type InterventionWeek = {
  weekLabel: string;
  sessions: InterventionSession[];
};

export type InterventionPlan = {
  summary: string;
  focusSkills: string[];
  weeklyBlocks: InterventionWeek[];
  probeSchedule: string;
  expectedCriterion: string;
  escalationTrigger: string;
  caregiverNote: string | null;
};

export async function draftInterventionPlan(input: {
  teacherId: string;
  studentFirstName: string;
  gradeLevel: string;
  annualGoal: string;
  goalBaseline?: string | null;
  goalTargetCriterion?: string | null;
  goalTargetDate?: string | null;
  metricsBlock: string;
  baselineVsCurrent?: string | null;
  recentMastery: string;
  runningRecords?: string | null;
  recentNoteSummary?: string | null;
  cycleWeeks?: number;
  cyclesRemaining?: number | null;
  daysToGoalTarget?: number | null;
}): Promise<{ ok: true; plan: InterventionPlan } | { ok: false; error: string }> {
  if (!input.studentFirstName.trim()) {
    return { ok: false, error: "Student first name required." };
  }

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const cycleWeeks = Math.max(1, Math.min(4, input.cycleWeeks ?? 2));
  const lines: string[] = [
    `Student: ${input.studentFirstName.trim()}`,
    `Grade: ${input.gradeLevel}`,
    `Cycle length: ${cycleWeeks} week${cycleWeeks === 1 ? "" : "s"} (emit exactly ${cycleWeeks} weekly_blocks)`,
    "",
    `Annual goal:`,
    input.annualGoal.trim(),
  ];
  if (input.goalBaseline) lines.push(`Baseline: ${input.goalBaseline}`);
  if (input.goalTargetCriterion) lines.push(`Target criterion: ${input.goalTargetCriterion}`);
  if (input.goalTargetDate) lines.push(`Target date: ${input.goalTargetDate}`);
  if (typeof input.daysToGoalTarget === "number" && input.daysToGoalTarget > 0) {
    lines.push(`Days remaining to target: ${input.daysToGoalTarget}`);
  }
  if (typeof input.cyclesRemaining === "number" && input.cyclesRemaining > 0) {
    lines.push(
      `Cycles remaining (including this one): ${input.cyclesRemaining}${
        input.cyclesRemaining === 1 ? " — THIS IS THE FINAL CYCLE BEFORE GOAL TARGET" : ""
      }`,
    );
  }
  lines.push("", `Recent practice:`, input.metricsBlock.trim() || "No recent practice data.");
  if (input.baselineVsCurrent) {
    lines.push("", `Baseline vs current trend:`, input.baselineVsCurrent.trim());
  }
  lines.push(
    "",
    `Recent lesson mastery:`,
    input.recentMastery.trim() || "No recent lesson activity.",
  );
  if (input.runningRecords) {
    lines.push("", `Running records:`, input.runningRecords.trim());
  }
  if (input.recentNoteSummary) {
    lines.push("", `Most recent progress note summary:`, input.recentNoteSummary.trim());
  }
  lines.push("", `Draft a 2-week intervention plan per the schema.`);

  const userMsg = lines.join("\n");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: userMsg,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.5,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as any;
    const plan: InterventionPlan = {
      summary: String(parsed.summary ?? "").trim(),
      focusSkills: Array.isArray(parsed.focus_skills)
        ? parsed.focus_skills.map((s: any) => String(s).trim()).filter(Boolean)
        : [],
      weeklyBlocks: Array.isArray(parsed.weekly_blocks)
        ? parsed.weekly_blocks.map((w: any) => ({
            weekLabel: String(w?.week_label ?? "").trim() || "Week",
            sessions: Array.isArray(w?.sessions)
              ? w.sessions.map((s: any) => {
                  const rawKind = String(s?.material_kind ?? "").trim();
                  const kind: MaterialKind = (
                    ["lesson", "passage", "fluency_probe", "teacher_led"] as const
                  ).includes(rawKind as MaterialKind)
                    ? (rawKind as MaterialKind)
                    : "teacher_led";
                  return {
                    dayLabel: String(s?.day_label ?? "").trim() || "Day",
                    durationMin: Number.isFinite(s?.duration_min) ? Number(s.duration_min) : 15,
                    activity: String(s?.activity ?? "").trim(),
                    materialHint: String(s?.material_hint ?? "").trim(),
                    expectedOutcome: String(s?.expected_outcome ?? "").trim(),
                    materialKind: kind,
                    standardId: s?.standard_id ? String(s.standard_id).trim() : null,
                    grade: s?.grade ? String(s.grade).trim() : null,
                  };
                })
              : [],
          }))
        : [],
      probeSchedule: String(parsed.probe_schedule ?? "").trim(),
      expectedCriterion: String(parsed.expected_criterion ?? "").trim(),
      escalationTrigger: String(parsed.escalation_trigger ?? "").trim(),
      caregiverNote: parsed.caregiver_note ? String(parsed.caregiver_note).trim() : null,
    };

    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.passage_generation * 4,
      success: true,
      requestSummary: `iep_plan: ${input.studentFirstName.slice(0, 60)}`,
    });

    return { ok: true, plan };
  } catch (e: any) {
    trackError(e, { route: "build-intervention-plan", userId: input.teacherId });
    return { ok: false, error: e?.message ?? "Couldn't draft the plan." };
  }
}
