/** Vertex AI TTS — same Google, different quota envelope.
 *
 * The free-tier-equivalent Gemini API caps preview-TTS models at 100
 * reqs/day even with billing on. Vertex AI bypasses that preview cap
 * entirely (project-level Vertex quotas, 1k+ RPM, no daily ceiling).
 * Same Autonoe voice, same audio quality. Pattern lifted from
 * scripts/generate-audio.js (the legacy mass generator that produced
 * the original 1,800+ catalog audios).
 *
 * Server-only by construction: google-auth-library imports node's
 * child_process / fs / net, so any client bundle pulling this
 * transitively fails at build time. We previously had `import
 * "server-only"` here for a clearer error, but that marker isn't
 * installed and breaks plain-Node CLI scripts that legitimately
 * need to call this code (qc-bot regen workers, the per-step audio
 * enricher, the original generate-audio.js mass generator).
 */

export const VERTEX_TTS_PROJECT_ID =
  process.env.VERTEX_PROJECT_ID || "readee-487403";
export const VERTEX_TTS_LOCATION = "us-central1";
export const VERTEX_TTS_MODEL = "gemini-2.5-pro-preview-tts";

let _vertexAuthClient: any = null;
let _vertexToken: string | null = null;
let _vertexTokenAt = 0;
const VERTEX_TOKEN_TTL_MS = 15 * 60 * 1000;

export async function getVertexAccessToken(): Promise<string> {
  const now = Date.now();
  if (_vertexToken && now - _vertexTokenAt < VERTEX_TOKEN_TTL_MS) {
    return _vertexToken;
  }
  if (!_vertexAuthClient) {
    const { GoogleAuth } = await import("google-auth-library");
    const credsRaw = process.env.GOOGLE_CREDENTIALS_JSON;
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      credentials: credsRaw ? JSON.parse(credsRaw) : undefined,
    });
    _vertexAuthClient = await auth.getClient();
  }
  const { token } = await _vertexAuthClient.getAccessToken();
  if (!token) throw new Error("Vertex AI: failed to fetch access token");
  _vertexToken = token;
  _vertexTokenAt = now;
  return token;
}

export async function generateSpeechVertex(opts: {
  text: string;
  voice: string;
  style?: string | null;
}): Promise<{ ok: true; pcmBase64: string } | { ok: false; error: string }> {
  let token: string;
  try {
    token = await getVertexAccessToken();
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Vertex auth failed" };
  }

  // Calmer / warmer / less excited per Filip's 2026-05-03 direction.
  // Default style emphasizes natural reading-teacher tone over the
  // "perky kids' show host" register that the model defaults to.
  const styleDirection =
    opts.style?.trim() ||
    "in a calm, warm reading-teacher voice. Conversational and unhurried. Don't sound excited or perky — sound like a kind adult who reads with kids every day";
  const url = `https://${VERTEX_TTS_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_TTS_PROJECT_ID}/locations/${VERTEX_TTS_LOCATION}/publishers/google/models/${VERTEX_TTS_MODEL}:streamGenerateContent`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `Read this ${styleDirection}: ${opts.text}` }],
      },
    ],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: opts.voice } },
      },
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    return { ok: false, error: `Vertex ${res.status}: ${txt.slice(0, 400)}` };
  }
  const json: any = await res.json();
  const chunks = Array.isArray(json) ? json : [json];
  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const parts = chunk?.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      if (p.inlineData?.data) {
        buffers.push(Buffer.from(p.inlineData.data, "base64"));
      }
    }
  }
  if (buffers.length === 0) {
    return { ok: false, error: "Vertex returned no audio data" };
  }
  return { ok: true, pcmBase64: Buffer.concat(buffers).toString("base64") };
}
