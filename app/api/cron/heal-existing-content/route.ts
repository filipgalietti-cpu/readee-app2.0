import { withCronReporting } from "@/lib/observability/cron";
import { NextRequest, NextResponse } from "next/server";
import { runHealExisting } from "@/lib/qc/heal-existing";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Nightly: walk every content_type for pieces that are currently
 * 'hidden' (i.e., were demoted because they failed QC) and try to
 * heal them. Anything that comes back clean gets promoted back to
 * 'live' inside the heal logic itself. Budgeted via
 * content_production_caps so spend stays bounded.
 *
 * Auth: CRON_SECRET bearer, matching the other crons.
 */
async function run() {
  return runHealExisting();
}

async function handlePOST(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const results = await run();
  return NextResponse.json({ ok: true, results });
}

async function handleGET(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const results = await run();
  return NextResponse.json({ ok: true, results });
}

export const GET = withCronReporting("/api/cron/heal-existing-content", handleGET);
export const POST = withCronReporting("/api/cron/heal-existing-content", handlePOST);
