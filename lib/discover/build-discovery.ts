/**
 * Discovery article builder. Permanent, category-led library content
 * (Science / History / Nature / Inventions / Sports / Stories /
 * Math-in-Real-Life). Shape mirrors the daily Readee — passage +
 * 3 MCQs + image + audio + full QC report — so the same gates and
 * auto-heal pipeline apply.
 *
 * Mission: ~5 articles/day/category → ~3,000-article library in 90
 * days. Every article passes the same 12-check QC floor as the daily
 * Readee: reading-level (fail tier), banned vocab, passage judge,
 * fact-check (Wikipedia-grounded), per-MCQ judges, image judge
 * (guardrail-aware), audio judge, learning-objective.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  generatePassage,
  generateMCQQuestions,
  generateImage,
  generateImageBrief,
  generateSpeech,
} from "@/lib/ai/readee-ai";
import { runFullQuizQc, qcImage } from "@/lib/ai/qc";
import { trackError } from "@/lib/observability/track";
import {
  resolveHistoricalImage,
  cacheWikipediaImageToSupabase,
} from "@/lib/ai/historical-artifacts";
import {
  CATEGORIES,
  type DiscoveryCategory,
  type CategoryConfig,
} from "@/lib/discover/categories";

function systemTeacherId(): string {
  const id = process.env.QC_BOT_TEACHER_ID ?? process.env.DAILY_QUESTION_TEACHER_ID;
  if (!id) {
    throw new Error(
      "QC_BOT_TEACHER_ID or DAILY_QUESTION_TEACHER_ID env var is required.",
    );
  }
  return id;
}

export type DiscoveryBuildResult =
  | { ok: true; id: string; slug: string; qcOverall: string; attempts: string[] }
  | { ok: false; error: string };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string, category: string): Promise<string> {
  const admin = supabaseAdmin();
  let candidate = `${category}-${base}` || `${category}-${Date.now()}`;
  for (let n = 0; n < 8; n++) {
    const trySlug = n === 0 ? candidate : `${candidate}-${n + 1}`;
    const { data } = await admin
      .from("discovery_articles")
      .select("id")
      .eq("slug", trySlug)
      .maybeSingle();
    if (!data) return trySlug;
  }
  return `${candidate}-${Date.now()}`;
}

/**
 * Build one discovery article end-to-end with auto-heal. Returns
 * after persistence; caller can inspect qc_overall.
 *
 * Default grade = 2nd (mid-band, broadest audience appeal). Crons
 * can pass a specific grade to skew toward K-1 or 3-4.
 */
