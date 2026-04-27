/**
 * Decodable book orchestrator.
 *
 * Generates a multi-page early reader targeting a specific phonics
 * pattern. Each page = 1 image + 1-2 sentences using the pattern.
 *
 * Different from build-lesson:
 *   - No comprehension questions (books are for sustained reading)
 *   - No audio (kids read these aloud themselves)
 *   - Phonics-constrained text gen (heavy use of target pattern words)
 *   - Page-shaped output, not slide-shaped
 *
 * Cost (typical 10-page book with images):
 *   text gen + 10 image briefs + 10 images + QC
 *   = 1 + 10 + 80 + ~3 ≈ 94 credits ≈ $0.47
 */

import { Type, GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getClient,
  generateImage,
  generateImageBrief,
  checkRateLimit,
  settleBatchAgainstTopUp,
  logUsage,
  MODEL_ID,
} from "@/lib/ai/readee-ai";
import { runFullQuizQc } from "@/lib/ai/qc";
import { CREDIT_COST, MONTHLY_CREDIT_LIMIT } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";
import { getPattern } from "@/lib/ai/phonics-patterns";
import { extractCharacterCard } from "@/lib/ai/character-card";
import { indexContent } from "@/lib/ai/embeddings";

export type BookBrief = {
  title: string;
  phonicsPattern: string;
  patternLabel: string;
  gradeLevel: string;
  pageCount: number;
  perPageImage: boolean;
};

export type BookPage = {
  position: number;
  text: string;
  image_url: string | null;
};

const BOOK_SYSTEM = `You write decodable readers — short story books for early readers (K-2) that practice a specific phonics pattern.

Rules:
- Every page should use the target pattern HEAVILY — at least one (preferably 2-3) words on every page contain the pattern.
- Outside the pattern, use only:
  - Sight words appropriate for the target grade (the, and, is, was, said, my, you, etc.)
  - Other simple decodable words the child has already learned.
- 1-2 short sentences per page. Total 5-15 words per page.
- Tell a tiny coherent story across the pages — beginning, middle, end. Even 8 pages should feel like a story, not random sentences.
- Vocabulary level: short, concrete, kid-friendly. Avoid abstract words.
- Friendly, warm, kid-safe tone. No scary or sad endings.
- Generate a short kid-friendly title (2-5 words).`;

const BOOK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    pages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
        },
        required: ["text"],
      },
    },
  },
  required: ["title", "pages"],
};

async function generateBookText(input: {
  teacherId: string;
  pattern: { key: string; label: string; examples: string[] };
  gradeLevel: string;
  pageCount: number;
}): Promise<
  | { ok: true; title: string; pages: string[] }
  | { ok: false; error: string }
