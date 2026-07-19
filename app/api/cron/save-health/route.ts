import { NextRequest, NextResponse } from "next/server";
import { checkSaveHealth } from "@/lib/monitoring/save-health";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily save-health check. Vercel hits this once a day; auth via CRON_SECRET.
 * Detects the "kids active but nothing saving" outage signature and emails the
 * owner (see lib/monitoring/save-health.ts). Returns 500 when unhealthy so the
 * failure also shows up in Vercel's cron run history.
 */
async function run(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await checkSaveHealth();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}
