/**
 * Vertex AI Live API — server-side session minter.
 *
 * Mints a short-lived GCP access token from the service account, then
 * builds the WebSocket URL + setup payload the browser needs to talk
 * directly to Vertex's BidiGenerateContent endpoint.
 *
 * Auth resolution (in order):
 *   1. GOOGLE_CREDENTIALS_JSON env var with inline service-account JSON
 *      (Vercel serverless — filesystem is ephemeral). Written to /tmp
 *      and GOOGLE_APPLICATION_CREDENTIALS pointed at it.
 *   2. GOOGLE_APPLICATION_CREDENTIALS pointing at a local JSON file
 *      (local dev).
 *
 * Token lifetime: GoogleAuth client tokens default to 1 hour. We don't
 * refresh inside a single buddy session — sessions are <5 min so this
 * is safe. If we ever want longer sessions, mint via
 * iamcredentials.generateAccessToken with a custom lifetime.
 *
 * Model selection: we use the GA recommended model
 * `gemini-live-2.5-flash-native-audio`. Override via VERTEX_LIVE_MODEL
 * env var if needed.
 */

import { GoogleAuth } from "google-auth-library";
import { writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const VERTEX_REGION = process.env.VERTEX_LIVE_REGION ?? "us-central1";
const VERTEX_LIVE_MODEL =
  process.env.VERTEX_LIVE_MODEL ?? "gemini-live-2.5-flash-native-audio";

let cachedAuth: GoogleAuth | null = null;
let credentialsResolved = false;

function ensureCredentialsOnDisk() {
  if (credentialsResolved) return;
  credentialsResolved = true;
  const inline = process.env.GOOGLE_CREDENTIALS_JSON;
  const existing = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (existing && existsSync(existing)) return;
  if (inline) {
    const dest = join(tmpdir(), "readee-google-sa.json");
    writeFileSync(dest, inline, { encoding: "utf8" });
    process.env.GOOGLE_APPLICATION_CREDENTIALS = dest;
  }
}

function getAuth(): GoogleAuth {
  ensureCredentialsOnDisk();
  if (cachedAuth) return cachedAuth;
  cachedAuth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  return cachedAuth;
}

export type VertexLiveSession =
  | {
      ok: true;
      provider: "vertex";
      accessToken: string;
      wsUrl: string;
      setupModel: string;
      systemInstruction: string;
      expiresAt: string;
    }
  | { ok: false; error: string };

/**
 * Build a Vertex Live session. Returns a self-contained payload the
 * browser can use to connect directly via WebSocket.
 */
export async function mintVertexLiveSession(input: {
  systemInstruction: string;
}): Promise<VertexLiveSession> {
  try {
    const auth = getAuth();
    const client = await auth.getClient();
    const projectId = await auth.getProjectId();
    const tokenInfo = await client.getAccessToken();
    if (!tokenInfo.token) {
      return { ok: false, error: "No GCP access token returned." };
    }
    const wsUrl =
      `wss://${VERTEX_REGION}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent` +
      `?access_token=${encodeURIComponent(tokenInfo.token)}`;
    const setupModel = `projects/${projectId}/locations/${VERTEX_REGION}/publishers/google/models/${VERTEX_LIVE_MODEL}`;
    // Conservative TTL — GoogleAuth tokens are typically 1 hour.
    const expiresAt = new Date(Date.now() + 50 * 60 * 1000).toISOString();
    return {
      ok: true,
      provider: "vertex",
      accessToken: tokenInfo.token,
      wsUrl,
      setupModel,
      systemInstruction: input.systemInstruction,
      expiresAt,
    };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message ?? "Vertex auth failed.",
    };
  }
}
