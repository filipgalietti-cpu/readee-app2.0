import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { setStudentCookie } from "@/lib/auth/student-session";

/**
 * Parent-signin happens through Supabase auth. This route is for
 * classroom-owned students who don't have an email or password:
 *
 *   POST /api/student/sign-in
 *   body: { code: "ABCDEF", classroomId: "...", childId: "..." }
 *
 * The request is authenticated by (a) the join code matching the
 * classroom, and (b) the selected child being a classroom-owned member
 * of that exact classroom. If both pass, we mint a signed session
 * cookie (readee_student) and the client redirects to /student.
 */
export async function POST(req: Request) {
  let body: { code?: string; classroomId?: string; childId?: string; pin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = (body.code ?? "").trim().toUpperCase();
  const classroomId = body.classroomId;
  const childId = body.childId;
  const pin = (body.pin ?? "").trim();

  if (!/^[A-Z0-9]{6}$/.test(code) || !classroomId || !childId) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: classroom } = await admin
    .from("classrooms")
    .select("id, join_code, archived_at, student_pin")
    .eq("id", classroomId)
    .maybeSingle();

  if (!classroom) {
    return NextResponse.json({ error: "Class not found." }, { status: 404 });
  }
  const c = classroom as {
    id: string;
    join_code: string;
    archived_at: string | null;
    student_pin: string | null;
  };
  if (c.archived_at) {
    return NextResponse.json({ error: "This class was archived." }, { status: 410 });
  }
  if (c.join_code !== code) {
    return NextResponse.json({ error: "Class code does not match." }, { status: 403 });
  }
  if (c.student_pin) {
    if (!/^[0-9]{4}$/.test(pin) || pin !== c.student_pin) {
      return NextResponse.json(
        { error: "pin_required", message: "Enter the 4-digit class PIN." },
        { status: 403 },
      );
    }
  }

  const { data: child } = await admin
    .from("children")
    .select("id, owner_type, owner_classroom_id")
    .eq("id", childId)
    .maybeSingle();

  if (!child) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }
  const ch = child as { id: string; owner_type: string; owner_classroom_id: string | null };
  if (ch.owner_type !== "classroom" || ch.owner_classroom_id !== classroomId) {
    return NextResponse.json({ error: "Student is not in this class." }, { status: 403 });
  }

  await setStudentCookie({ childId: ch.id, classroomId });
  return NextResponse.json({ ok: true });
}
