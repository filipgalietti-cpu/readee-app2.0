import { NextResponse } from "next/server";
import { checkParentReadeePlus } from "@/lib/plan/teacher-gate";
import { mintVertexLiveSession } from "@/lib/ai/vertex-live";
import { buildBuddyContext, type BuddyMode } from "@/lib/ai/buddy-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mint a real-time Live session for the Reading Buddy.
 *
 * Personalizes the system prompt with the kid's name, grade, and
 * recent practice / fluency activity (when childId is passed).
 * Mode steers behavior: freeform / read_with_me / word_meaning /
 * story_time / quick_quiz.
 *
 * Provider: Vertex AI (gemini-live-2.5-flash-native-audio, GA).
 * AI Studio Live isn't allowlisted on this project; route abstracts
 * the provider so callers don't care.
 */

const VALID_MODES: BuddyMode[] = [
  "freeform",
  "read_with_me",
  "word_meaning",
  "story_time",
  "quick_quiz",
];

export async function POST(req: Request) {
  const gate = await checkParentReadeePlus();
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }

  let body: {
    passage?: string;
    gradeLevel?: string;
    childId?: string;
    mode?: string;
  };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const mode: BuddyMode = (VALID_MODES.includes(body.mode as BuddyMode)
    ? body.mode
    : "freeform") as BuddyMode;

  const ctx = await buildBuddyContext({
    childId: body.childId ?? null,
    passage: body.passage ?? null,
    gradeLevel: body.gradeLevel ?? null,
    mode,
  });

  const session = await mintVertexLiveSession({
    systemInstruction: ctx.systemInstruction,
  });
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
    childFirstName: ctx.childFirstName,
    mode,
  });
}
