/**
 * Owner daily digest cron. Fires at 12:00 UTC every day — after the
 * discovery cron (10:00) but before US East Coast wakeup. Emails
 * Filip a summary of the last 24h of autonomous content production
 * + QC verdicts so he doesn't have to remember to check /owner.
 *
 * Recipient is env-driven (OWNER_DIGEST_TO) so it rotates without
 * code changes.
 *
 * Manual trigger: GET with CRON_SECRET. Useful for testing the
 * email template against today's data.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendOwnerDigest } from "@/lib/email/owner-digest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function run(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const r = await sendOwnerDigest();
  return NextResponse.json(r);
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
