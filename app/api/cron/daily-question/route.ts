import { NextRequest, NextResponse } from "next/server";
import { buildDailyQuestion } from "@/lib/daily/build-daily";

export const dynamic = "force-dynamic";
// Image gen + TTS + 5 LLM calls + QC ≈ 60-90s end-to-end on a slow day.
// 5 minutes leaves headroom for retries and Gemini latency spikes.
export const maxDuration = 300;

/**
 * Daily question cron. Vercel hits this once a day; auth via
 * CRON_SECRET. Idempotent — if today's row already exists, returns
 * early without spending API credits.
 *
 * On QC fail: regenerates once. If still fail, leaves the failed row
 * in place but still returns 200 so cron retries don't keep firing.
 */
async function run(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const dateParam = url.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  let res = await buildDailyQuestion({ date, force });
  if (res.ok && res.qcOverall === "fail" && res.created) {
    // QC said the just-built question is bad. Try once more.
    res = await buildDailyQuestion({ date, force: true });
  }
  return NextResponse.json(res);
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}
