import "server-only";

/** Vertex AI TTS — same Google, different quota envelope.
 *
 * The free-tier-equivalent Gemini API caps preview-TTS models at 100
 * reqs/day even with billing on. Vertex AI bypasses that preview cap
 * entirely (project-level Vertex quotas, 1k+ RPM, no daily ceiling).
 * Same Autonoe voice, same audio quality. Pattern lifted from
 * scripts/generate-audio.js (the legacy mass generator that produced
 * the original 1,800+ catalog audios).
 *
 * This file is `server-only` because google-auth-library imports
 * node's child_process / fs / net. If a client component ever pulls
 * it in transitively, the build fails immediately instead of
 * "Module not found: child_process" at runtime.
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

  const styleDirection =
    opts.style?.trim() || "warmly for a young student, clearly and unhurried";
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
