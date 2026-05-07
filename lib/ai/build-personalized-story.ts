/**
 * Personalized story generator — the kid IS the protagonist.
 *
 * Parent enters interests at signup (e.g. "soccer, dinosaurs, baking
 * with grandma"). Generator writes a 6-10 page story starring the
 * child + their interests, illustrated, at the right reading level.
 *
 * B2C engagement multiplier — kids see themselves on the page, parents
 * share screenshots to family group chats, organic word-of-mouth.
 *
 * Cost (typical 8-page story with images):
 *   1 passage + 8 image briefs + 8 images + ~3 QC = ~75 credits ≈ \$0.38
 */

import { Type } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getClient,
  generateImage,
  generateImageBrief,
  logUsage,
  MODEL_ID,
} from "@/lib/ai/readee-ai";
import { runFullQuizQc } from "@/lib/ai/qc";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";
import { READEE_VOICE } from "@/lib/ai/voice";

export type PersonalizedStoryBrief = {
  childId: string;
  childFirstName: string;
  interests: string[];
  readingLevel: string;
  pageCount: number;
};

export type StoryPage = {
  position: number;
  body: string;
  image_url: string | null;
};

const STORY_SYSTEM = `You write personalized children's stories where the protagonist IS the child reading them.

Rules:
- The CHILD is the main character. Use their first name on every page (sometimes "she/he/they" for variety, but make it clear it's about THEM).
- Weave in their interests naturally — they aren't bolted on, the story IS about those interests.
- Match the reading level provided. K-easy = simple, repetitive, very few unique words per page. 4th-hard = richer vocab, longer sentences.
- Each page = 1-3 short sentences. The story has a clear arc: setup → small problem or adventure → satisfying ending.
- Title: short, kid-friendly, includes the child's name (e.g. "Maya Saves the Soccer Game", "Leo and the Tiny Dinosaur").

Output JSON: { title, pages: [{ text }] }.

${READEE_VOICE}`;

const STORY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    pages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { text: { type: Type.STRING } },
        required: ["text"],
      },
    },
  },
  required: ["title", "pages"],
};

async function generateStoryText(input: {
  parentId: string;
  childFirstName: string;
  interests: string[];
  readingLevel: string;
  pageCount: number;
}): Promise<
  | { ok: true; title: string; pages: string[] }
  | { ok: false; error: string }
> {
  const client = getClient();
  const userPrompt = `Child's first name: ${input.childFirstName}
Reading level: ${input.readingLevel}
Interests: ${input.interests.length > 0 ? input.interests.join(", ") : "(none specified — write a generally fun adventure)"}
Number of pages: ${input.pageCount}

Write the personalized story now.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: STORY_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: STORY_SCHEMA,
        temperature: 0.85,
      },
    });
    const parsed = JSON.parse(response.text || "{}") as {
      title?: string;
      pages?: { text?: string }[];
    };
    const title = (parsed.title ?? "").trim() || `${input.childFirstName}'s Story`;
    const pages = (parsed.pages ?? [])
      .map((p) => (p.text ?? "").trim())
      .filter(Boolean);
    if (pages.length === 0) {
      return { ok: false, error: "Model returned no pages." };
    }
    const padded = pages.slice(0, input.pageCount);
    while (padded.length < input.pageCount) padded.push("");

    await logUsage({
      teacherId: input.parentId, // log against the parent
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.passage_generation,
      success: true,
      requestSummary: `personalized_story: ${input.childFirstName}`,
    });
    return { ok: true, title, pages: padded };
  } catch (e: any) {
    trackError(e, {
      route: "build-personalized-story.text",
      userId: input.parentId,
    });
    return { ok: false, error: e.message ?? "Story generation failed." };
  }
}

export async function buildPersonalizedStory(input: {
  parentId: string;
  brief: PersonalizedStoryBrief;
}): Promise<
  | { ok: true; storyId: string; warnings: string[]; creditsUsed: number }
  | { ok: false; error: string }
> {
  const { parentId, brief } = input;
  if (!brief.childFirstName?.trim()) {
    return { ok: false, error: "Child's first name is required." };
  }
  if (brief.pageCount < 4 || brief.pageCount > 12) {
    return { ok: false, error: "Page count must be 4–12." };
  }

  const admin = supabaseAdmin();
  const warnings: string[] = [];
  let creditsUsed = 0;

  // 1) Skeleton row
  const { data: row, error: rowErr } = await admin
    .from("personalized_stories")
    .insert({
      child_id: brief.childId,
      parent_id: parentId,
      title: `Untitled — for ${brief.childFirstName}`,
      reading_level: brief.readingLevel,
    })
    .select("id")
    .single();
  if (rowErr || !row) {
    return { ok: false, error: `Could not create story row: ${rowErr?.message}` };
  }
  const storyId = (row as { id: string }).id;

  // 2) Story text
  const textRes = await generateStoryText({
    parentId,
    childFirstName: brief.childFirstName,
    interests: brief.interests,
    readingLevel: brief.readingLevel,
    pageCount: brief.pageCount,
  });
  if (!textRes.ok) {
    return { ok: false, error: `Story text: ${textRes.error}` };
  }
  creditsUsed += CREDIT_COST.passage_generation;
  await admin
    .from("personalized_stories")
    .update({ title: textRes.title.slice(0, 120) })
    .eq("id", storyId);

  // 3) Per-page images
  const pages: StoryPage[] = [];
  for (let i = 0; i < textRes.pages.length; i++) {
    const text = textRes.pages[i];
    let imageUrl: string | null = null;
    if (text) {
      const briefRes = await generateImageBrief({
        teacherId: parentId,
        passageTitle: textRes.title,
        passageBody: text,
      });
      let prompt = `Children's storybook illustration: "${text}". Cartoon, kid-friendly, warm.`;
      if (briefRes.ok) {
        prompt = briefRes.brief;
        creditsUsed += CREDIT_COST.quiz_generation;
      } else {
        warnings.push(`Page ${i + 1} image brief: ${briefRes.error}`);
      }
      const imgRes = await generateImage({ teacherId: parentId, prompt });
      if (imgRes.ok) {
        imageUrl = imgRes.imageUrl;
        creditsUsed += CREDIT_COST.image_generation;
      } else {
        warnings.push(`Page ${i + 1} image: ${imgRes.error}`);
      }
    }
    pages.push({ position: i + 1, body: text, image_url: imageUrl });
  }
  const coverImageUrl = pages.find((p) => p.image_url)?.image_url ?? null;

  // 4) QC
  let qcReport: any = null;
  let qcOverall: "pass" | "warn" | "fail" = "pass";
  try {
    qcReport = await runFullQuizQc({
      teacherId: parentId,
      passageTitle: textRes.title,
      passageBody: pages.map((p) => p.body).join("\n\n"),
      gradeLevel: brief.readingLevel,
      questions: [],
      imageUrl: coverImageUrl,
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

  // 5) Persist final
  await admin
    .from("personalized_stories")
    .update({
      pages,
      cover_image_url: coverImageUrl,
      qc_overall: qcOverall,
      qc_report: qcReport,
    })
    .eq("id", storyId);

  return { ok: true, storyId, warnings, creditsUsed };
}
