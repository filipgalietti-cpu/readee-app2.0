/**
 * Parent-side Readee.ai orchestrator ("Ask Readee").
 *
 * Simpler than the teacher assignment wizard — a parent doesn't manage a
 * class, they just want personalized reading content for ONE kid. Output
 * goes to the child_ai_content table and shows up on the child's "My AI
 * library" shelf.
 *
 * Plan gating: Readee+ parents only. Free tier should never hit this
 * function — the server action bounces them to /upgrade before calling.
 *
 * Credit budget: parents get MONTHLY_PARENT_CREDIT_LIMIT (200) vs the
 * teacher cap of 500, reflecting the lower $9.99/mo subscription price.
 * At worst-case saturation that's ~$1/month Gemini spend on $9.99
 * revenue = healthy margin.
 */

import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  generateMCQQuestions,
  generatePassage,
  generateImage,
  generateSpeech,
  logUsage,
  settleBatchAgainstTopUp,
} from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";
import { assertSafePrompt } from "@/lib/ai/safety";
import { getTopUpBalance } from "@/lib/ai/credit-balance";
import {
  resolveHistoricalImage,
  cacheWikipediaImageToSupabase,
} from "@/lib/ai/historical-artifacts";

// Constants, types, and the credit estimator have moved to
// build-parent-content.shared.ts so client components can import them
// without dragging the server surface (Gemini SDK, Vertex auth, admin
// supabase client) into the browser bundle. Re-export so existing
// server-side import paths keep working.
export {
  MONTHLY_PARENT_CREDIT_LIMIT,
  HOURLY_PARENT_CREDIT_LIMIT,
  estimateParentBriefCredits,
  type ParentAiBrief,
  type ParentBuildResult,
} from "./build-parent-content.shared";

import {
  MONTHLY_PARENT_CREDIT_LIMIT,
  HOURLY_PARENT_CREDIT_LIMIT,
  estimateParentBriefCredits,
  type ParentAiBrief,
  type ParentBuildResult,
} from "./build-parent-content.shared";

async function parentBudget(teacherId: string): Promise<{
  allowed: boolean;
  reason?: "hourly" | "monthly";
  hourlyUsed: number;
  monthlyUsed: number;
  topUpBalance: number;
}> {
  const admin = supabaseAdmin();
  const now = Date.now();
  const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: rows }, topUpBalance] = await Promise.all([
    admin
      .from("ai_usage_log")
      .select("credits_used, created_at")
      .eq("teacher_id", teacherId)
      .eq("success", true)
      .gte("created_at", thirtyDaysAgo),
    getTopUpBalance(teacherId, "parent"),
  ]);

  let hourlyUsed = 0;
  let monthlyUsed = 0;
  for (const r of (rows ?? []) as any[]) {
    const c = Number(r.credits_used ?? 0);
    monthlyUsed += c;
    if (r.created_at >= oneHourAgo) hourlyUsed += c;
  }

  const effectiveMonthlyLimit = MONTHLY_PARENT_CREDIT_LIMIT + topUpBalance;
  return {
    allowed:
      monthlyUsed < effectiveMonthlyLimit &&
      hourlyUsed < HOURLY_PARENT_CREDIT_LIMIT,
    reason:
      monthlyUsed >= effectiveMonthlyLimit
        ? "monthly"
        : hourlyUsed >= HOURLY_PARENT_CREDIT_LIMIT
        ? "hourly"
        : undefined,
    hourlyUsed,
    monthlyUsed,
    topUpBalance,
  };
}

function validate(brief: ParentAiBrief): string | null {
  if (!brief.childId) return "Pick a child first.";
  if (!brief.topic.trim()) return "Describe what your child should read about.";
  const qCount = Math.floor(brief.questionCount);
  if (qCount < 0 || qCount > 5)
    return "Pick between 0 and 5 comprehension questions.";
  if (!brief.passage.enabled && qCount === 0)
    return "Enable the passage or add at least one question.";
  if (brief.media.image && !brief.passage.enabled)
    return "Image requires a passage to illustrate.";
  if (brief.media.passageTts && !brief.passage.enabled)
    return "Passage audio requires a passage.";
  return null;
}

