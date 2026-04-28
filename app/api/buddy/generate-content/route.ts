import { NextResponse } from "next/server";
import { checkParentReadeePlus } from "@/lib/plan/teacher-gate";
import { generateBuddyContent, type GenerateInput } from "@/lib/ai/buddy-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_MODES: GenerateInput["mode"][] = [
  "read_with_me",
  "quick_quiz",
  "story_time",
  "word_meaning",
];

export async function POST(req: Request) {
  const gate = await checkParentReadeePlus();
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }
  let body: { mode?: string; childId?: string; theme?: string; remix?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON." }, { status: 400 });
  }
  const mode = (body.mode ?? "") as GenerateInput["mode"];
  if (!VALID_MODES.includes(mode)) {
    return NextResponse.json({ ok: false, error: "Bad mode." }, { status: 400 });
  }

  const res = await generateBuddyContent({
    mode,
    childId: body.childId ?? null,
    theme: body.theme ?? null,
    remix: body.remix ?? null,
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, content: res.content });
}
