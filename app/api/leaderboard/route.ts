import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildCohort, type RealPeer } from "@/lib/leaderboard/cohort";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";
import type { Child } from "@/lib/db/types";

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

  // Verify the child belongs to this parent, then pull carrots + grade + avatar.
  const { data: me, error } = await supabase
    .from("children")
    .select("id, first_name, carrots, streak_days, grade, equipped_items")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!me) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // One overall leaderboard across every grade, shown by FIRST NAME + PFP only
  // (no last name, no ids leaked — see cohort.ts). Uses the service-role client
  // to read across families; nothing identifying beyond first name + avatar +
  // carrots leaves the server. Falls back to seeded rivals to fill pre-scale.
  const { data: peerRows } = await supabaseAdmin()
    .from("children")
    .select("id, first_name, carrots, streak_days, equipped_items")
    .neq("id", me.id)
    .eq("owner_type", "parent") // B2C board = parent-owned kids only, never classroom/demo students
    .eq("exclude_from_leaderboard", false) // hide dev/test/non-genuine accounts
    .gt("carrots", 0)
    .order("carrots", { ascending: false })
    .limit(8);
  const realPeers: RealPeer[] = (peerRows ?? [])
    .filter((p: any) => (p.first_name ?? "").trim().length > 0)
    .map((p: any, i: number) => ({
      name: String(p.first_name).trim(),
      carrots: p.carrots ?? 0,
      streak: p.streak_days ?? 0,
      avatar: getChildAvatarImage(p as Child, i),
    }));

  const myAvatar = getChildAvatarImage(me as Child, 0);
  const { leaders, myRank } = buildCohort(
    me.id,
    me.first_name,
    me.carrots ?? 0,
    myAvatar,
    realPeers,
    me.streak_days ?? 0,
  );

  return NextResponse.json({
    leaders,
    myRank,
    grade: me.grade,
    myStreak: me.streak_days ?? 0,
    total: leaders.length,
  });
}
