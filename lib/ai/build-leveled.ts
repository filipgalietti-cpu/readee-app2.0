/**
 * Differentiated passage orchestrator.
 *
 * Single AI call produces THREE versions of the same passage at
 * different reading levels (easy / on-level / advanced) so the plot
 * stays identical and only vocabulary + sentence complexity vary.
 * One shared image. Optional comprehension MCQs per level.
 *
 * Lets a teacher assign the same content to a mixed-ability class —
 * the head-to-head play against Newsela's leveled-article product.
 *
 * Cost (typical: image + 3 audio + 3-question set per level):
 *   text gen + image brief + image + 3 audio + 3 question sets + QC
 *   = 1 + 1 + 8 + 6 + 3 + ~3 ≈ 22 credits ≈ $0.11 with all media on
 */

import { Type } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getClient,
  generateMCQQuestions,
  generateImage,
  generateImageBrief,
  generateSpeech,
  checkRateLimit,
  settleBatchAgainstTopUp,
  logUsage,
  MODEL_ID,
} from "@/lib/ai/readee-ai";
import { runFullQuizQc } from "@/lib/ai/qc";
import { CREDIT_COST, MONTHLY_CREDIT_LIMIT } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

export type Level = "easy" | "on_level" | "advanced";

export type LeveledBrief = {
  title: string;
  topic: string;
  baseGrade: string; // e.g. "3rd"
  perVersionAudio: boolean;
  sharedImage: boolean;
  questionsPerLevel: number; // 0-5
};

export type LeveledVersion = {
  level: Level;
  grade: string;
  title: string;
  body: string;
  audio_url: string | null;
  question_ids: string[];
};

const LEVEL_LABEL: Record<Level, string> = {
  easy: "easy",
  on_level: "on-level",
  advanced: "advanced",
};

const SYSTEM = `You are a senior K-4 reading specialist creating differentiated reading passages.

Given a topic and a center grade level, you write THREE versions of THE SAME story / informational passage at three reading levels:
- "easy"     — one grade level BELOW the center grade
- "on_level" — the center grade
- "advanced" — one grade level ABOVE the center grade

CRITICAL rules:
- All three versions tell the SAME story / convey the SAME information. Plot, characters, key facts must be identical.
- Difficulty differences come from VOCABULARY (simpler vs. richer words) and SENTENCE LENGTH (shorter vs. longer/compound) — NOT from changing the content.
- Each version should feel natural for its grade — easy = simple, direct, kid-friendly; on-level = appropriate for the center grade; advanced = richer vocab without being intimidating.
- Length: easy ≈ 60% of advanced length. On-level ≈ 80%.
- Title: one shared title used for all three versions.
- Output ONLY the JSON.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    versions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.STRING, enum: ["easy", "on_level", "advanced"] },
          body: { type: Type.STRING },
        },
        required: ["level", "body"],
      },
    },
  },
  required: ["title", "versions"],
};

function gradeMinusOne(g: string): string {
  const map: Record<string, string> = {
    "1st": "K",
    "2nd": "1st",
    "3rd": "2nd",
    "4th": "3rd",
    K: "K", // K can't go lower; we still produce a "very simple" version
  };
  return map[g] ?? g;
}
function gradePlusOne(g: string): string {
  const map: Record<string, string> = {
    K: "1st",
    "1st": "2nd",
    "2nd": "3rd",
    "3rd": "4th",
    "4th": "5th", // out-of-bank but a fine vocabulary stretch
  };
  return map[g] ?? g;
}

function validateBrief(brief: LeveledBrief): string | null {
  if (!brief.topic.trim()) return "Describe the passage topic.";
  if (!brief.baseGrade) return "Pick a base grade.";
  if (brief.questionsPerLevel < 0 || brief.questionsPerLevel > 5) {
    return "Questions per level must be 0-5.";
  }
  return null;
}

export function estimateLeveledCredits(brief: LeveledBrief): number {
  let credits = CREDIT_COST.passage_generation;
  if (brief.sharedImage) {
    credits += CREDIT_COST.image_generation + CREDIT_COST.quiz_generation;
  }
  if (brief.perVersionAudio) {
    credits += 3 * CREDIT_COST.tts_generation;
  }
  if (brief.questionsPerLevel > 0) {
    credits += 3 * CREDIT_COST.quiz_generation;
  }
  credits += 3; // QC
  return credits;
}

async function generateAllVersions(input: {
  teacherId: string;
  topic: string;
  baseGrade: string;
}): Promise<
  | { ok: true; title: string; versions: { level: Level; body: string }[] }
  | { ok: false; error: string }
> {
  const client = getClient();
  const easyGrade = gradeMinusOne(input.baseGrade);
  const advGrade = gradePlusOne(input.baseGrade);
  const userPrompt = `Topic: ${input.topic}

