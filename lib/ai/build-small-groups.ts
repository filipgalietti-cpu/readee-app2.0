/**
 * Smart small-group generator. AI reads a classroom's last-30-day
 * practice data, identifies clusters of kids with similar weaknesses,
 * and proposes 2-4 differentiated small groups with a focus skill +
 * suggested next-step lesson per group.
 *
 * The "AI co-teacher" play. Solves differentiation at scale, which is
 * the #1 hardest job a teacher faces.
 *
 * Cost: 1 quiz_generation credit per generation.
 */

import { Type } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getClient, logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";
import lessons from "@/app/data/sample-lessons.json";

type LessonRef = { standardId: string; title: string; grade: string };
const LESSONS = lessons as LessonRef[];

const SYSTEM = `You are a senior K-4 reading specialist proposing differentiated small-group rotations for a teacher.

You will receive:
- The classroom's grade level
- Each student with their weakest standards (from recent practice data)
- The lesson catalog the teacher can pull from

Output JSON: an array of 2-4 GROUPS. Each group has:
- "name" — a short kid-friendly group name (NOT student names — call them e.g. "Phonics Crew", "Inference Squad", "Story Detectives")
- "focus_standard_id" — the CCSS standard the group most needs to work on
- "focus_label" — plain-English version of what they'll work on ("matching letters to sounds", "drawing conclusions from text")
- "student_ids" — array of child UUIDs that belong in this group
- "suggested_lesson_id" — a standard_id from the catalog the teacher can assign as the group's lesson (must exist)
- "rationale" — one sentence the teacher reads ("These four students all scored below 50% on letter-sound matching last week.")

Rules:
- Every student appears in exactly ONE group.
- Group sizes should be roughly balanced (3-8 kids each is ideal).
- Don't create more groups than needed; if all kids are at similar levels, 2 groups is fine.
- If a kid has no recent practice data, drop them in the group whose focus best matches their grade level — don't skip them.
- The suggested_lesson_id must reference a standard in the provided catalog.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    groups: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          focus_standard_id: { type: Type.STRING },
          focus_label: { type: Type.STRING },
          student_ids: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          suggested_lesson_id: { type: Type.STRING },
          rationale: { type: Type.STRING },
        },
        required: [
          "name",
          "focus_standard_id",
          "focus_label",
          "student_ids",
          "suggested_lesson_id",
          "rationale",
        ],
      },
    },
  },
  required: ["groups"],
};

export type SmallGroup = {
  name: string;
  focus_standard_id: string;
  focus_label: string;
  student_ids: string[];
  suggested_lesson_id: string;
  rationale: string;
};

export async function buildSmallGroups(input: {
  classroomId: string;
  teacherId: string;
}): Promise<
  { ok: true; groups: SmallGroup[] } | { ok: false; error: string }
> {
  const admin = supabaseAdmin();

  const { data: classroom } = await admin
    .from("classrooms")
    .select("id, name, grade_level")
    .eq("id", input.classroomId)
    .maybeSingle();
  if (!classroom) return { ok: false, error: "Classroom not found." };
  const c = classroom as any;

  const { data: memberships } = await admin
    .from("classroom_memberships")
    .select("child_id, children(id, first_name, grade)")
    .eq("classroom_id", input.classroomId);
  const roster = ((memberships ?? []) as any[])
    .map((m) => m.children)
    .filter(Boolean) as { id: string; first_name: string; grade: string }[];

  if (roster.length < 4) {
    return {
      ok: false,
      error: "Need at least 4 students for small-group rotation.",
    };
  }

  const childIds = roster.map((c) => c.id);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data: rows } = await admin
    .from("practice_results")
    .select("child_id, standard_id, questions_attempted, questions_correct")
    .in("child_id", childIds)
    .gte("completed_at", thirtyDaysAgo);

  const byChild = new Map<
    string,
    Map<string, { attempted: number; correct: number }>
  >();
  for (const r of (rows ?? []) as any[]) {
    if (r.standard_id?.startsWith("custom:")) continue;
    if (!byChild.has(r.child_id)) byChild.set(r.child_id, new Map());
    const ch = byChild.get(r.child_id)!;
    const cur = ch.get(r.standard_id) ?? { attempted: 0, correct: 0 };
    cur.attempted += r.questions_attempted ?? 0;
    cur.correct += r.questions_correct ?? 0;
    ch.set(r.standard_id, cur);
  }

  // Per-student weak-strand summary.
  const studentSummaries = roster.map((kid) => {
    const strands = byChild.get(kid.id) ?? new Map();
    const weak = Array.from(strands.entries())
      .map(([sid, v]) => ({
        sid,
        attempted: v.attempted,
        correct: v.correct,
        pct: v.attempted > 0 ? Math.round((v.correct / v.attempted) * 100) : 0,
      }))
      .filter((s) => s.attempted >= 3)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 3);
    return {
      id: kid.id,
      name: kid.first_name,
      grade: kid.grade,
      weak,
    };
  });

  // Catalog (compress)
  const catalog = LESSONS.map((l) => ({
    standard_id: l.standardId,
    grade: l.grade,
    title: l.title,
  }));

  const userPrompt = `Classroom grade: ${c.grade_level ?? "(mixed)"}
Total students: ${roster.length}

Students with their weakest 3 strands (last 30 days):
${studentSummaries
  .map((s) => {
    if (s.weak.length === 0) {
      return `- ${s.id} (${s.name}, ${s.grade ?? "?"}): no recent practice data`;
    }
    return `- ${s.id} (${s.name}, ${s.grade ?? "?"}): ${s.weak
      .map((w) => `${w.sid} ${w.pct}%`)
      .join(", ")}`;
  })
  .join("\n")}

Available lessons:
${catalog.map((l) => `- ${l.standard_id} (${l.grade}): ${l.title}`).join("\n")}

Propose the small groups now.`;

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
    const parsed = JSON.parse(response.text || "{}") as {
      groups?: SmallGroup[];
    };
    const groups = (parsed.groups ?? []).filter(
      (g) =>
        Array.isArray(g.student_ids) &&
        g.student_ids.length > 0 &&
        g.focus_standard_id,
    );
    if (groups.length === 0) {
      return { ok: false, error: "AI returned no usable groups." };
    }

    // Sanity: every student must end up in at least one group. If the
    // AI dropped someone, append them to the first group.
    const placed = new Set<string>();
    for (const g of groups) for (const s of g.student_ids) placed.add(s);
    for (const kid of roster) {
      if (!placed.has(kid.id)) groups[0].student_ids.push(kid.id);
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `small_groups: ${c.name}`,
    });

    return { ok: true, groups };
  } catch (e: any) {
    trackError(e, { route: "build-small-groups", userId: input.teacherId });
    return { ok: false, error: e.message ?? "Generation failed." };
  }
}
