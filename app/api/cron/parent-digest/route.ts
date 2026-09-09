import { withCronReporting } from "@/lib/observability/cron";
import { NextRequest, NextResponse } from "next/server";
import { sendWeeklyDigestBatch } from "@/lib/email/parent-digest";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — enough for a few thousand sends

/**
 * Weekly digest cron. Vercel cron hits this Monday 8am ET
 * (see vercel.json schedule). Auth via CRON_SECRET header.
 */
async function handlePOST(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendWeeklyDigestBatch();
  return NextResponse.json({ ok: true, ...result });
}

// Allow GET too — Vercel Cron uses GET by default.
async function handleGET(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendWeeklyDigestBatch();
  return NextResponse.json({ ok: true, ...result });
}

export const GET = withCronReporting("/api/cron/parent-digest", handleGET);
export const POST = withCronReporting("/api/cron/parent-digest", handlePOST);
