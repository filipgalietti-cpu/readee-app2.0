import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeFluencyReading } from "@/lib/ai/build-fluency";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // long-ish — Gemini audio analysis can take ~30s

/**
 * POST /api/fluency/analyze
 *
 * Body: FormData with:
 *   audio       — File (audio/webm or audio/mp4)
 *   childId     — uuid
 *   passageText — string
 *   gradeLevel  — string|null
 *
 * Auth: parent of the child OR teacher of a classroom the child is in.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const childId = String(form.get("childId") ?? "");
  const passageText = String(form.get("passageText") ?? "");
  const gradeLevel = (form.get("gradeLevel") as string | null) ?? null;
  const assignmentId = (form.get("assignmentId") as string | null) ?? null;
  const audio = form.get("audio");

  if (!childId) {
    return NextResponse.json({ error: "childId required" }, { status: 400 });
  }
  if (!passageText.trim()) {
    return NextResponse.json({ error: "passageText required" }, { status: 400 });
  }
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "audio file required" }, { status: 400 });
  }

  // Auth — caller must be parent of child OR teacher of a classroom the kid is in.
  const { data: child } = await supabase
    .from("children")
    .select("id, parent_id")
    .eq("id", childId)
    .maybeSingle();
  if (!child) {
    return NextResponse.json({ error: "child not found" }, { status: 404 });
  }
  const isParent = (child as any).parent_id === user.id;
  let isTeacher = false;
  if (!isParent) {
    const { data: memberships } = await supabase
      .from("classroom_memberships")
      .select("classrooms!inner(teacher_id)")
      .eq("child_id", childId);
    isTeacher = ((memberships ?? []) as any[]).some(
      (m) => m.classrooms?.teacher_id === user.id,
    );
  }
  if (!isParent && !isTeacher) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const buf = Buffer.from(await audio.arrayBuffer());
  const audioBase64 = buf.toString("base64");
  const audioMimeType = audio.type || "audio/webm";

  const res = await analyzeFluencyReading({
    childId,
    callerId: user.id,
    audioBase64,
    audioMimeType,
    passageText,
    passageGradeLevel: gradeLevel,
    assignmentId,
  });

  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    readingId: res.readingId,
    audioUrl: res.audioUrl,
    analysis: res.analysis,
  });
}
