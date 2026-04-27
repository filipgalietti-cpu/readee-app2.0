import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runBuddyTurn } from "@/lib/ai/build-buddy-turn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });
  }
  const form = await req.formData();
  const audio = form.get("audio");
  const passage = String(form.get("passage") ?? "");
  const gradeLevel = String(form.get("gradeLevel") ?? "");
  const historyRaw = String(form.get("history") ?? "[]");
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ ok: false, error: "No audio." }, { status: 400 });
  }
  if (audio.size > 4 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: "Audio too long. Keep turns short." },
      { status: 400 },
    );
  }
  let history: { role: "child" | "buddy"; text: string }[] = [];
  try {
    history = JSON.parse(historyRaw);
  } catch {}
  const buf = Buffer.from(await audio.arrayBuffer());
  const res = await runBuddyTurn({
    callerId: user.id,
    childAudioBase64: buf.toString("base64"),
    childAudioMimeType: audio.type || "audio/webm",
    passageText: passage,
    gradeLevel: gradeLevel || null,
    history,
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, turn: res.turn });
}