export async function buildDiscoveryArticle(input: {
  category: DiscoveryCategory;
  gradeLevel?: string;
  /** Optional explicit topic hint to bypass the category's auto-pick
   *  guidance. Used by tests + manual operator runs. */
  topicHint?: string;
}): Promise<DiscoveryBuildResult> {
  const cfg = CATEGORIES[input.category];
  if (!cfg) return { ok: false, error: `Unknown category: ${input.category}` };
  const gradeLevel = input.gradeLevel ?? "2nd";
  const admin = supabaseAdmin();
  const attempts: string[] = [];

  let teacherId: string;
  try {
    teacherId = systemTeacherId();
  } catch (e: any) {
    return { ok: false, error: e.message };
  }

  // 1) Pick a topic. If the caller provided a hint, use it. Otherwise
  //    let Gemini pick from the category's topic surface — keeps the
  //    library diverse without us maintaining a topic backlog.
  const topic = input.topicHint
    ? `${cfg.label}: ${input.topicHint}. ${cfg.toneGuidance}`
    : [
        `Category: ${cfg.label}`,
        cfg.topicGuidance,
        cfg.toneGuidance,
        `Pick a topic that has not been done recently. Write ONE focused passage with a single teachable point.`,
      ].join("\n\n");

  // 2) Passage.
  const passageRes = await generatePassage({
    teacherId,
    topic,
    gradeLevel,
    lengthLevel: "short",
    trustedSystem: true,
  });
  if (!passageRes.ok) {
    return { ok: false, error: `passage: ${passageRes.error}` };
  }
  const title = passageRes.passage.title;
  const body = passageRes.passage.passage;
  attempts.push("passage");

  // 3) Image. Historical figures route through the existing royalty-
  //    free Wikipedia pipeline; everything else goes through Imagen
  //    with the named-person guardrail when relevant.
  let imageUrl: string | null = null;
  let imageScene: string | null = null;
  try {
    const resolved = await resolveHistoricalImage(title, body);
    if (resolved.kind === "royalty_free") {
      const cached = await cacheWikipediaImageToSupabase(
        resolved.figureName,
        resolved.imageUrl,
      );
      imageUrl = cached ?? resolved.imageUrl;
      imageScene = `Wikipedia portrait of ${resolved.figureName}`;
    } else {
      const brief = await generateImageBrief({
        teacherId,
        passageTitle: title,
        passageBody: body,
      });
      if (brief.ok) {
        const figureGuard =
          resolved.kind === "ai" &&
          resolved.avoidNamedPerson &&
          resolved.figureName
            ? ` Do not depict ${resolved.figureName}'s likeness — show only the activity, era, or setting they're associated with, no recognizable face.`
            : "";
        imageScene = brief.brief + figureGuard;
        const img = await generateImage({ teacherId, prompt: imageScene });
        if (img.ok) imageUrl = img.imageUrl;
      }
    }
  } catch (e: any) {
    trackError(e, { route: "discovery.image", extra: { category: input.category } });
  }
  attempts.push("image");

  // 4) Audio. Same TTS as the daily.
  let audioUrl: string | null = null;
  const tts = await generateSpeech({
    teacherId,
    text: body.slice(0, 1200),
  });
  if (tts.ok) audioUrl = tts.audioUrl;
  attempts.push("audio");

  // 5) MCQs — 3 comprehension questions, mix of literal / inferential
  //    / main-idea. The learning-objective judge will check this.
  const mcqRes = await generateMCQQuestions({
    teacherId,
    topic: [
      `Generate exactly 3 comprehension questions for this passage.`,
      `Mix question types: one main-idea, one inference / cause-effect, one literal-recall.`,
      `Avoid trivial recall on all three.`,
      ``,
      `Title: ${title}`,
      ``,
      `Passage:`,
      body,
    ].join("\n"),
    gradeLevel,
    count: 3,
    trustedSystem: true,
  });
  if (!mcqRes.ok) return { ok: false, error: `mcq: ${mcqRes.error}` };
  const [mainQ, ...extras] = mcqRes.questions;
  attempts.push("mcq");

  // 6) QC the whole thing.
  const questions = [
    {
      kind: "multiple_choice" as const,
      prompt: mainQ.prompt,
      choices: mainQ.choices,
      correct: mainQ.correct,
      hint: mainQ.hint ?? null,
    },
    ...extras.map((q) => ({
      kind: "multiple_choice" as const,
      prompt: q.prompt,
      choices: q.choices,
      correct: q.correct,
      hint: q.hint ?? null,
    })),
  ];
  let qc = await runFullQuizQc({
    teacherId,
    passageTitle: title,
    passageBody: body,
    gradeLevel,
    questions,
    imageUrl,
    imageScene,
    audioUrl,
  });
  attempts.push(`qc-1:${qc.overall}`);

  // 7) Auto-heal once if needed. We keep it tight here: if the only
  //    fails are passage-level, retry the passage + audio + mcqs
  //    (cascade). If the only fails are image-level, retry the
  //    image. Beyond that we accept warn and ship — kids see anything
  //    that isn't 'fail' (read-time filter).
  let finalImageUrl = imageUrl;
  let finalAudioUrl = audioUrl;
  let finalTitle = title;
  let finalBody = body;
  let finalQuestions = questions;
  if (qc.overall === "fail") {
    const fails = qc.checks.filter((c) => c.severity === "fail");
    const passageFails = fails.filter(
      (c) =>
        c.name === "passage.reading_level" ||
        c.name === "passage.fact_check" ||
        c.name === "passage.judge" ||
        c.name === "passage.length",
    );
    const imageFails = fails.filter((c) => c.name.startsWith("image."));
    const onlyImage = imageFails.length === fails.length && fails.length > 0;
    const onlyPassageOrCascade = passageFails.length === fails.length && fails.length > 0;

    if (onlyImage && imageScene) {
      const brief = await generateImageBrief({
        teacherId,
        passageTitle: finalTitle,
        passageBody: finalBody,
      });
      if (brief.ok) {
        const img = await generateImage({ teacherId, prompt: brief.brief });
        if (img.ok) finalImageUrl = img.imageUrl;
      }
      const { checks: newImg } = await qcImage({
        teacherId,
        imageUrl: finalImageUrl ?? imageUrl ?? "",
        expectedScene: brief.ok ? brief.brief : imageScene,
      });
      const otherChecks = qc.checks.filter((c) => !c.name.startsWith("image."));
      const merged = [...otherChecks, ...newImg];
      const worst = merged.reduce(
        (acc, c) => Math.max(acc, c.severity === "fail" ? 2 : c.severity === "warn" ? 1 : 0),
        0,
      );
      qc = {
        ...qc,
        checks: merged,
        overall: (worst === 2 ? "fail" : worst === 1 ? "warn" : "pass") as
          | "pass" | "warn" | "fail",
      };
      attempts.push(`heal-image:${qc.overall}`);
    } else if (onlyPassageOrCascade) {
      const reasons = passageFails
        .map((c) => `${c.name}: ${c.message}`)
        .join(" ");
      const retryTopic = [
        topic,
        ``,
        `IMPORTANT — previous attempt failed quality review:`,
        reasons,
        `Rewrite the passage so it does not have these issues.`,
        `Keep within ${gradeLevel} Flesch-Kincaid range — do not exceed +1.5 grades above target.`,
        `If fact_check was flagged, only state facts that match Wikipedia's public record.`,
      ].join(" ");
      const retryPassage = await generatePassage({
        teacherId,
        topic: retryTopic,
        gradeLevel,
        lengthLevel: "short",
        trustedSystem: true,
      });
      if (retryPassage.ok) {
        finalTitle = retryPassage.passage.title;
        finalBody = retryPassage.passage.passage;
        const retryTts = await generateSpeech({ teacherId, text: finalBody.slice(0, 1200) });
        if (retryTts.ok) finalAudioUrl = retryTts.audioUrl;
        const retryMcqs = await generateMCQQuestions({
          teacherId,
          topic: [
            `Generate exactly 3 comprehension questions for this passage.`,
            `Mix: main-idea, inference, literal-recall. Avoid all-recall.`,
            ``,
            `Title: ${finalTitle}`,
            ``,
            `Passage:`,
            finalBody,
          ].join("\n"),
          gradeLevel,
          count: 3,
          trustedSystem: true,
        });
        if (retryMcqs.ok) {
          const [m, ...es] = retryMcqs.questions;
          finalQuestions = [
            {
              kind: "multiple_choice" as const,
              prompt: m.prompt,
              choices: m.choices,
              correct: m.correct,
              hint: m.hint ?? null,
            },
            ...es.map((q) => ({
              kind: "multiple_choice" as const,
              prompt: q.prompt,
              choices: q.choices,
              correct: q.correct,
              hint: q.hint ?? null,
            })),
          ];
        }
        qc = await runFullQuizQc({
          teacherId,
          passageTitle: finalTitle,
          passageBody: finalBody,
          gradeLevel,
          questions: finalQuestions,
          imageUrl: finalImageUrl,
          imageScene,
          audioUrl: finalAudioUrl,
        });
        attempts.push(`heal-passage:${qc.overall}`);
      }
    }
  }

  // 8) Persist. Slug from the title; uniqueness guaranteed by suffix.
  const slug = await uniqueSlug(slugify(finalTitle), input.category);
  const finalMain = finalQuestions[0];
  const finalExtras = finalQuestions.slice(1);
  const { data: row, error: insErr } = await admin
    .from("discovery_articles")
    .insert({
      category: input.category,
      slug,
      title: finalTitle,
      body: finalBody,
      image_url: finalImageUrl,
      audio_url: finalAudioUrl,
      question_prompt: finalMain.prompt,
      choices: finalMain.choices,
      correct: finalMain.correct,
      hint: finalMain.hint ?? null,
      extra_questions: finalExtras.length > 0 ? finalExtras : null,
      qc_overall: qc.overall,
      qc_report: qc,
      source: "discovery_factory_v1",
    })
    .select("id, slug")
    .single();
  if (insErr || !row) {
    return { ok: false, error: `insert: ${insErr?.message ?? "no row"}` };
  }
  return {
    ok: true,
    id: (row as any).id,
    slug: (row as any).slug,
    qcOverall: qc.overall,
    attempts,
  };
}
