import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listCourses } from "@/lib/classroom/google";
import { trackError } from "@/lib/observability/track";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  try {
    const courses = await listCourses(user.id);
    return NextResponse.json({ courses });
  } catch (e: any) {
    if (String(e?.message).includes("Not connected")) {
      return NextResponse.json({ error: "not_connected" }, { status: 409 });
    }
    console.error(e);
    trackError(e, {
      route: "api.classroom.google.courses",
      userId: user.id,
    });
    return NextResponse.json({ error: "Failed to list courses." }, { status: 500 });
  }
}
