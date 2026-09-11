/** Server speech uses authored text only; delivery prompts can leak into audio. */
import { getVertexAccessToken, VERTEX_TTS_PROJECT_ID } from "@/lib/ai/vertex-tts";


export async function generateReadeeSpeech(text: string, encoding: "MP3" | "LINEAR16" = "MP3", model: "gemini-2.5-flash-tts" | "gemini-2.5-pro-tts" = "gemini-2.5-flash-tts"): Promise<Buffer> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      signal: AbortSignal.timeout(45000),
      headers: {
        Authorization: `Bearer ${await getVertexAccessToken()}`,
        "Content-Type": "application/json",
        "x-goog-user-project": VERTEX_TTS_PROJECT_ID,
      },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "en-US", name: "Autonoe", model_name: model },
        audioConfig: { audioEncoding: encoding },
      }),
    });
    const result = await response.json();
    if (response.ok && result.audioContent) return Buffer.from(result.audioContent, "base64");
    if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      continue;
    }
    throw new Error(`Reading voice unavailable (${response.status}).`);
  }
  throw new Error("Reading voice unavailable.");
}
