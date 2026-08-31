import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notify } from "@/lib/notifications/notify";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily kid-facing nudges → the header bell. Runs each morning (after the
 * daily-question cron has built today's Readee). Seeds, per family:
 *   - "Today's Readee is ready"  → /daily
 *   - "Your next lesson is waiting" → the journey
 *   - a streak keep-going nudge (only if they have a streak going)
 * All deduped per day so a re-run never stacks duplicates. Auth via
 * CRON_SECRET, same as the other crons.
 */
async function run(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

  const { data: kids, error } = await supabaseAdmin()
    .from("children")
    .select("parent_id, streak_days")
    .eq("owner_type", "parent")
    .not("parent_id", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let families = 0;
  for (const kid of kids ?? []) {
    const uid = kid.parent_id as string;

    await notify({
      userId: uid,
      type: "daily",
      title: "Today's Readee is ready!",
      message: "A brand-new story is waiting. It only takes a few minutes.",
      dedupeKey: `daily-readee-${today}`,
    });

    await notify({
      userId: uid,
      type: "lesson",
      title: "Your next lesson is waiting",
      message: "Pick up right where you left off on your journey.",
      dedupeKey: `next-lesson-${today}`,
    });

    if ((kid.streak_days ?? 0) >= 2) {
      await notify({
        userId: uid,
        type: "streak",
        title: `You're on a ${kid.streak_days}-day streak!`,
        message: "Do one lesson today to keep it going.",
        dedupeKey: `streak-${today}`,
      });
    }

    families += 1;
  }

  return NextResponse.json({ ok: true, families });
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}
