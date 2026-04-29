import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/student-session";
import { createClient } from "@/lib/supabase/server";
import { assessWriting } from "@/lib/ai/build-writing-assessment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/student/writing-coach
 *
 * body: { prompt: string, response: string, gradeLevel?: string }
 *
 * Runs the writing rubric over a student-typed response and returns
 * the rubric scores + a kid-readable strength + one growth tip.
 *
 * Auth is OR-gated:
 *   - student-session cookie (class-code login)
 *   - Supabase auth session (parent-side runner)
 *
 * Used both as a "Get coach feedback" before-submit affordance AND
 * as the final-grade scorer at submit time.
 */
export async function POST(req: Request) {
  let userId: string | null = null;

  const studentSession = await getStudentSession();
  if (studentSession) {
    userId = studentSession.childId;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { prompt?: string; response?: string; gradeLevel?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = (body.prompt ?? "").trim();
  const response = (body.response ?? "").trim();
  const gradeLevel = (body.gradeLevel ?? "").trim() || null;

  if (!prompt || !response) {
    return NextResponse.json(
      { error: "Need both prompt and response." },
      { status: 400 },
    );
  }

  const res = await assessWriting({
    userId,
    prompt,
    response,
    gradeLevel,
  });
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, assessment: res.assessment });
}