export async function buildParentContent(input: {
  parentId: string;
  brief: ParentAiBrief;
}): Promise<ParentBuildResult> {
  const { parentId, brief } = input;

  const validationErr = validate(brief);
  if (validationErr) return { ok: false, error: validationErr };

  const safety = assertSafePrompt(
    [brief.topic, brief.phonicsPattern ?? ""].join(" "),
  );
  if (!safety.ok) return { ok: false, error: safety.error };

  const projected = estimateParentBriefCredits(brief);
  if (projected > MONTHLY_PARENT_CREDIT_LIMIT) {
    return {
      ok: false,
      error: `This would cost ${projected} credits, above your ${MONTHLY_PARENT_CREDIT_LIMIT}/mo plan limit.`,
    };
  }
  const budget = await parentBudget(parentId);
  const effectiveLimit = MONTHLY_PARENT_CREDIT_LIMIT + budget.topUpBalance;
  if (budget.monthlyUsed + projected > effectiveLimit) {
    return {
      ok: false,
      error: `Not enough credits this month. You need ${projected}, ${
        effectiveLimit - budget.monthlyUsed
      } remain${
        budget.topUpBalance > 0 ? ` (${budget.topUpBalance} from top-ups)` : ""
      }. Top up to keep generating.`,
    };
  }
  if (!budget.allowed && budget.reason === "hourly") {
    return {
      ok: false,
      error: `You've generated a lot in the last hour. Try again in a bit — this cap resets continuously.`,
    };
  }
  const monthlyUsedBefore = budget.monthlyUsed;

  const admin = supabaseAdmin();

  // Load the child to get their grade level — we LOCK generation to their
  // profile grade so a parent can't accidentally make a 4th-grade passage
  // for a K kid.
  const { data: childRow, error: childErr } = await admin
    .from("children")
    .select("id, parent_id, first_name, reading_level")
    .eq("id", brief.childId)
    .eq("parent_id", parentId)
    .maybeSingle();
  if (childErr || !childRow) {
    return { ok: false, error: "Child not found or not yours." };
  }
  const grade = ((childRow as any).reading_level ?? "2nd") as string;
  const childFirstName = (childRow as any).first_name as string;

  let creditsUsed = 0;
  const warnings: string[] = [];

  // Layer 4 constraint: when sharing is on, the generator avoids proper
  // names / places so the output is broadly reusable. Layered in as an
  // extra system-instruction prefix to the topic.
  const topicForGeneration = brief.shareWithCommunity
    ? `${brief.topic.trim()}\n\nIMPORTANT: Produce content that is universally readable. Use generic character names like Alex or Sam, generic places like "a park" or "a classroom". No real schools, real events, or identifiable personal details.`
    : `${brief.topic.trim()}\n\nWrite this for a child whose name is ${childFirstName}. You may include their name naturally in the passage.`;

  // ── Passage ────────────────────────────────────────────────────────
  let passageTitle: string | null = null;
  let passageText: string | null = null;
  let passageImageUrl: string | null = null;
  let passageAudioUrl: string | null = null;

  if (brief.passage.enabled) {
    const passRes = await generatePassage({
      teacherId: parentId,
      topic: topicForGeneration,
      gradeLevel: grade,
      phonicsPattern: brief.phonicsPattern ?? null,
      // Parent-side at-home practice — keep tight by default so a
      // K-1 kid isn't reading a 200-word essay before bed.
      lengthLevel: (brief as any).passageLength ?? "short",
    });
    if (passRes.ok) {
      passageTitle = passRes.passage.title;
      passageText = passRes.passage.passage;
      creditsUsed += CREDIT_COST.passage_generation;
    } else {
      warnings.push(`Passage: ${passRes.error}`);
    }

    if (passageText && brief.media.image) {
      // Historical figures: try Wikipedia first (royalty-free,
      // accurate likeness). If the passage centers on a real
      // historical figure and we can grab their Wikipedia lead
      // image, use that instead of asking Imagen — which can't
      // reliably render named real people.
      const resolved = await resolveHistoricalImage(
        passageTitle ?? brief.topic,
        passageText,
      );
      if (resolved.kind === "royalty_free") {
        const cachedUrl = await cacheWikipediaImageToSupabase(
          resolved.figureName,
          resolved.imageUrl,
        );
        passageImageUrl = cachedUrl ?? resolved.imageUrl;
      } else {
        // AI gen path. If a named figure was detected (living person
        // or no Wikipedia hit), tell the image-brief generator to
        // describe a thematic stand-in instead of the figure.
        const figureGuard = resolved.avoidNamedPerson && resolved.figureName
          ? ` IMPORTANT: do NOT depict ${resolved.figureName}'s likeness — show a thematic stand-in scene (the activity, era, or setting) without a recognizable face.`
          : "";
        const imgRes = await generateImage({
          teacherId: parentId,
          prompt: `Illustration for a children's reading passage titled "${passageTitle}". Scene: ${brief.topic}.${figureGuard}`,
        });
        if (imgRes.ok) {
          passageImageUrl = imgRes.imageUrl;
          creditsUsed += CREDIT_COST.image_generation;
        } else {
          warnings.push(`Image: ${imgRes.error}`);
        }
      }
    }

    if (passageText && brief.media.passageTts) {
      const ttsRes = await generateSpeech({
        teacherId: parentId,
        text: passageText.slice(0, 1200),
        voice: brief.voice,
      });
      if (ttsRes.ok) {
        passageAudioUrl = ttsRes.audioUrl;
        creditsUsed += CREDIT_COST.tts_generation;
      } else {
        warnings.push(`Passage audio: ${ttsRes.error}`);
      }
    }
  }

  // ── Questions ──────────────────────────────────────────────────────
  const qCount = Math.max(0, Math.min(5, Math.floor(brief.questionCount)));
  let questions: {
    prompt: string;
    choices: string[];
    correct: string;
    hint: string | null;
    audioUrl?: string | null;
  }[] = [];

  if (qCount > 0) {
    const context = passageText
      ? `The passage below is what the child reads. Write questions strictly about it.\n\nPassage:\n"""\n${passageText}\n"""`
      : topicForGeneration;
    const mcqRes = await generateMCQQuestions({
      teacherId: parentId,
      topic: context,
      gradeLevel: grade,
      count: qCount,
    });
    if (mcqRes.ok) {
      questions = mcqRes.questions.map((q) => ({ ...q, audioUrl: null }));
      creditsUsed += CREDIT_COST.quiz_generation;
    } else {
      warnings.push(`Questions: ${mcqRes.error}`);
    }
  }

  // ── Per-question TTS ───────────────────────────────────────────────
  if (brief.media.perQuestionTts && questions.length > 0) {
    for (let i = 0; i < questions.length; i++) {
      const ttsRes = await generateSpeech({
        teacherId: parentId,
        text: questions[i].prompt.slice(0, 1200),
        voice: brief.voice,
      });
      if (ttsRes.ok) {
        questions[i].audioUrl = ttsRes.audioUrl;
        creditsUsed += CREDIT_COST.tts_generation;
      } else {
        warnings.push(`Audio for Q${i + 1}: ${ttsRes.error}`);
      }
    }
  }

  // At minimum the caller needs SOMETHING — either a passage or at least
  // one question. If both failed, there's nothing to save.
  if (!passageText && questions.length === 0) {
    trackError(new Error("buildParentContent produced nothing"), {
      route: "ask-readee",
      userId: parentId,
      extra: { brief, warnings },
    });
    return { ok: false, error: "Couldn't generate content. Try a different topic." };
  }

  // ── Persist ────────────────────────────────────────────────────────
  const { data: inserted, error: insErr } = await admin
    .from("child_ai_content")
    .insert({
      parent_id: parentId,
      child_id: brief.childId,
      kind: brief.passage.enabled ? "passage" : "practice_set",
      topic: brief.topic.trim().slice(0, 400),
      grade_level: grade,
      phonics_pattern: brief.phonicsPattern?.trim() || null,
      title: passageTitle,
      passage_text: passageText,
      questions: questions.length > 0 ? questions : null,
      image_url: passageImageUrl,
      audio_url: passageAudioUrl,
      shared: brief.shareWithCommunity,
      shared_at: brief.shareWithCommunity ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (insErr || !inserted) {
    return {
      ok: false,
      error: insErr?.message ?? "Couldn't save the generated content.",
    };
  }

  // Debit the parent top-up pool for any spend past the monthly cap.
  await settleBatchAgainstTopUp({
    profileId: parentId,
    pool: "parent",
    monthlyUsedBefore,
    creditsConsumed: creditsUsed,
    monthlyLimit: MONTHLY_PARENT_CREDIT_LIMIT,
  });

  return {
    ok: true,
    contentId: (inserted as any).id as string,
    warnings,
    creditsUsed,
  };
}