> {
  const client = getClient();
  const userPrompt = `Target phonics pattern: ${input.pattern.label}
Pattern key: ${input.pattern.key}
Example pattern words: ${input.pattern.examples.join(", ")}

Grade level: ${input.gradeLevel}
Number of pages: ${input.pageCount}

Generate a decodable book following the schema. Each page's text should be 1-2 short sentences. Use the pattern words from the example list (and similar pattern words) heavily across the pages.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: userPrompt,
      config: {
        systemInstruction: BOOK_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: BOOK_SCHEMA,
        temperature: 0.7,
      },
    });
    const parsed = JSON.parse(response.text || "{}") as {
      title?: string;
      pages?: { text?: string }[];
    };
    const title = (parsed.title ?? "").trim() || `A ${input.pattern.label} Book`;
    const pages = (parsed.pages ?? [])
      .map((p) => (p.text ?? "").trim())
      .filter(Boolean);
    if (pages.length === 0) {
      return { ok: false, error: "Model returned no pages." };
    }
    // Force the requested length (pad or trim).
    const padded = pages.slice(0, input.pageCount);
    while (padded.length < input.pageCount) padded.push("");

    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.passage_generation,
      success: true,
      requestSummary: `book: ${input.pattern.label}`,
    });
    return { ok: true, title, pages: padded };
  } catch (e: any) {
    trackError(e, { route: "build-book.generateBookText", userId: input.teacherId });
    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      success: false,
      error: e.message,
      requestSummary: `book: ${input.pattern.label}`,
    });
    return { ok: false, error: e.message ?? "Book generation failed." };
  }
}

function validateBrief(brief: BookBrief): string | null {
  if (!brief.phonicsPattern?.trim()) return "Pick a phonics pattern.";
  if (!brief.patternLabel?.trim()) return "Pattern label missing.";
  if (brief.pageCount < 4 || brief.pageCount > 16) {
    return "Page count must be 4–16.";
  }
  return null;
}

export function estimateBookCredits(brief: BookBrief): number {
  let credits = CREDIT_COST.passage_generation;
  if (brief.perPageImage) {
    // +1 text credit for the character-card extraction, +1 image for the
    // reference card. Per-page = image_brief + image (the reference image
    // anchors all pages so the cat looks like the same cat throughout).
    credits += CREDIT_COST.passage_generation + CREDIT_COST.image_generation;
    credits += brief.pageCount * (CREDIT_COST.image_generation + CREDIT_COST.quiz_generation);
  }
  credits += 3; // QC suite (no questions, just passage + image)
  return credits;
}

export async function buildBook(input: {
  teacherId: string;
  brief: BookBrief;
}): Promise<
  | { ok: true; bookId: string; warnings: string[]; creditsUsed: number }
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

  // Look up the canonical pattern (or fall back to the brief's free-text label).
  const knownPattern = getPattern(brief.phonicsPattern);
  const pattern = knownPattern ?? {
    key: brief.phonicsPattern,
    label: brief.patternLabel,
    examples: [] as string[],
    grade: brief.gradeLevel,
    group: "custom",
  };

  // 1) Skeleton row
  const initialTitle =
    brief.title.trim().slice(0, 120) || `Untitled ${brief.patternLabel} book`;
  const { data: bookRow, error: rowErr } = await admin
    .from("custom_books")
    .insert({
      teacher_id: teacherId,
      title: initialTitle,
      phonics_pattern: brief.phonicsPattern,
      pattern_label: brief.patternLabel,
      grade_level: brief.gradeLevel || null,
    })
    .select("id")
    .single();
  if (rowErr || !bookRow) {
    return { ok: false, error: `Could not create book row: ${rowErr?.message}` };
  }
  const bookId = (bookRow as { id: string }).id;

  // 2) Generate text for all pages in one call.
  const textRes = await generateBookText({
    teacherId,
    pattern,
    gradeLevel: brief.gradeLevel,
    pageCount: brief.pageCount,
  });
  if (!textRes.ok) {
    return { ok: false, error: `Book text: ${textRes.error}` };
  }
  creditsUsed += CREDIT_COST.passage_generation;

  // Backfill the title with the AI title if blank.
  if (brief.title.trim().length === 0) {
    await admin
      .from("custom_books")
      .update({ title: textRes.title.slice(0, 120) })
      .eq("id", bookId);
  }

  // 3) Build a "character card" reference image so every page draws the
  //    SAME character (was: each page regenerated from scratch, so the
  //    cat looked slightly different on every spread).
  let characterDescription = "";
  let referenceImage: { data: string; mimeType: string } | null = null;
  if (brief.perPageImage) {
    const cardRes = await extractCharacterCard({
      teacherId,
      title: textRes.title,
      units: textRes.pages,
      contextTag: "book",
    });
    if (cardRes.ok && cardRes.hasCharacter) {
      creditsUsed += CREDIT_COST.passage_generation;
      characterDescription = cardRes.description;
      const refRes = await generateImage({
        teacherId,
        prompt: `${cardRes.cardPrompt} ${cardRes.description} Centered, full body visible, soft pastel background, no other characters, no text or labels.`,
      });
      if (refRes.ok) {
        creditsUsed += CREDIT_COST.image_generation;
        referenceImage = { data: refRes.imageBase64, mimeType: refRes.mimeType };
      } else {
        warnings.push(`Character card: ${refRes.error}`);
      }
    } else if (cardRes.ok && !cardRes.hasCharacter) {
      // Book has no clear recurring character — skip reference image.
      creditsUsed += CREDIT_COST.passage_generation;
    } else if (!cardRes.ok) {
      warnings.push(`Character card: ${cardRes.error}`);
    }
  }

  // 4) Per-page images. When we have a reference, pass it into every
  //    page generation so the model anchors on the same character.
  const pages: BookPage[] = [];
  for (let i = 0; i < textRes.pages.length; i++) {
    const text = textRes.pages[i];
    let imageUrl: string | null = null;
    if (text && brief.perPageImage) {
      const briefRes = await generateImageBrief({
        teacherId,
        passageTitle: textRes.title,
        passageBody: text,
      });
      let prompt = `Picture book illustration for: "${text}". Cartoon, kid-friendly.`;
      if (briefRes.ok) {
        prompt = briefRes.brief;
        creditsUsed += CREDIT_COST.quiz_generation;
      } else {
        warnings.push(`Page ${i + 1} image brief: ${briefRes.error}`);
      }
      // Prepend the character description as a textual anchor too —
      // belt-and-suspenders with the reference image.
      const anchoredPrompt = characterDescription
        ? `Character: ${characterDescription}\nScene: ${prompt}`
        : prompt;
      const imgRes = await generateImage({
        teacherId,
        prompt: anchoredPrompt,
        referenceImage,
      });
      if (imgRes.ok) {
        imageUrl = imgRes.imageUrl;
        creditsUsed += CREDIT_COST.image_generation;
      } else {
        warnings.push(`Page ${i + 1} image: ${imgRes.error}`);
      }
    }
    pages.push({ position: i + 1, text, image_url: imageUrl });
  }

  const coverImageUrl = pages.find((p) => p.image_url)?.image_url ?? null;

  // 4) QC pass — passage-level + image judge. No questions on books.
  let qcReport: any = null;
  let qcOverall: "pass" | "warn" | "fail" = "pass";
  try {
    qcReport = await runFullQuizQc({
      teacherId,
      passageTitle: textRes.title,
      passageBody: pages.map((p) => p.text).join("\n\n"),
      gradeLevel: brief.gradeLevel,
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

  // 5) Persist
  await admin
    .from("custom_books")
    .update({
      pages,
      cover_image_url: coverImageUrl,
      qc_overall: qcOverall,
      qc_report: qcReport,
    })
    .eq("id", bookId);

  // 6) Settlement
  await settleBatchAgainstTopUp({
    profileId: teacherId,
    pool: "teacher",
    monthlyUsedBefore,
    creditsConsumed: creditsUsed,
    monthlyLimit: MONTHLY_CREDIT_LIMIT,
  });

  // 7) Index for semantic search (fire-and-forget).
  void indexContent({
    contentType: "custom_book",
    contentId: bookId,
    teacherId,
    text: `${textRes.title}\n\nPhonics: ${brief.patternLabel}\n\n${pages.map((p) => p.text).join("\n")}`,
    metadata: {
      title: textRes.title,
      pattern_label: brief.patternLabel,
      grade_level: brief.gradeLevel,
      page_count: pages.length,
    },
  }).catch(() => {});

  return { ok: true, bookId, warnings, creditsUsed };
}
