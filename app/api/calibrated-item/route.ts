import { NextResponse } from "next/server";
import { checkTeacherTier } from "@/lib/plan/teacher-gate";
import { generateCalibratedItem } from "@/lib/ai/build-calibrated-items";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await checkTeacherTier({ min: "teacher_solo" });
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }
  const profile = { id: gate.profileId };
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON." }, { status: 400 });
  }
  const standardId = String(body.standardId ?? "").trim();
  const standardDescription = String(body.standardDescription ?? "").trim();
  const gradeLevel = String(body.gradeLevel ?? "").trim();
  const targetDifficulty = Number(body.targetDifficulty ?? 3);
  if (!standardId || !standardDescription || !gradeLevel) {
    return NextResponse.json({ ok: false, error: "All fields required." }, { status: 400 });
  }
  const td = Math.max(1, Math.min(5, Math.round(targetDifficulty))) as 1 | 2 | 3 | 4 | 5;
  const res = await generateCalibratedItem({
    teacherId: profile.id,
    standardId,
    standardDescription,
    gradeLevel,
    targetDifficulty: td,
    passageContext: body.passageContext ?? null,
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, item: res.item });
}
