import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/owner/phoneme-take — save a human-recorded phoneme take (WAV) to
 * the staging path audio/phoneme-takes/{id}.wav. The finalize script
 * (scripts/finalize-phoneme-takes.ts) trims/normalizes/converts these to the
 * live audio/phonemes/{id}.mp3 clips. Owner-only.
 */
export async function POST(req: Request) {
  const profile = await requireProfile();
  if (!(await isPlatformAdmin(profile.id))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  const id = String(form.get("id") ?? "");
  const audio = form.get("audio");
  if (!/^[a-z_]{1,24}$/.test(id) || !(audio instanceof Blob)) {
    return NextResponse.json({ ok: false, error: "bad id or audio" }, { status: 400 });
  }
  if (audio.size > 4 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "take too large" }, { status: 400 });
  }

  const bytes = Buffer.from(await audio.arrayBuffer());
  const up = await supabaseAdmin()
    .storage.from("audio")
    .upload(`phoneme-takes/${id}.wav`, bytes, { contentType: "audio/wav", upsert: true });
  if (up.error) {
    return NextResponse.json({ ok: false, error: up.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
