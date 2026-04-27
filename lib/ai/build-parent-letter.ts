/**
 * Parent letter generator + multi-language translation.
 *
 * Two flows:
 *   draftLetter — AI drafts a weekly parent letter from "what we
 *     covered this week" (auto-pulled from the classroom's recent
 *     assignments + lesson activity).
 *   translateLetter — takes a finalized English letter and outputs
 *     translations in 1-N target languages (Spanish, Mandarin, Arabic,
 *     etc.). Cultural sensitivity in the system prompt.
 *
 * Cost per draft: 1 credit. Per translation: 1 credit per target language.
 * District-relevant metric: "we serve our [language] families."
 */

import { Type } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getClient, logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

const DRAFT_SYSTEM = `You are a K-4 teacher writing a warm, friendly weekly letter home to parents.

Output JSON with:
- "subject" — short, parent-inbox-friendly (e.g. "What we read this week").
- "body" — 3-5 short paragraphs in plain English. Include:
  1) A warm opener that names the week + one specific highlight.
  2) What the class read / studied this week (use the data provided).
  3) ONE concrete way the family can support the child at home.
  4) A short, optional reminder or upcoming-events note if relevant.
  5) A warm sign-off — but DO NOT add a fake signature; the teacher will sign it themselves.

Tone: warm, professional, specific. Avoid jargon, hyperbole, and emoji. Use "your child" — never make up a student name.`;

const DRAFT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    body: { type: Type.STRING },
  },
  required: ["subject", "body"],
};

export async function draftParentLetter(input: {
  classroomId: string;
  teacherId: string;
}): Promise<
  | { ok: true; subject: string; body: string }
  | { ok: false; error: string }
> {
  const admin = supabaseAdmin();

  // Pull last 7 days of activity for the class.
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const { data: classroom } = await admin
    .from("classrooms")
    .select("id, name, grade_level")
    .eq("id", input.classroomId)
    .maybeSingle();
  if (!classroom) return { ok: false, error: "Classroom not found." };
  const c = classroom as any;

  const [{ data: assignments }, { data: memberships }] = await Promise.all([
    admin
      .from("assignments")
      .select("title, kind, source_id, created_at")
      .eq("classroom_id", input.classroomId)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false }),
    admin
      .from("classroom_memberships")
      .select("child_id")
      .eq("classroom_id", input.classroomId),
  ]);

  const childIds = ((memberships ?? []) as any[]).map((m) => m.child_id);
  let practiceCount = 0;
  let topStandards: { standardId: string; attempts: number }[] = [];
  if (childIds.length > 0) {
    const { data: rows } = await admin
      .from("practice_results")
      .select("standard_id, questions_attempted")
      .in("child_id", childIds)
      .gte("completed_at", sevenDaysAgo);
    const tally = new Map<string, number>();
    for (const r of (rows ?? []) as any[]) {
      practiceCount += r.questions_attempted ?? 0;
      if (r.standard_id?.startsWith("custom:")) continue;
      tally.set(
        r.standard_id,
        (tally.get(r.standard_id) ?? 0) + (r.questions_attempted ?? 0),
      );
    }
    topStandards = Array.from(tally.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([standardId, attempts]) => ({ standardId, attempts }));
  }

  const userPrompt = `Class: ${c.name}${c.grade_level ? ` (${c.grade_level})` : ""}
Roster size: ${childIds.length} students

Assignments given this week:
${
  ((assignments ?? []) as any[]).length === 0
    ? "(none — write a generic but warm letter about reading practice this week)"
    : ((assignments ?? []) as any[])
        .map((a) => `- "${a.title}" (${a.kind})`)
        .join("\n")
}

Practice activity this week:
- ${practiceCount} questions answered total
${topStandards.map((s) => `- ${s.standardId}: ${s.attempts} attempts`).join("\n")}

Write the parent letter draft now.`;

  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: DRAFT_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: DRAFT_SCHEMA,
        temperature: 0.6,
      },
    });
    const parsed = JSON.parse(response.text || "{}") as {
      subject?: string;
      body?: string;
    };
    if (!parsed.subject || !parsed.body) {
      return { ok: false, error: "AI returned an empty letter." };
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `parent_letter: ${c.name}`,
    });

    return { ok: true, subject: parsed.subject, body: parsed.body };
  } catch (e: any) {
    trackError(e, { route: "build-parent-letter.draft", userId: input.teacherId });
    return { ok: false, error: e.message ?? "Letter generation failed." };
  }
}

const TRANSLATE_SYSTEM = `You are translating a teacher's letter home to parents into another language.

Rules:
- Preserve meaning, tone, and warmth — not just words.
- Adjust for cultural appropriateness when it would help (e.g. honorifics, phrasing of family relationships) but never invent or omit substantive content.
- Match the original's reading level — these go to parents, not professionals.
- Keep paragraph structure.

Output JSON with:
- "subject" — translated subject line
- "body" — translated body, paragraphs preserved`;

const TRANSLATE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    body: { type: Type.STRING },
  },
  required: ["subject", "body"],
};

export const SUPPORTED_LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "zh", label: "Mandarin (Simplified Chinese)" },
  { code: "vi", label: "Vietnamese" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
  { code: "ht", label: "Haitian Creole" },
  { code: "pt", label: "Portuguese" },
  { code: "tl", label: "Tagalog" },
  { code: "ru", label: "Russian" },
  { code: "ko", label: "Korean" },
];

export async function translateLetter(input: {
  teacherId: string;
  subject: string;
  body: string;
  targetLanguage: string;
  targetLanguageLabel: string;
}): Promise<
  | { ok: true; subject: string; body: string }
  | { ok: false; error: string }
> {
  if (!input.subject.trim() || !input.body.trim()) {
    return { ok: false, error: "Letter is empty." };
  }

  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: `Target language: ${input.targetLanguageLabel} (${input.targetLanguage})

Original (English):
SUBJECT: ${input.subject}

BODY:
${input.body}

Translate now.`,
      config: {
        systemInstruction: TRANSLATE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: TRANSLATE_SCHEMA,
        temperature: 0.3,
      },
    });
    const parsed = JSON.parse(response.text || "{}") as {
      subject?: string;
      body?: string;
    };
    if (!parsed.subject || !parsed.body) {
      return { ok: false, error: "Translation returned empty." };
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "quiz_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.quiz_generation,
      success: true,
      requestSummary: `translate_letter: ${input.targetLanguage}`,
    });

    return { ok: true, subject: parsed.subject, body: parsed.body };
  } catch (e: any) {
    trackError(e, {
      route: "build-parent-letter.translate",
      userId: input.teacherId,
    });
    return { ok: false, error: e.message ?? "Translation failed." };
  }
}
