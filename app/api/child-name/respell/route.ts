import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { respellNameFromAudio } from "@/lib/audio/name-pronunciation";
import { cleanSaidAs } from "@/lib/audio/name-spoken";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { reportFailure } from "@/lib/observability/critical";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Optional childId saves the pronunciation during the assessment, before replying. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  let body: { audioBase64?: string; mimeType?: string; name?: string; childId?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 }); }
  const audioBase64 = String(body.audioBase64 ?? "");
  const mimeType = String(body.mimeType ?? "audio/wav");
  if (!audioBase64 || audioBase64.length > 2_000_000) return NextResponse.json({ ok: false, error: "Recording missing or too long." }, { status: 400 });
  if (!/^audio\/(wav|x-wav|mpeg|mp3|ogg|webm|mp4|aac|flac)$/.test(mimeType)) return NextResponse.json({ ok: false, error: "Unsupported audio." }, { status: 400 });
  const childId = body.childId;
  if (childId !== undefined && (typeof childId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(childId))) return NextResponse.json({ ok: false, error: "Bad child." }, { status: 400 });
  try {
    if (childId) {
      const { data: child, error } = await supabaseAdmin().from("children").select("id").eq("id", childId).eq("parent_id", user.id).maybeSingle();
      if (error) throw new Error("Name ownership lookup failed.");
      if (!child) return NextResponse.json({ ok: false, error: "Not your reader." }, { status: 403 });
    }
    const out = await respellNameFromAudio({ audioBase64, mimeType, writtenName: String(body.name ?? "") });
    const saidAs = cleanSaidAs(out.saidAs);
    if (childId && saidAs) {
      const { data, error } = await supabaseAdmin().from("children").update({ name_said_as: saidAs }).eq("id", childId).eq("parent_id", user.id).select("id").maybeSingle();
      if (error || !data) throw new Error("Name pronunciation save failed.");
    }
    return NextResponse.json({ ok: true, ...out, saidAs });
  } catch (e) {
    reportFailure("placement.name_pronunciation", e, { route: "/api/child-name/respell" });
    return NextResponse.json({ ok: false, error: "Could not save the pronunciation." }, { status: 503 });
  }
}
