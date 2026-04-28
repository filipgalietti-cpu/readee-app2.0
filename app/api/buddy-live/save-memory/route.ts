import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { summarizeAndSave } from "@/lib/ai/buddy-memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Called when a Reading Buddy session ends. Takes the transcript +
 * childId and runs the summarizer. Best-effort: if the kid wasn't
 * matched to a parent, we drop silently — no point billing on
 * orphaned sessions.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });
  }

  let body: {
    childId?: string;
    transcripts?: { role: "child" | "buddy"; text: string }[];
    sessionMinutes?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON." }, { status: 400 });
  }

  const childId = (body.childId ?? "").toString();
  if (!childId) {
    return NextResponse.json({ ok: true, skipped: "no_child_id" });
  }
  const transcripts = Array.isArray(body.transcripts) ? body.transcripts : [];
  if (transcripts.length < 2) {
    return NextResponse.json({ ok: true, skipped: "transcript_too_short" });
  }

  // Verify the kid belongs to this user (parent_id match) — protects
  // against someone scribbling memories on another parent's kid.
  const { data: child } = await supabase
    .from("children")
    .select("parent_id")
    .eq("id", childId)
    .maybeSingle();
  if (!child || (child as any).parent_id !== user.id) {
    return NextResponse.json({ ok: false, error: "Not your child." }, { status: 403 });
  }

  const res = await summarizeAndSave({
    childId,
    transcripts,
    sessionMinutes: body.sessionMinutes,
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, memory: res.memory });
}
