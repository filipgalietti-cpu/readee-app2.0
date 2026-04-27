/**
 * Provider-abstracted speech-to-text.
 *
 * For cases where we just need a plain transcript (no rubric scoring,
 * no per-word annotation), Gemini multimodal is overkill. Cloud Speech-
 * to-Text (Chirp 2) is faster + cheaper for pure ASR.
 *
 * Cost compare on a 5-min audio:
 *   - Gemini multimodal (this is what FluencyRecorder uses today): ~\$0.04
 *   - Google Cloud Speech Chirp 2: ~\$0.024 per minute = \$0.12 per 5 min — actually MORE
 *   - OpenAI Whisper API: \$0.006/min = \$0.03 per 5 min ← cheapest
 *
 * Conclusion: Gemini wins on price for short clips, OpenAI Whisper wins
 * on long clips. We default to Gemini and let callers pass provider
 * = "openai" when they want Whisper for cost reasons.
 *
 * Set OPENAI_API_KEY to enable the OpenAI path.
 */

import { GoogleGenAI } from "@google/genai";
import { trackError } from "@/lib/observability/track";

export type TranscribeProvider = "gemini" | "openai";

let cachedGemini: GoogleGenAI | null = null;
function geminiClient(): GoogleGenAI {
  if (cachedGemini) return cachedGemini;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cachedGemini = new GoogleGenAI({ apiKey });
  return cachedGemini;
}

export async function transcribeAudio(input: {
  audioBase64: string;
  mimeType: string;
  provider?: TranscribeProvider;
}): Promise<{ ok: true; transcript: string; provider: TranscribeProvider } | { ok: false; error: string }> {
  const provider = input.provider ?? "gemini";

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "OPENAI_API_KEY not configured." };
    }
    try {
      const buf = Buffer.from(input.audioBase64, "base64");
      const blob = new Blob([buf], { type: input.mimeType });
      const form = new FormData();
      form.append("file", blob, "audio.webm");
      form.append("model", "whisper-1");
      const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, error: `OpenAI ${res.status}: ${body.slice(0, 240)}` };
      }
      const json = (await res.json()) as { text?: string };
      return { ok: true, transcript: (json.text ?? "").trim(), provider: "openai" };
    } catch (e: any) {
      trackError(e, { route: "transcribe.openai" });
      return { ok: false, error: e?.message ?? "OpenAI transcribe failed." };
    }
  }

  // Default Gemini path.
  try {
    const ai = geminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: input.mimeType, data: input.audioBase64 } },
            { text: "Transcribe this audio verbatim. Return only the transcript text, no preamble." },
          ],
        },
      ],
      config: { temperature: 0.1 },
    });
    const transcript = (response.text ?? "").trim();
    return { ok: true, transcript, provider: "gemini" };
  } catch (e: any) {
    trackError(e, { route: "transcribe.gemini" });
    return { ok: false, error: e?.message ?? "Gemini transcribe failed." };
  }
}
