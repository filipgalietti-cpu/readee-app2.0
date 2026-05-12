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
