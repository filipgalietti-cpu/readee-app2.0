import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSpeechVertex } from "@/lib/ai/vertex-tts";
import { pcmToWav } from "@/lib/audio/child-greeting";
import { spokenNameOf } from "@/lib/audio/name-pronunciation";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** POST { name, saidAs } -> { ok, audioUrl } : Luna says "Hi, <name>!" the way the parent spelled it. Nothing stored. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  let body: { name?: string; saidAs?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 }); }
  const spoken = spokenNameOf(String(body.name ?? ""), String(body.saidAs ?? ""));
  if (!spoken) return NextResponse.json({ ok: false, error: "No name." }, { status: 400 });
  let res = await generateSpeechVertex({ text: `Hi, ${spoken}! Nice to meet you.`, voice: "Autonoe" });
  if (!res.ok) { await new Promise((r) => setTimeout(r, 2500)); res = await generateSpeechVertex({ text: `Hi, ${spoken}! Nice to meet you.`, voice: "Autonoe" }); }
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 500 });
  const wav = pcmToWav(Buffer.from(res.pcmBase64, "base64"), 24000);
  return NextResponse.json({ ok: true, audioUrl: `data:audio/wav;base64,${wav.toString("base64")}` });
}
