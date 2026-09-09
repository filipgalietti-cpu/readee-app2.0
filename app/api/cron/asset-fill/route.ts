import { withCronReporting } from "@/lib/observability/cron";
import { NextRequest, NextResponse } from "next/server";
import { runAssetFill } from "@/lib/qc/asset-fill";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Nightly question asset backfill. Tops up rows in questions_db with
 * null audio_url / image_url. Budgeted via content_production_caps
 * (question_audio_fill + question_image_fill).
 *
 * Auth: CRON_SECRET bearer.
 */
async function run() {
  return runAssetFill();
}

async function handlePOST(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json({ ok: true, ...result });
}

async function handleGET(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json({ ok: true, ...result });
}

export const GET = withCronReporting("/api/cron/asset-fill", handleGET);
export const POST = withCronReporting("/api/cron/asset-fill", handlePOST);
