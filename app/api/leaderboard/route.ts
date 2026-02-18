import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const childId = req.nextUrl.searchParams.get("child");

  const admin = supabaseAdmin();

  // Top 20 by streak_days
  const { data: leaders, error } = await admin
    .from("children")
    .select("id, first_name, streak_days")
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
      const { count } = await admin
        .from("children")
        .select("id", { count: "exact", head: true })
        .gt("streak_days", 0);

      // Get the child's streak to figure rank
      const { data: me } = await admin
        .from("children")
        .select("streak_days")
        .eq("id", childId)
        .single();

      if (me && me.streak_days > 0 && count !== null) {
        const { count: above } = await admin
          .from("children")
          .select("id", { count: "exact", head: true })
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
