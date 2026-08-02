import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeFluencyReading } from "@/lib/ai/build-fluency";
import { hasAnyPaidTier } from "@/lib/plan/teacher-gate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/luna/grade — grade ONE sentence the kid just read, in-memory
 * (no Storage upload, no fluency_readings row). Powers Luna's guided,
 * sentence-by-sentence reading loop. Same auth/plan gate as the full
 * fluency analyzer; just persist:false.
 *
 * Body: FormData { audio, childId, sentenceText, gradeLevel }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const childId = String(form.get("childId") ?? "");
  const sentenceText = String(form.get("sentenceText") ?? "");
  const gradeLevel = (form.get("gradeLevel") as string | null) ?? null;
  const audio = form.get("audio");

  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 });
  if (!sentenceText.trim()) return NextResponse.json({ error: "sentenceText required" }, { status: 400 });
  if (!(audio instanceof File)) return NextResponse.json({ error: "audio file required" }, { status: 400 });

  // Auth — caller must be the child's parent (Luna is a B2C surface).
  const { data: child } = await supabase
    .from("children")
    .select("id, parent_id")
    .eq("id", childId)
    .maybeSingle();
  if (!child) return NextResponse.json({ error: "child not found" }, { status: 404 });
  if ((child as any).parent_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  if (!hasAnyPaidTier(((callerProfile as any)?.plan ?? "free") as string)) {
    return NextResponse.json({ error: "Luna requires a paid plan.", reason: "plan" }, { status: 402 });
  }

  const buf = Buffer.from(await audio.arrayBuffer());
  const res = await analyzeFluencyReading({
    childId,
    callerId: user.id,
    audioBase64: buf.toString("base64"),
    audioMimeType: audio.type || "audio/webm",
    passageText: sentenceText,
    passageGradeLevel: gradeLevel,
    persist: false,
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ ok: true, analysis: res.analysis });
}
