import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateVerifiedSpeech } from "@/lib/audio/verified-speech";
import { spokenNameOf } from "@/lib/audio/name-pronunciation";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** POST { name, saidAs } -> { ok, audioUrl } : Luna says "Hi, <name>!" the way the parent spelled it. Nothing stored. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  let body: { name?: string; saidAs?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 }); }
  const spoken = spokenNameOf(String(body.name ?? ""), String(body.saidAs ?? ""));
  if (!spoken) return NextResponse.json({ ok: false, error: "No name." }, { status: 400 });
  try {
    const audio = await generateVerifiedSpeech(`Hi, ${spoken}! Nice to meet you.`, [spoken]);
    return NextResponse.json({ ok: true, audioUrl: `data:audio/mpeg;base64,${audio.toString("base64")}` });
  } catch {
    return NextResponse.json({ ok: false, error: "Luna’s voice is unavailable. Please try again." }, { status: 503 });
  }
}
