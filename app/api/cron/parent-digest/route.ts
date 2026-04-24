import { NextRequest, NextResponse } from "next/server";
import { sendWeeklyDigestBatch } from "@/lib/email/parent-digest";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — enough for a few thousand sends

/**
 * Weekly digest cron. Vercel cron hits this Monday 8am ET
 * (see vercel.json schedule). Auth via CRON_SECRET header.
 */
export async function POST(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendWeeklyDigestBatch();
  return NextResponse.json({ ok: true, ...result });
}

// Allow GET too — Vercel Cron uses GET by default.
export async function GET(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendWeeklyDigestBatch();
  return NextResponse.json({ ok: true, ...result });
}
