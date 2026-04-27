/**
 * Multilingual content via Gemini.
 *
 * Caches translations in DB so we never re-pay for identical
 * (text, target_lang) pairs. Used for:
 *   - On-the-fly passage / lesson / story translation for ELL kids
 *   - Parent-facing letters and digests in their home language
 *   - Quiz prompts with native-language gloss
 *
 * Margin: Gemini text is ~$0.005/call ≈ 1 credit. With caching most
 * page views are free. Charge 1 credit per fresh translation, 0 for
 * cached. Net margin > 95%.
 *
 * Provider note: We use Gemini for translation since it's already
 * wired and quality is excellent on supported languages. Cloud
 * Translation API would be cheaper at high volume — easy swap later.
 */

import { createHash } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logUsage, MODEL_ID } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

export const SUPPORTED_LANGUAGES = [
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "zh", name: "Mandarin", nativeName: "中文" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "ht", name: "Haitian Creole", nativeName: "Kreyòl Ayisyen" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "tl", name: "Tagalog", nativeName: "Tagalog" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

function hashKey(text: string, lang: LanguageCode): string {
  return createHash("sha256").update(`${lang}\n${text}`).digest("hex");
}

const SYSTEM = `You translate kid-friendly reading content for elementary students and their families.
Rules:
- Preserve markdown like **bold** and line breaks exactly.
- Use natural, age-appropriate vocabulary in the target language. Don't transliterate names of fictional characters — translate them only if there's a well-known equivalent.
- Keep contractions and casual register where the source has them.
- Return ONLY the translated text. No preamble, no language tag, no quotes.`;

/**
 * Translate text into one of the supported languages. Cached by
 * sha256(text+lang) — second call is free.
 */
export async function translateText(input: {
  text: string;
  targetLang: LanguageCode;
  userId?: string | null;
}): Promise<{ ok: true; translated: string; cached: boolean } | { ok: false; error: string }> {
  const text = input.text.trim();
  if (!text) return { ok: false, error: "Text required." };
  if (text.length > 5000) {
    return { ok: false, error: "Text too long. Keep under 5,000 characters." };
  }

  const admin = supabaseAdmin();
  const key = hashKey(text, input.targetLang);

  // Cache hit?
  const { data: existing } = await admin
    .from("translations_cache")
    .select("translated_text")
    .eq("hash_key", key)
    .maybeSingle();
  if (existing && (existing as any).translated_text) {
    return { ok: true, translated: (existing as any).translated_text, cached: true };
  }

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const langName =
    SUPPORTED_LANGUAGES.find((l) => l.code === input.targetLang)?.name ?? input.targetLang;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: `Target language: ${langName}\n\nSource text:\n"""\n${text}\n"""`,
      config: {
        systemInstruction: SYSTEM,
        temperature: 0.3,
      },
    });
    const translated = (response.text ?? "").trim();
    if (!translated) throw new Error("Empty translation.");

    // Cache it.
    await admin.from("translations_cache").upsert(
      {
        hash_key: key,
        source_text: text.slice(0, 8000),
        target_lang: input.targetLang,
        translated_text: translated,
      },
      { onConflict: "hash_key" },
    );

    if (input.userId) {
      await logUsage({
        teacherId: input.userId,
        kind: "passage_generation",
        model: MODEL_ID,
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
        creditsUsed: CREDIT_COST.passage_generation,
        success: true,
        requestSummary: `translate(${input.targetLang}): ${text.slice(0, 80)}`,
      });
    }
    return { ok: true, translated, cached: false };
  } catch (e: any) {
    trackError(e, {
      route: "translate.translateText",
      tags: { target: input.targetLang },
    });
    return { ok: false, error: e?.message ?? "Translation failed." };
  }
}
