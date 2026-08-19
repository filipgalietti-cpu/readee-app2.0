import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePassage } from "@/lib/ai/readee-ai";
import { hasAnyPaidTier } from "@/lib/plan/teacher-gate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/luna/passage — generate a short reading passage loaded with a
 * child's weak phonics pattern, so Luna can give targeted 1:1 practice on
 * exactly what they struggle with. Reuses readee-ai's passage generator
 * (phonicsPattern is a first-class input there).
 *
 * Body (JSON): { childId, pattern?, gradeLevel?, topic? }
 *
 * `topic` is the kid/parent's prompt ("a story about dinosaurs playing
 * soccer"). The generator keeps it decodable to gradeLevel + phonicsPattern,
 * so the prompt drives the STORY while Luna controls the READING LEVEL.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }
  const childId = String(b?.childId ?? "");
  const pattern = b?.pattern ? String(b.pattern).slice(0, 80) : null;
  const gradeLevel = b?.gradeLevel ? String(b.gradeLevel) : null;
  // The kid/parent prompt. Falls back to a generic fun story ("surprise me").
  const rawTopic = b?.topic ? String(b.topic).trim().slice(0, 200) : "";
  const topic = rawTopic || "a short, fun story a young reader will enjoy reading out loud";
  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 });

  // Auth: parent of the child + paid gate (Luna is premium B2C).
  const { data: child } = await supabase
    .from("children")
    .select("id, parent_id")
    .eq("id", childId)
    .maybeSingle();
  if (!child) return NextResponse.json({ error: "child not found" }, { status: 404 });
  if ((child as any).parent_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { data: prof } = await supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle();
  if (!hasAnyPaidTier(((prof as any)?.plan ?? "free") as string)) {
    return NextResponse.json({ error: "Luna requires a paid plan.", reason: "plan" }, { status: 402 });
  }

  const res = await generatePassage({
    teacherId: user.id,
    topic,
    gradeLevel,
    phonicsPattern: pattern,
    lengthLevel: "short",
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });

  return NextResponse.json({
    ok: true,
    passage: { grade: gradeLevel ?? "1st", title: res.passage.title, text: res.passage.passage },
  });
}
