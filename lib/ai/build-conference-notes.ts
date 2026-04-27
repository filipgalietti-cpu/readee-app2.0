/**
 * Conference notes generator. Teacher clicks "Generate" on a student
 * — Readee.ai reads the kid's practice_results, assignment_submissions,
 * and learning path progress, and writes a 2-paragraph editable summary
 * the teacher can drop into a parent conference doc / email.
 *
 * Saves teachers ~30 min per kid × 25 kids = 12 hours per cycle.
 *
 * Cost: 1 quiz_generation credit per generation.
 */

import { Type } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getClient, logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";
import lessons from "@/app/data/sample-lessons.json";

type LessonRef = { standardId: string; title: string };
const STANDARD_TITLE = new Map<string, string>(
  (lessons as LessonRef[]).map((l) => [l.standardId, l.title]),
);

const SYSTEM = `You are a senior K-4 reading specialist drafting parent-conference notes for a teacher.

Output is a JSON object with two parts:
- "summary" — one paragraph, 3-5 sentences, plain-English overview parents can understand. Avoid jargon. Use the student's first name. Lead with strengths, then growth areas.
- "next_steps" — one paragraph, 2-3 sentences, concrete things the family can do at home OR things the teacher will focus on next.

Tone: warm, professional, specific. NEVER fabricate data — only use what's provided. If data is sparse, say so honestly ("Maya has only practiced for two days so we have an early read…").

Avoid: percentages without context, edu-jargon (no "phonemic awareness," say "matching letters to sounds"), vague filler ("doing great!").`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    next_steps: { type: Type.STRING },
  },
  required: ["summary", "next_steps"],
};

export type ConferenceNotes = {
  summary: string;
  next_steps: string;
};

export async function buildConferenceNotes(input: {
  childId: string;
  teacherId: string;
}): Promise<
  | { ok: true; notes: ConferenceNotes }
  | { ok: false; error: string }
> {
  const admin = supabaseAdmin();

  // 1) Pull child + recent activity
  const { data: child } = await admin
    .from("children")
    .select("id, first_name, grade, reading_level")
    .eq("id", input.childId)
    .maybeSingle();
  if (!child) return { ok: false, error: "Child not found." };

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [{ data: practice30 }, { data: subs }, { data: assessment }, { data: path }] =
    await Promise.all([
      admin
        .from("practice_results")
        .select(
          "standard_id, questions_attempted, questions_correct, completed_at",
        )
        .eq("child_id", input.childId)
        .gte("completed_at", thirtyDaysAgo)
        .order("completed_at", { ascending: false }),
      admin
        .from("assignment_submissions")
        .select("score_percent, completed_at, assignments!inner(title)")
        .eq("child_id", input.childId)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(10),
      admin
        .from("assessments")
        .select("grade_tested, score_percent, reading_level_placed, completed_at")
        .eq("child_id", input.childId)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("learning_paths")
        .select("items, next_index, updated_at")
        .eq("child_id", input.childId)
        .maybeSingle(),
    ]);

  const c = child as any;
  const rows = (practice30 ?? []) as any[];
  let totalAttempted = 0;
  let totalCorrect = 0;
  const byStrand = new Map<string, { attempted: number; correct: number }>();
  for (const r of rows) {
    totalAttempted += r.questions_attempted ?? 0;
    totalCorrect += r.questions_correct ?? 0;
    if (r.standard_id?.startsWith("custom:")) continue;
    const s = byStrand.get(r.standard_id) ?? { attempted: 0, correct: 0 };
    s.attempted += r.questions_attempted ?? 0;
    s.correct += r.questions_correct ?? 0;
    byStrand.set(r.standard_id, s);
  }
  const accuracy =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;

  const ranked = Array.from(byStrand.entries())
    .filter(([, v]) => v.attempted >= 3)
    .map(([sid, v]) => ({
      sid,
      title: STANDARD_TITLE.get(sid) ?? sid,
      attempted: v.attempted,
      correct: v.correct,
      pct: Math.round((v.correct / v.attempted) * 100),
    }));
  const strongest = [...ranked].sort((a, b) => b.pct - a.pct).slice(0, 3);
  const weakest = [...ranked].sort((a, b) => a.pct - b.pct).slice(0, 3);

  const recentAssignments = ((subs ?? []) as any[]).map((s) => ({
    title: s.assignments?.title ?? "(assignment)",
    score: s.score_percent == null ? null : Math.round(Number(s.score_percent)),
    when: s.completed_at,
  }));

  const placement = assessment as any;
  const learningPath = path as any;
  const pathProgress = learningPath
    ? `Personalized path: ${learningPath.next_index ?? 0}/${(learningPath.items ?? []).length} items completed.`
    : null;

  // 2) Build the prompt
  const userPrompt = `Student: ${c.first_name}
Grade: ${c.grade ?? "(not set)"}
Reading level: ${c.reading_level ?? "(not set)"}

${
  placement
    ? `Placement test (${new Date(placement.completed_at).toLocaleDateString()}): ${placement.score_percent}%, placed at "${placement.reading_level_placed}".`
    : "No placement test on file."
}

Last 30 days practice:
- Total questions attempted: ${totalAttempted}
- Overall accuracy: ${accuracy === null ? "(no data)" : accuracy + "%"}

Strongest strands:
${strongest.length === 0 ? "(not enough data yet)" : strongest.map((s) => `  - ${s.title} (${s.sid}): ${s.correct}/${s.attempted} = ${s.pct}%`).join("\n")}

Areas to grow:
${weakest.length === 0 ? "(not enough data yet)" : weakest.map((s) => `  - ${s.title} (${s.sid}): ${s.correct}/${s.attempted} = ${s.pct}%`).join("\n")}

Recent assignments:
${recentAssignments.length === 0 ? "(none completed yet)" : recentAssignments.map((a) => `  - "${a.title}"${a.score !== null ? ` — ${a.score}%` : ""}`).join("\n")}

${pathProgress ?? ""}

Write the conference notes now.`;

  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.5,
      },
    });
    const parsed = JSON.parse(response.text || "{}") as Partial<ConferenceNotes>;
    if (!parsed.summary || !parsed.next_steps) {
      return { ok: false, error: "AI returned an empty draft." };
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `conference_notes: ${c.first_name}`,
    });

    return {
      ok: true,
      notes: { summary: parsed.summary, next_steps: parsed.next_steps },
    };
  } catch (e: any) {
    trackError(e, {
      route: "build-conference-notes",
      userId: input.teacherId,
    });
    return { ok: false, error: e.message ?? "Generation failed." };
  }
}
