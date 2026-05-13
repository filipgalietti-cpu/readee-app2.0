import { NextRequest, NextResponse } from "next/server";
import { runAdaptiveReview } from "@/lib/content/caps";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Nightly adaptive review of production caps. Walks every content
 * type in `content_production_caps`, reads the last 7d + 14d QC
 * metrics from qc_runs, and either auto-applies a target adjustment
 * (when `auto_apply = true`) or stages a suggestion the operator
 * approves from /owner/qc-health.
 *
 * Auth: CRON_SECRET bearer, matching the other crons.
 */
async function run() {
  return runAdaptiveReview();
}

export async function POST(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json({ ok: true, ...result });
}
