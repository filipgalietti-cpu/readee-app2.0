import { NextResponse } from "next/server";
import { checkParentReadeePlus } from "@/lib/plan/teacher-gate";
import { mintVertexLiveSession } from "@/lib/ai/vertex-live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mint a real-time Live session for the Reading Buddy.
 *
 * Today we use Vertex AI (gemini-live-2.5-flash-native-audio, GA).
 * AI Studio's Live API isn't allowlisted on this project. The route
 * abstracts the provider — if AI Studio Live is enabled later we can
 * mint there instead, and the client only needs to look at provider
 * to decide which path to take.
 *
 * Returned payload is self-contained so the browser can open the
 * WebSocket directly and send the setup message — no further server
 * round-trip required.
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

  const session = await mintVertexLiveSession({ systemInstruction });
  if (!session.ok) {
    return NextResponse.json(
      { ok: false, error: session.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    provider: session.provider,
    wsUrl: session.wsUrl,
    setupModel: session.setupModel,
    systemInstruction: session.systemInstruction,
    expiresAt: session.expiresAt,
  });
}
