import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCohort } from "@/lib/leaderboard/cohort";

export async function GET(req: NextRequest) {
  const childId = req.nextUrl.searchParams.get("child");
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!childId) {
    return NextResponse.json({ error: "Missing child" }, { status: 400 });
  }

  // Verify the child belongs to this parent, then pull carrots + grade.
  const { data: me, error } = await supabase
    .from("children")
    .select("id, first_name, carrots, grade")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!me) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Grade-cohort board vs. seeded rivals (see lib/leaderboard/cohort.ts) —
  // ranks the child by their real carrots so effort = rank.
  const { leaders, myRank } = buildCohort(me.id, me.first_name, me.carrots ?? 0);

  return NextResponse.json({ leaders, myRank, grade: me.grade });
}
