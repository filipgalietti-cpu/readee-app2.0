import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/placement/recording — multipart: child (uuid), band (0-5), file
 * (audio/wav, the child's one-minute passage read). Stored in the PRIVATE
 * child-audio bucket at placement/<childId>/passage-<band>.wav; the reveal
 * plays it back to the parent through /api/child-audio's signed URLs.
 * Returns the object path.
 */
const MAX_BYTES = 4 * 1024 * 1024; // 60 s of 16 kHz mono PCM is about 1.9 MB

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  let form: FormData;
  try { form = await req.formData(); } catch { return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 }); }
  const childId = String(form.get("child") ?? "");
  const band = Number(form.get("band") ?? -1);
  const file = form.get("file");
  if (!/^[0-9a-f-]{36}$/.test(childId) || !Number.isInteger(band) || band < 0 || band > 5 || !(file instanceof Blob)) {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "Recording too large." }, { status: 413 });

  const { data: child } = await supabase.from("children").select("id, parent_id").eq("id", childId).maybeSingle();
  if (!child || (child as { parent_id: string }).parent_id !== user.id) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  const path = `placement/${childId}/passage-${band}.wav`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await supabaseAdmin().storage.from("child-audio").upload(path, buf, { contentType: "audio/wav", upsert: true });
  if (error) return NextResponse.json({ ok: false, error: "Could not save the recording." }, { status: 500 });
  return NextResponse.json({ ok: true, path });
}
