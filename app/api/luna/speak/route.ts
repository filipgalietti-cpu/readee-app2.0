import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSpeech } from "@/lib/ai/readee-ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/luna/speak — turn a short coaching line into Luna's spoken
 * voice (Autonoe). Used by the read-with-Luna flow to speak the grounded
 * encouragement aloud after a reading is graded.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  let text = "";
  try {
    const body = await req.json();
    text = String(body?.text ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ ok: false, error: "No text to speak." }, { status: 400 });
  }

  const res = await generateSpeech({
    teacherId: user.id,
    text: text.slice(0, 700),
    voice: "Autonoe",
    style: "warmly and encouragingly, like a kind reading teacher",
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, audioUrl: res.audioUrl });
}
