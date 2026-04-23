import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listCourseStudents } from "@/lib/classroom/google";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

  try {
    const students = await listCourseStudents(user.id, courseId);
    return NextResponse.json({ students });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch roster." }, { status: 500 });
  }
}
