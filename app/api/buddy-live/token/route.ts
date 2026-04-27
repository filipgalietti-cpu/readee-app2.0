import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { checkParentReadeePlus } from "@/lib/plan/teacher-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mint a short-lived auth token for the browser to open a direct
 * WebSocket connection to Gemini Live. We never ship GEMINI_API_KEY
 * to the browser.
 *
 * Token policy:
 *  - 60 seconds to OPEN the session (`expireTime`)
 *  - 15 minutes max session lifetime once opened (`newSessionExpireTime`)
 *  - Pinned to ONE Live session (`uses: 1`)
 *  - Pinned to a specific model + config (Live constraints)
 *
 * If a kid leaves the page open and the session times out, the client
 * just requests another token — auth tokens are cheap.
 */

const BUDDY_SYSTEM_PROMPT = `You are Readee, a warm, patient real-time reading buddy for a K-4 child.
- Keep replies SHORT (1-3 sentences).
- Match grade-level vocabulary. K-1 use very simple words.
- If the child asks what a word means, give a kid-friendly definition + one quick example.
- If they're sounding out a word, gently say it slowly and break it into chunks.
- If they ask about the passage, answer warmly and briefly.
- If they go off-topic, gently redirect: "That sounds fun! Let's keep reading first."
- NEVER pretend to be human. If asked, say you're Readee, the reading helper.
- Stay safe. No personal info. Refuse anything inappropriate.
Tone: warm, encouraging, bunny-mascot energy. Speak like a friend.`;

export async function POST(req: Request) {
  const gate = await checkParentReadeePlus();
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "GEMINI_API_KEY not configured." },
      { status: 500 },
    );
  }

  // The auth-tokens API lives on the v1alpha surface; the Live API does too.
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: "v1alpha" },
  });

  let body: { passage?: string; gradeLevel?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const passage = (body.passage ?? "").toString().slice(0, 4000);
  const gradeLevel = (body.gradeLevel ?? "").toString().slice(0, 20);

  const systemInstruction = [
    BUDDY_SYSTEM_PROMPT,
    "",
    `Grade level: ${gradeLevel || "K-4"}.`,
    passage
      ? `Passage the child is reading:\n"""\n${passage}\n"""`
      : "No passage on screen yet — the child is just chatting about reading.",
  ].join("\n");

  try {
    const expireTime = new Date(Date.now() + 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const token = await (ai as any).authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        httpOptions: { apiVersion: "v1alpha" },
        liveConnectConstraints: {
          model: "gemini-2.5-flash-native-audio-preview-09-2025",
          config: {
            responseModalities: ["AUDIO"],
            systemInstruction: { parts: [{ text: systemInstruction }] },
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      token: (token as any).name,
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      expiresAt: expireTime,
      sessionExpiresAt: newSessionExpireTime,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Could not mint token." },
      { status: 500 },
    );
  }
}
