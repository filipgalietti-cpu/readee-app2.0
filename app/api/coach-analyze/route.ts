import { NextResponse } from "next/server";
import { checkTeacherTier } from "@/lib/plan/teacher-gate";
import { analyzeReadingGroup } from "@/lib/ai/build-classroom-observer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await checkTeacherTier({ min: "teacher_solo" });
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }
  const profile = { id: gate.profileId };
  const form = await req.formData();
  const audio = form.get("audio");
  const passage = String(form.get("passage") ?? "");
  const gradeLevel = String(form.get("gradeLevel") ?? "");
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ ok: false, error: "No audio." }, { status: 400 });
  }
  if (audio.size > 20 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: "Audio too large (>20 MB). Try a shorter clip." },
      { status: 400 },
    );
  }
  const buf = Buffer.from(await audio.arrayBuffer());
  const res = await analyzeReadingGroup({
    teacherId: profile.id,
    audioBase64: buf.toString("base64"),
    audioMimeType: audio.type || "audio/webm",
    passageText: passage,
    gradeLevel: gradeLevel || null,
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, observation: res.observation });
}
