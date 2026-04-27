import { NextResponse } from "next/server";
import { checkTeacherTier } from "@/lib/plan/teacher-gate";
import { normalizeRoster } from "@/lib/ai/normalize-roster";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await checkTeacherTier({ min: "school" });
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }
  const profile = { id: gate.profileId };
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON." }, { status: 400 });
  }
  const text = (body.text ?? "").toString();
  if (!text.trim()) {
    return NextResponse.json({ ok: false, error: "Roster text required." }, { status: 400 });
  }
  const res = await normalizeRoster({ adminId: profile.id, rawText: text });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, result: res.result });
}
