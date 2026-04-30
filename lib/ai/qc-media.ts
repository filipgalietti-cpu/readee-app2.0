/**
 * Media QC — audio and image quality judges using Gemini multimodal.
 *
 * judgeAudioFile: fetches an audio URL, hands it to Gemini, asks if
 * it sounds normal — no robotic glitches, no silence, no truncation,
 * matches expected text. Gemini 2.5 Flash supports audio input.
 *
 * judgeImageQuality: stronger judge than the existing image.judge
 * (which checks kid-safe + on-prompt). Specifically looks for the
 * Imagen failure modes: extra fingers, mangled faces, broken text,
 * missing/extra body parts, visually nonsensical composition.
 */

import { GoogleGenAI, Type } from "@google/genai";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

const MEDIA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    severity: {
      type: Type.STRING,
      enum: ["pass", "warn", "fail"],
    },
    reason: { type: Type.STRING },
  },
  required: ["severity", "reason"],
};

const AUDIO_JUDGE_SYSTEM = `You are auditing a TTS audio clip used in a K-4 reading app. Listen and evaluate.

Return severity + reason.

PASS if all of:
- Plays cleanly start to finish (no silence, no truncation mid-word)
- Voice is natural-sounding (no robotic glitches, stutters, or chipmunk speed)
- Pronunciation is correct for elementary-grade English
- Pace is appropriate for K-4 (not breakneck, not painfully slow)
- Matches the expected text reasonably well (small phrasing differences are fine)

WARN if there's a small issue (slightly fast, mildly off pronunciation, brief audio artifact) but the kid would still understand.

FAIL if a kid would be confused: silent file, corrupted, completely wrong text, painfully unnatural delivery, missing words, or content doesn't match the expected text at all.

Reason MUST cite the specific issue heard.`;

const IMAGE_QUALITY_JUDGE_SYSTEM = `You are auditing an AI-generated children's book illustration. The existing image judge already checks kid-safe + on-prompt. YOUR job is to catch IMAGEN VISUAL FAILURES — the things that make AI art look weird:

PASS if:
- Anatomy is correct (hands have ~5 fingers, faces are coherent, bodies are intact)
- Composition makes sense (no half-floating objects, no people merged into walls, no impossible perspectives)
- Objects are integral (a bird has its wings, a chair has its legs, a dog has 4 limbs)
- No broken text, garbled letters, or mangled signs
- Style is consistent (no half-cartoon-half-realistic mash)

WARN for minor issues — slightly off-perspective, one over-detailed background element, eyes that look slightly off — that wouldn't bother a young kid but an adult would notice.

FAIL for the classic Imagen problems: extra fingers/limbs, distorted faces, hands grabbing nothing, half-rendered objects, characters with the wrong number of body parts, broken signage with garbled letters, completely incoherent scenes.

Reason MUST name the specific visual issue you see.`;

export type MediaSeverity = "pass" | "warn" | "fail";

async function fetchAsBase64(
  url: string,
): Promise<{ base64: string; mimeType: string } | { error: string }> {
  try {
    const r = await fetch(url);
    if (!r.ok) return { error: `${r.status} from ${url}` };
    const mimeType = r.headers.get("content-type") ?? "application/octet-stream";
    const buf = Buffer.from(await r.arrayBuffer());
    return { base64: buf.toString("base64"), mimeType };
  } catch (e: any) {
    return { error: e?.message ?? "fetch failed" };
  }
}

export async function judgeAudioFile(input: {
  audioUrl: string;
  /** Text we expected the TTS to read (prompt, hint, or passage). */
  expectedText: string;
}): Promise<
  | { ok: true; severity: MediaSeverity; reason: string }
  | { ok: false; error: string }
> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const fetched = await fetchAsBase64(input.audioUrl);
  if ("error" in fetched) {
    return { ok: false, error: `audio fetch: ${fetched.error}` };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Expected text the TTS should be reading:\n"""\n${input.expectedText.slice(0, 1500)}\n"""\n\nListen to the clip and evaluate.`,
            },
            { inlineData: { data: fetched.base64, mimeType: fetched.mimeType } },
          ],
        },
      ],
      config: {
        systemInstruction: AUDIO_JUDGE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: MEDIA_SCHEMA,
        temperature: 0.0,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: string;
      reason?: string;
    };
    const severity = (
      ["pass", "warn", "fail"] as const
    ).includes(parsed.severity as MediaSeverity)
      ? (parsed.severity as MediaSeverity)
      : "warn";
    return {
      ok: true,
      severity,
      reason: String(parsed.reason ?? "").trim(),
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Audio judge failed." };
  }
}

export async function judgeImageQuality(input: {
  imageUrl: string;
  /** What the image is supposed to depict — passage scene, lesson topic, etc. */
  expectedScene: string;
}): Promise<
  | { ok: true; severity: MediaSeverity; reason: string }
  | { ok: false; error: string }
> {
  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const fetched = await fetchAsBase64(input.imageUrl);
  if ("error" in fetched) {
    return { ok: false, error: `image fetch: ${fetched.error}` };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Expected scene: ${input.expectedScene.slice(0, 400)}\n\nReview the image for visual coherence. Look hard at hands, faces, object integrity, and composition.`,
            },
            { inlineData: { data: fetched.base64, mimeType: fetched.mimeType } },
          ],
        },
      ],
      config: {
        systemInstruction: IMAGE_QUALITY_JUDGE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: MEDIA_SCHEMA,
        temperature: 0.0,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as {
      severity?: string;
      reason?: string;
    };
    const severity = (
      ["pass", "warn", "fail"] as const
    ).includes(parsed.severity as MediaSeverity)
      ? (parsed.severity as MediaSeverity)
      : "warn";
    return {
      ok: true,
      severity,
      reason: String(parsed.reason ?? "").trim(),
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Image quality judge failed." };
  }
}
