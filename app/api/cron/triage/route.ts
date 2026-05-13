import { NextRequest, NextResponse } from "next/server";
import { runTriage } from "@/lib/qc/triage";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Nightly stale-content triage. Auto-resolves audit findings whose
 * target rows have since been healed, and archives hidden rows that
 * have sat untouched for >14 days. Runs at 03:00 UTC, before
 * heal-existing-content (04:00) and asset-fill (04:30) so the day's
 * heal pass works on a cleaner queue.
 *
 * Auth: CRON_SECRET bearer, matching the other crons.
 */
async function run() {
  return runTriage();
}

export async function POST(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const results = await run();
  return NextResponse.json({ ok: true, results });
}

export async function GET(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const results = await run();
  return NextResponse.json({ ok: true, results });
}
