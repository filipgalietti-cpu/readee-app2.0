import { Type } from "@google/genai";
import { getClient, MODEL_ID } from "@/lib/ai/readee-ai";
import { trackError } from "@/lib/observability/track";

/**
 * The facts a parent snapshot is grounded in. Computed deterministically in the
 * client from real practice_results, then handed to Gemini so the model only
 * ever WORDS the numbers — it never invents them. This "grounded-hybrid" split
 * keeps the copy warm + specific without letting the LLM hallucinate progress.
 */
export type SnapshotFacts = {
  firstName: string;
  gradeLabel: string;
  /** "reading on grade level" etc., or null when there isn't enough signal yet. */
  standing: string | null;
  questionsThisWeek: number;
  /** 0–100, or null when no questions this week. */
  accuracyThisWeek: number | null;
  /** days practiced out of the last 7 */
  daysThisWeek: number;
  streak: number;
  bestStreak: number;
  strongestSkill: string | null;
  weakestSkill: string | null;
  trend: "up" | "down" | "flat" | null;
};

export type ParentSnapshot = { headline: string; action: string };

const SYSTEM = `You write a warm, five-second "flash snapshot" a busy parent reads about their K-4 child's reading progress in the Readee app.

Return JSON with two fields:
- "headline" — at most two sentences, plain and warm. Lead with how the child is doing (grade standing and/or accuracy), work in their effort or streak, and name their STRONGEST skill. Always use the child's first name.
- "action" — ONE concrete thing the parent can do with the child this week, tied to their WEAKEST skill. One short sentence.

Hard rules:
- Use ONLY the numbers and skill names provided. NEVER invent a statistic, skill, or milestone.
- If data is sparse, be honest and gentle ("It's early days, but…").
- No jargon — say "matching letters to their sounds," not "phonemic awareness."
- No empty cheerleading ("Great job!") and no alarm. Encouraging and specific.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING },
    action: { type: Type.STRING },
  },
  required: ["headline", "action"],
};

export async function buildParentSnapshot(facts: SnapshotFacts): Promise<ParentSnapshot | null> {
  const prompt = `Child: ${facts.firstName} (${facts.gradeLabel})
Grade standing: ${facts.standing ?? "not enough data yet"}
This week: ${facts.questionsThisWeek} questions, ${facts.accuracyThisWeek == null ? "n/a" : facts.accuracyThisWeek + "%"} accuracy, practiced ${facts.daysThisWeek} of the last 7 days
Streak: ${facts.streak} day${facts.streak === 1 ? "" : "s"} (best ever: ${facts.bestStreak})
Strongest skill: ${facts.strongestSkill ?? "n/a"}
Needs the most work: ${facts.weakestSkill ?? "n/a"}
Accuracy trend: ${facts.trend ?? "n/a"}

Write the snapshot now.`;

  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.6,
      },
    });
    const parsed = JSON.parse(response.text || "{}") as Partial<ParentSnapshot>;
    if (!parsed.headline || !parsed.action) return null;
    return { headline: parsed.headline, action: parsed.action };
  } catch (e) {
    trackError(e, { route: "build-parent-snapshot" });
    return null;
  }
}
