import { NextRequest, NextResponse } from "next/server";
import { notifyNewSignups } from "@/lib/email/signup-alert";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * New-signup cron. Vercel hits this every 5 minutes; any account created since
 * the last run gets announced to the team inbox, once. Idempotency is enforced
 * inside the lib via `signup_alerts`.
 *
 * Auth: CRON_SECRET bearer, matching the lifecycle-emails convention.
 */
async function run() {
  return notifyNewSignups();
}

function authed(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await run();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await run();
  return NextResponse.json({ ok: true, ...result });
}
