import { NextRequest, NextResponse } from "next/server";
import { runCommunityReviewQueue } from "@/lib/community/review-agent";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Community review cron. Runs frequently and reviews pending kid Story Studio
 * submissions one at a time: compliant stories get read-aloud audio and go
 * live; unsafe / low-effort ones are rejected; anything the AI can't judge
 * stays pending for a human. See lib/community/review-agent.ts.
 */
async function handle(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runCommunityReviewQueue(8);
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
