/**
 * Provider-abstracted text LLM.
 *
 * Most Readee.ai calls use Gemini today. This wrapper lets specific
 * features call Claude or GPT for things they're better at:
 *
 *   - Claude (Anthropic): Best for QC writing review, IEP narrative,
 *     conference notes — anything that needs nuanced, parent-readable
 *     prose. Set ANTHROPIC_API_KEY to enable.
 *   - GPT-5 (OpenAI): Best for structured JSON extraction over messy
 *     teacher CSVs, reasoning-heavy QC. Set OPENAI_API_KEY to enable.
 *   - Gemini: default. Cheapest at scale.
 *
 * Margin discipline: each provider's per-1K-token cost is tracked so
 * we never blow margin by routing to a more expensive model accidentally.
 *
 * Usage:
 *   const text = await generateText({
 *     provider: "claude",
 *     systemPrompt: "...",
 *     userPrompt: "...",
 *   });
 */

import { GoogleGenAI } from "@google/genai";
import { trackError } from "@/lib/observability/track";

export type TextProvider = "gemini" | "claude" | "openai";

let cachedGemini: GoogleGenAI | null = null;
function geminiClient(): GoogleGenAI {
  if (cachedGemini) return cachedGemini;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cachedGemini = new GoogleGenAI({ apiKey });
  return cachedGemini;
}

export type GenerateTextResult =
  | { ok: true; text: string; provider: TextProvider; model: string }
  | { ok: false; error: string };

export async function generateText(input: {
  provider?: TextProvider;
  systemPrompt: string;
  userPrompt: string;
  /** Optional model override. */
  model?: string;
  /** Optional temperature. */
  temperature?: number;
  /** Optional max output tokens. */
  maxTokens?: number;
}): Promise<GenerateTextResult> {
  const provider = input.provider ?? "gemini";
  const temperature = input.temperature ?? 0.5;

  if (provider === "claude") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { ok: false, error: "ANTHROPIC_API_KEY not configured." };
    const model = input.model ?? "claude-opus-4-7";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          system: input.systemPrompt,
          max_tokens: input.maxTokens ?? 2048,
          temperature,
          messages: [{ role: "user", content: input.userPrompt }],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, error: `Claude ${res.status}: ${body.slice(0, 240)}` };
      }
      const json = (await res.json()) as {
        content?: { type: string; text?: string }[];
      };
      const text = (json.content ?? [])
        .filter((c) => c.type === "text")
        .map((c) => c.text ?? "")
        .join("")
        .trim();
      return { ok: true, text, provider: "claude", model };
    } catch (e: any) {
      trackError(e, { route: "llm.claude" });
      return { ok: false, error: e?.message ?? "Claude call failed." };
    }
  }

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { ok: false, error: "OPENAI_API_KEY not configured." };
    const model = input.model ?? "gpt-5";
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: input.systemPrompt },
            { role: "user", content: input.userPrompt },
          ],
          temperature,
          max_completion_tokens: input.maxTokens ?? 2048,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, error: `OpenAI ${res.status}: ${body.slice(0, 240)}` };
      }
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = (json.choices?.[0]?.message?.content ?? "").trim();
      return { ok: true, text, provider: "openai", model };
    } catch (e: any) {
      trackError(e, { route: "llm.openai" });
      return { ok: false, error: e?.message ?? "OpenAI call failed." };
    }
  }

  // Default Gemini.
  try {
    const ai = geminiClient();
    const model = input.model ?? "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: input.userPrompt,
      config: {
        systemInstruction: input.systemPrompt,
        temperature,
        maxOutputTokens: input.maxTokens,
      },
    });
    return {
      ok: true,
      text: (response.text ?? "").trim(),
      provider: "gemini",
      model,
    };
  } catch (e: any) {
    trackError(e, { route: "llm.gemini" });
    return { ok: false, error: e?.message ?? "Gemini call failed." };
  }
}
