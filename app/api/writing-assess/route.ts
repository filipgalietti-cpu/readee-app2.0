import { NextResponse } from "next/server";
import { checkParentReadeePlus } from "@/lib/plan/teacher-gate";
import { assessWriting } from "@/lib/ai/build-writing-assessment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Either tier (parent Readee+ or teacher_solo+) gets writing rubric.
  const gate = await checkParentReadeePlus();
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }
  const user = { id: gate.userId };
  let body: { prompt?: string; response?: string; gradeLevel?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON." }, { status: 400 });
  }
  const prompt = (body.prompt ?? "").toString();
  const response = (body.response ?? "").toString();
  if (!prompt.trim()) {
    return NextResponse.json({ ok: false, error: "Prompt required." }, { status: 400 });
  }
  if (!response.trim()) {
    return NextResponse.json({ ok: false, error: "Response required." }, { status: 400 });
  }
  const res = await assessWriting({
    userId: user.id,
    prompt,
    response,
    gradeLevel: body.gradeLevel ?? null,
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, assessment: res.assessment });
}
