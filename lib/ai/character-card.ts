/**
 * Cross-image character consistency helper.
 *
 * Reads multi-page/multi-slide content, asks Gemini whether there's a
 * single recurring main character, and if so returns:
 *   - description: detailed visual DNA (species, color, signature features)
 *   - cardPrompt: prompt for a clean character-card portrait
 *
 * Used to anchor every page/slide image to the same character so the
 * cat looks like the same cat throughout the book/slideshow.
 *
 * Returns hasCharacter=false for content with no clear protagonist
 * (concept lessons, informational slides) — caller should skip the
 * reference-image step in that case.
 */

import { Type } from "@google/genai";
import { getClient, MODEL_ID, logUsage } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

const CHARACTER_CARD_SYSTEM = `You design a visual "character card" so the same character looks identical across every illustration in a kids' picture book or slideshow lesson.

Read the content. Decide if there is ONE clearly recurring main character (a kid, an animal, a creature) that appears in MULTIPLE pages/slides. If yes, describe it precisely. If the content is informational (water cycle, the moon, key details as a reading skill) or has different characters on every page, set has_character=false.

When has_character=true, return:
- description: 2-3 short sentences capturing the character's species/type, body shape, fur/skin/feather color, eye color, distinctive features (spots, stripes, accessories like a red scarf or yellow hat). Be specific so a different illustrator could draw the same character.
- card_prompt: a one-sentence prompt for a clean character portrait — just the character standing centered against a soft solid pastel background, no scene, no other characters, no text.

When has_character=false, set description and card_prompt to empty strings.`;

const CHARACTER_CARD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    has_character: { type: Type.BOOLEAN },
    description: { type: Type.STRING },
    card_prompt: { type: Type.STRING },
  },
  required: ["has_character", "description", "card_prompt"],
};

export async function extractCharacterCard(input: {
  teacherId: string;
  title: string;
  /** Each item is one page or slide of body text. */
  units: string[];
  /** Tag for logging only. */
  contextTag?: string;
}): Promise<
  | { ok: true; hasCharacter: false }
  | { ok: true; hasCharacter: true; description: string; cardPrompt: string }
  | { ok: false; error: string }
> {
  let client: ReturnType<typeof getClient>;
  try {
    client = getClient();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const text = `Title: ${input.title}\n\n${input.units
    .map((u, i) => `Unit ${i + 1}: ${u}`)
    .join("\n")}`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: text,
      config: {
        systemInstruction: CHARACTER_CARD_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: CHARACTER_CARD_SCHEMA,
        temperature: 0.4,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      has_character?: boolean;
      description?: string;
      card_prompt?: string;
    };
    await logUsage({
      teacherId: input.teacherId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.passage_generation,
      success: true,
      requestSummary: `character_card${input.contextTag ? `:${input.contextTag}` : ""}: ${input.title.slice(0, 80)}`,
    });

    if (!parsed.has_character) {
      return { ok: true, hasCharacter: false };
    }
    const description = (parsed.description ?? "").trim();
    const cardPrompt = (parsed.card_prompt ?? "").trim();
    if (!description || !cardPrompt) {
      return { ok: true, hasCharacter: false };
    }
    return { ok: true, hasCharacter: true, description, cardPrompt };
  } catch (e: any) {
    trackError(e, {
      route: "character-card.extractCharacterCard",
      userId: input.teacherId,
    });
    return { ok: false, error: e.message ?? "Character card failed." };
  }
}
