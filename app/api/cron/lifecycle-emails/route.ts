import { withCronReporting } from "@/lib/observability/cron";
import { NextRequest, NextResponse } from "next/server";
import { sendLifecycleBatch } from "@/lib/email/lifecycle";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Daily lifecycle cron. Vercel hits this once a day; each parent is
 * evaluated for which stage (if any) applies right now, and at most
 * one stage emails them per call. Idempotency is enforced inside the
 * lib via `lifecycle_email_sends`.
 *
 * Auth: CRON_SECRET bearer, matching the parent-digest convention.
 */
async function run() {
  return sendLifecycleBatch();
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

export const GET = withCronReporting("/api/cron/lifecycle-emails", handleGET);
export const POST = withCronReporting("/api/cron/lifecycle-emails", handlePOST);