Center grade: ${input.baseGrade}
- "easy" version target grade:    ${easyGrade}
- "on_level" version target grade: ${input.baseGrade}
- "advanced" version target grade: ${advGrade}

Write all three versions of the SAME passage. Same plot, same key information. Only vocabulary and sentence complexity differ.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.7,
      },
    });
    const parsed = JSON.parse(response.text || "{}") as {
      title?: string;
      versions?: { level?: string; body?: string }[];
    };
    const title = (parsed.title ?? "").trim();
    const versions = (parsed.versions ?? [])
      .map((v) => ({
        level: (v.level ?? "") as Level,
        body: (v.body ?? "").trim(),
      }))
      .filter((v) => v.body && ["easy", "on_level", "advanced"].includes(v.level));

    // Sort canonical order: easy, on_level, advanced
    const order: Level[] = ["easy", "on_level", "advanced"];
    versions.sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));

    if (versions.length < 3 || !title) {
      return { ok: false, error: "Model didn't return all three versions." };
    }

    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.passage_generation,
      success: true,
      requestSummary: `leveled: ${input.topic.slice(0, 80)}`,
    });
    return { ok: true, title, versions };
  } catch (e: any) {
    trackError(e, { route: "build-leveled.generateAllVersions", userId: input.teacherId });
    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      success: false,
      error: e.message,
      requestSummary: `leveled: ${input.topic.slice(0, 80)}`,
    });
    return { ok: false, error: e.message ?? "Differentiated generation failed." };
  }
}

export async function buildLeveledPassage(input: {
  teacherId: string;
  brief: LeveledBrief;
}): Promise<
  | { ok: true; passageId: string; warnings: string[]; creditsUsed: number }
  | { ok: false; error: string }
