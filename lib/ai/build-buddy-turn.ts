/**
 * Reading Buddy — turn-based MVP.
 *
 * The kid speaks for a few seconds; we send the audio + recent
 * conversation history + the passage they're reading to Gemini, get
 * back a kid-friendly text response, then TTS that response. Browser
 * plays it.
 *
 * This is NOT true Gemini Live (sub-500ms WebSocket bidi audio). For
 * that we need a long-lived process (Cloud Run / dedicated WS server)
 * since Vercel serverless can't hold open connections. This MVP runs
 * fine on Vercel today and the upgrade path is just swapping the
 * runWithBuddy implementation for a WebSocket-based one.
 *
 * Margin: 1 multimodal call (~3s audio in + short text out) ≈ \$0.005.
 * 1 TTS reply ≈ \$0.01. Total ~\$0.015/turn → 4 credits charged.
 * A 5-min session = ~30 turns = \$0.45. Worth it for the killer demo.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { logUsage, MODEL_ID, generateSpeech } from "@/lib/ai/readee-ai";
import { CREDIT_COST } from "@/lib/ai/credits";
import { trackError } from "@/lib/observability/track";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

const SYSTEM = `You are Readee, a warm, patient reading buddy for a K-4 child. The child is reading along with you. They will speak to you — sometimes asking what a word means, sometimes reading aloud, sometimes asking a question about the passage.

Rules:
- Keep replies SHORT (1-3 sentences). Kids tune out long answers.
- Match their grade level vocabulary. K-1: very simple words.
- If they ask what a word means, give a kid-friendly definition + one quick example. Don't lecture.
- If they're sounding out a word, gently support — say the word slowly, break it into chunks.
- If they ask a comprehension question about the passage, answer it warmly and briefly.
- If they go off-topic (talking about Minecraft, asking personal info), gently redirect: "That sounds fun! Let's keep reading first, okay?"
- NEVER pretend to be a human. If asked, say you're Readee, the reading helper.
- Stay safe. No personal information. Refuse anything inappropriate.

Tone: warm, encouraging, bunny-mascot energy.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    transcript: { type: Type.STRING },
    reply: { type: Type.STRING },
    end_session: { type: Type.BOOLEAN },
  },
  required: ["transcript", "reply"],
};

export type BuddyTurn = {
  childTranscript: string;
  reply: string;
  audioUrl: string | null;
  endSession: boolean;
};

export async function runBuddyTurn(input: {
  callerId: string;
  childAudioBase64: string;
  childAudioMimeType: string;
  passageText: string;
  gradeLevel?: string | null;
  /** Recent reply history for soft conversation continuity. */
  history?: { role: "child" | "buddy"; text: string }[];
  voice?: string;
  voiceStyle?: string | null;
}): Promise<{ ok: true; turn: BuddyTurn } | { ok: false; error: string }> {
  if (!input.childAudioBase64) return { ok: false, error: "Audio required." };
  if (!input.passageText.trim()) return { ok: false, error: "Passage required." };

  let ai: GoogleGenAI;
  try {
    ai = client();
  } catch (e: any) {
    return { ok: false, error: e.message ?? "AI not configured." };
  }

  const historyBlock = (input.history ?? [])
    .slice(-10)
    .map((h) => `${h.role === "child" ? "Child" : "Readee"}: ${h.text}`)
    .join("\n");

  const userPrompt = [
    `Grade level: ${input.gradeLevel ?? "K-4"}`,
    "",
    `Passage they're reading:`,
    `"""\n${input.passageText.slice(0, 4000)}\n"""`,
    "",
    historyBlock ? `Recent conversation:\n${historyBlock}` : "",
    "",
    "1) Transcribe what the child just said in the audio.",
    "2) Write Readee's short, warm reply.",
    "3) end_session = true only if the child clearly said goodbye or wants to stop.",
  ]
    .filter(Boolean)
    .join("\n");

  let childTranscript = "";
  let reply = "";
  let endSession = false;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: input.childAudioMimeType,
                data: input.childAudioBase64,
              },
            },
            { text: userPrompt },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.6,
      },
    });
    const parsed = JSON.parse(response.text ?? "{}") as Partial<{
      transcript: string;
      reply: string;
      end_session: boolean;
    }>;
    childTranscript = (parsed.transcript ?? "").trim();
    reply = (parsed.reply ?? "").trim();
    endSession = !!parsed.end_session;

    await logUsage({
      teacherId: input.callerId,
      kind: "passage_generation",
      model: MODEL_ID,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      creditsUsed: CREDIT_COST.passage_generation * 2,
      success: true,
      requestSummary: `buddy_turn: ${childTranscript.slice(0, 100)}`,
    });
  } catch (e: any) {
    trackError(e, { route: "build-buddy-turn", userId: input.callerId });
    return { ok: false, error: e?.message ?? "Buddy turn failed." };
  }

  // TTS the reply (skip if empty / session ending without a reply).
  let audioUrl: string | null = null;
  if (reply) {
    const ttsRes = await generateSpeech({
      teacherId: input.callerId,
      text: reply,
      voice: input.voice ?? "Autonoe",
      style: input.voiceStyle ?? null,
    });
    if (ttsRes.ok) {
      audioUrl = ttsRes.audioUrl;
    }
  }

  return {
    ok: true,
    turn: { childTranscript, reply, audioUrl, endSession },
  };
}
