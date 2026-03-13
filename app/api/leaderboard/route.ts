import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // Privacy-safe leaderboard: only rank the current parent's children.
  const { data: leaders, error } = await supabase
    .from("children")
    .select("id, first_name, streak_days")
    .eq("parent_id", user.id)
    .gt("streak_days", 0)
    .order("streak_days", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Find current child's rank
  let myRank: number | null = null;
  if (childId && leaders) {
    const idx = leaders.findIndex((l) => l.id === childId);
    if (idx !== -1) {
      myRank = idx + 1;
    } else {
      // Child not in top 20 — get their actual rank
      const { count } = await supabase
        .from("children")
        .select("id", { count: "exact", head: true })
        .eq("parent_id", user.id)
        .gt("streak_days", 0);

      // Get the child's streak to figure rank
      const { data: me } = await supabase
        .from("children")
        .select("streak_days")
        .eq("id", childId)
        .eq("parent_id", user.id)
        .single();

      if (me && me.streak_days > 0 && count !== null) {
        const { count: above } = await supabase
          .from("children")
          .select("id", { count: "exact", head: true })
          .eq("parent_id", user.id)
          .gt("streak_days", me.streak_days);

        myRank = (above ?? 0) + 1;
      }
    }
  }

  return NextResponse.json({
    leaders: (leaders || []).map((l) => ({
      id: l.id,
      first_name: l.first_name,
      streak_days: l.streak_days,
    })),
    myRank,
  });
}
