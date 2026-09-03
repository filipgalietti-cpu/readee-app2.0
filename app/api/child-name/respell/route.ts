import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { respellNameFromAudio } from "@/lib/audio/name-pronunciation";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** POST { audioBase64, mimeType, name } -> { ok, saidAs, heard }. A parent says the name; Gemini writes how it sounds. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  let body: { audioBase64?: string; mimeType?: string; name?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 }); }
  const audioBase64 = String(body.audioBase64 ?? "");
  const mimeType = String(body.mimeType ?? "audio/wav");
  if (!audioBase64 || audioBase64.length > 2_000_000) return NextResponse.json({ ok: false, error: "Recording missing or too long." }, { status: 400 });
  if (!/^audio\/(wav|x-wav|mpeg|mp3|ogg|webm|mp4|aac|flac)$/.test(mimeType)) return NextResponse.json({ ok: false, error: "Unsupported audio." }, { status: 400 });
  try {
    const out = await respellNameFromAudio({ audioBase64, mimeType, writtenName: String(body.name ?? "") });
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Could not listen." }, { status: 500 });
  }
}
