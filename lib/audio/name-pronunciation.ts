/**
 * How a child's name is SAID. The written name (children.first_name) never
 * changes; `name_said_as` is a respelling ("fee-LOOSH" for "Filus") that only
 * the voice uses. A parent records the name once; Gemini listens and writes
 * the respelling; the parent hears Luna say it and can nudge the spelling.
 * Text-to-speech cannot be conditioned on audio directly, so this is the hop.
 */
import { GoogleGenAI } from "@google/genai";
import { MODEL_ID } from "@/lib/ai/readee-ai";

const LISTEN_MODEL = "gemini-2.5-pro";

let cached: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

export { SAID_AS_MAX, cleanSaidAs, spokenNameOf, withSpokenName } from "./name-spoken";
import { cleanSaidAs } from "./name-spoken";

/**
 * Listen to a short recording of someone saying the name and return a
 * respelling a text-to-speech voice can read. Empty string when unclear.
 */
export async function respellNameFromAudio(input: { audioBase64: string; mimeType: string; writtenName: string }): Promise<{ saidAs: string; heard: string }> {
  const ai = client();
  const written = (input.writtenName ?? "").trim().slice(0, 40);
  const prompt =
    `You will hear a child or a parent say the child's first name, once or twice. The name is written "${written}", but the ` +
    `written spelling is only a hint: transcribe the SOUNDS you actually hear, even when they differ from how that spelling is ` +
    `usually said (family names, nicknames and other languages often do). ` +
    `Reply with JSON only: {"heard": "<the name as you heard it, plain letters>", "saidAs": "<a respelling for an English text-to-speech voice: ` +
    `lowercase syllables joined by hyphens, the stressed syllable in CAPITALS, plain English sound spellings, for example fee-LOOSH or ma-REE-ah>"}. ` +
    `If the audio is silent, is not a name, or you are not sure, set both fields to "".`;
  const contents = [{ role: "user", parts: [{ inlineData: { mimeType: input.mimeType, data: input.audioBase64 } }, { text: prompt }] }];
  const config = { responseMimeType: "application/json", temperature: 0.1 };
  // The pro model hears children's voices better; fall back to the everyday model if it is unavailable.
  let raw = "{}";
  try {
    raw = (await ai.models.generateContent({ model: LISTEN_MODEL, contents, config })).text ?? "{}";
  } catch {
    raw = (await ai.models.generateContent({ model: MODEL_ID, contents, config })).text ?? "{}";
  }
  try {
    const j = JSON.parse(raw) as { heard?: string; saidAs?: string };
    return { saidAs: cleanSaidAs(j.saidAs), heard: cleanSaidAs(j.heard) };
  } catch {
    return { saidAs: "", heard: "" };
  }
}
