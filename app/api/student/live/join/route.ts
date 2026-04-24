import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/auth/student-session";

/**
 * POST /api/student/live/join
 * body: { code }
 *
 * Joins the current student cookie into a live quiz session by its
 * 6-char code. The session's classroom must match the student's
 * classroom — no cross-class joining.
 */
export async function POST(req: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = (body.code ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-character code your teacher shared." }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: lookup } = await admin
    .rpc("find_live_session_by_code", { p_code: code })
    .maybeSingle();
  if (!lookup) {
    return NextResponse.json({ error: "No live quiz matches that code." }, { status: 404 });
  }
  const liveSession = lookup as any;

  if (liveSession.classroom_id !== session.classroomId) {
    return NextResponse.json({ error: "This quiz is for a different class." }, { status: 403 });
  }
  if (liveSession.status === "ended") {
    return NextResponse.json({ error: "That quiz has already ended." }, { status: 410 });
  }

  // Upsert the participant row. UNIQUE(session_id, child_id) means
  // re-joining is a no-op.
  await admin
    .from("live_quiz_participants")
    .upsert(
      {
        session_id: liveSession.id,
        child_id: session.childId,
        left_at: null,
      },
      { onConflict: "session_id,child_id" },
    );

  return NextResponse.json({ ok: true, sessionId: liveSession.id });
}
