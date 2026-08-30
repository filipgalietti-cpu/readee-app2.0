import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gradeLine } from "@/lib/ai/luna-grade";
import { assessPronunciation, azureConfigured } from "@/lib/ai/azure-pronounce";
import { checkLunaReadAllowance } from "@/lib/plan/luna-guard";

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

  // Free allowance (server-enforced so it can't be bypassed): full-access
  // readers grade unlimited sentences; a genuinely-free reader passes while
  // under the 3-completed-reads taste (same counter as the read page).
  const gate = await checkLunaReadAllowance(user.id, childId);
  if (!gate.ok) {
    return NextResponse.json({ error: "limit", reason: gate.reason }, { status: 402 });
  }

  const buf = Buffer.from(await audio.arrayBuffer());

  // Measurement engine: prefer Azure Pronunciation Assessment (purpose-built,
  // deterministic per-word scoring) when configured; the client sends 16 kHz
  // mono PCM WAV for it. Fall back to the Gemini grader on any Azure miss so a
  // session never breaks (e.g. >60s reads, transient errors, or no key set).
  if (azureConfigured() && (audio.type || "").includes("wav")) {
    const az = await assessPronunciation({ wavBytes: buf, referenceText: sentenceText });
    if (az.ok) return NextResponse.json({ ok: true, analysis: az.grade, engine: "azure", debugWords: az.debug });
    console.warn("[luna/grade] Azure failed, falling back to Gemini:", az.error);
  }

  const res = await gradeLine({
    callerId: user.id,
    audioBase64: buf.toString("base64"),
    audioMimeType: audio.type || "audio/webm",
    sentenceText,
    gradeLevel,
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ ok: true, analysis: res.grade, engine: "gemini" });
}