> {
  const { teacherId, brief } = input;
  const validationErr = validateBrief(brief);
  if (validationErr) return { ok: false, error: validationErr };

  const admin = supabaseAdmin();
  const warnings: string[] = [];
  let creditsUsed = 0;

  const budget = await checkRateLimit(teacherId, "passage_generation");
  if (!budget.allowed) return { ok: false, error: "Hit your monthly credit cap." };
  const monthlyUsedBefore = budget.monthlyUsed;

  const initialTitle =
    brief.title.trim().slice(0, 120) || "Untitled leveled passage";
  const { data: row, error: rowErr } = await admin
    .from("differentiated_passages")
    .insert({
      teacher_id: teacherId,
      title: initialTitle,
      topic: brief.topic.trim().slice(0, 400),
      base_grade: brief.baseGrade || null,
    })
    .select("id")
    .single();
  if (rowErr || !row) {
    return { ok: false, error: `Could not create row: ${rowErr?.message}` };
  }
  const passageId = (row as { id: string }).id;

  // 1) Generate all three text versions in one call.
  const textRes = await generateAllVersions({
    teacherId,
    topic: brief.topic,
    baseGrade: brief.baseGrade,
  });
  if (!textRes.ok) {
    return { ok: false, error: `Text generation: ${textRes.error}` };
  }
  creditsUsed += CREDIT_COST.passage_generation;

  if (brief.title.trim().length === 0) {
    await admin
      .from("differentiated_passages")
      .update({ title: textRes.title.slice(0, 120) })
      .eq("id", passageId);
  }

  // 2) Shared image (one image works for all three levels).
  let sharedImageUrl: string | null = null;
  if (brief.sharedImage) {
    const briefRes = await generateImageBrief({
      teacherId,
      passageTitle: textRes.title,
      // Use the on-level body for the image brief; same scene for all.
      passageBody:
        textRes.versions.find((v) => v.level === "on_level")?.body ??
        textRes.versions[0].body,
    });
    let prompt = `Children's book illustration for "${textRes.title}". Topic: ${brief.topic}.`;
    if (briefRes.ok) {
      prompt = briefRes.brief;
      creditsUsed += CREDIT_COST.quiz_generation;
    } else {
      warnings.push(`Image brief: ${briefRes.error}`);
    }
    const imgRes = await generateImage({ teacherId, prompt });
    if (imgRes.ok) {
      sharedImageUrl = imgRes.imageUrl;
      creditsUsed += CREDIT_COST.image_generation;
    } else {
      warnings.push(`Image: ${imgRes.error}`);
    }
  }

  // 3) Per-level audio + comprehension questions.
  const grades: Record<Level, string> = {
    easy: gradeMinusOne(brief.baseGrade),
    on_level: brief.baseGrade,
    advanced: gradePlusOne(brief.baseGrade),
  };
  const versions: LeveledVersion[] = [];

  for (const v of textRes.versions) {
    let audioUrl: string | null = null;
    const questionIds: string[] = [];

    if (brief.perVersionAudio) {
      const ttsRes = await generateSpeech({
        teacherId,
        text: v.body.slice(0, 1200),
      });
      if (ttsRes.ok) {
        audioUrl = ttsRes.audioUrl;
        creditsUsed += CREDIT_COST.tts_generation;
      } else {
        warnings.push(`Audio (${v.level}): ${ttsRes.error}`);
      }
    }

    if (brief.questionsPerLevel > 0) {
      const mcqRes = await generateMCQQuestions({
        teacherId,
        topic: `${brief.topic}\n\nPassage students just read (${LEVEL_LABEL[v.level]} version):\n"""\n${v.body}\n"""`,
        gradeLevel: grades[v.level],
        count: brief.questionsPerLevel,
      });
      if (mcqRes.ok) {
        creditsUsed += CREDIT_COST.quiz_generation;
        for (const q of mcqRes.questions) {
          const { data: qrow } = await admin
            .from("custom_questions")
            .insert({
              teacher_id: teacherId,
              kind: "multiple_choice",
              prompt: q.prompt,
              choices: q.choices,
              correct: q.correct,
              hint: q.hint ?? null,
            })
            .select("id")
            .single();
          if (qrow) questionIds.push((qrow as { id: string }).id);
        }
      } else {
        warnings.push(`Questions (${v.level}): ${mcqRes.error}`);
      }
    }

    versions.push({
      level: v.level,
      grade: grades[v.level],
      title: textRes.title,
      body: v.body,
      audio_url: audioUrl,
      question_ids: questionIds,
    });
  }

  // 4) QC — judge the on-level version (the canonical one).
  let qcReport: any = null;
  let qcOverall: "pass" | "warn" | "fail" = "pass";
  try {
    const onLevel = versions.find((v) => v.level === "on_level") ?? versions[0];
    qcReport = await runFullQuizQc({
      teacherId,
      passageTitle: textRes.title,
      passageBody: onLevel.body,
      gradeLevel: brief.baseGrade,
      questions: [],
      imageUrl: sharedImageUrl,
      imageScene: null,
    });
    qcOverall = qcReport.overall;
    creditsUsed += qcReport.creditsUsed;
    for (const c of qcReport.checks) {
      if (c.severity === "fail") warnings.push(`QC: ${c.message}`);
    }
  } catch (e: any) {
    warnings.push(`QC: ${e.message ?? "QC failed"}`);
  }

  // 5) Persist final state.
  await admin
    .from("differentiated_passages")
    .update({
      shared_image_url: sharedImageUrl,
      versions,
      qc_overall: qcOverall,
      qc_report: qcReport,
    })
    .eq("id", passageId);

  // 6) Settle.
  await settleBatchAgainstTopUp({
    profileId: teacherId,
    pool: "teacher",
    monthlyUsedBefore,
    creditsConsumed: creditsUsed,
    monthlyLimit: MONTHLY_CREDIT_LIMIT,
  });

  return { ok: true, passageId, warnings, creditsUsed };
}
