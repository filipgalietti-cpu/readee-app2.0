import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  MONTHLY_CREDIT_LIMIT,
  HOURLY_CREDIT_LIMIT,
  CREDIT_COST,
  estimatedDollarCost,
} from "@/lib/ai/credits";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = supabaseAdmin();
  const now = Date.now();
  const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: rows } = await admin
    .from("ai_usage_log")
    .select("credits_used, created_at")
    .eq("teacher_id", profile.id)
    .eq("success", true)
    .gte("created_at", thirtyDaysAgo);

  let hourlyUsed = 0;
  let monthlyUsed = 0;
  for (const r of (rows ?? []) as any[]) {
    const c = Number(r.credits_used ?? 0);
    monthlyUsed += c;
    if (r.created_at >= oneHourAgo) hourlyUsed += c;
  }

  return NextResponse.json({
    hourly: {
      used: hourlyUsed,
      limit: HOURLY_CREDIT_LIMIT,
      remaining: Math.max(0, HOURLY_CREDIT_LIMIT - hourlyUsed),
    },
    monthly: {
      used: monthlyUsed,
      limit: MONTHLY_CREDIT_LIMIT,
      remaining: Math.max(0, MONTHLY_CREDIT_LIMIT - monthlyUsed),
      estimatedCostUsd: estimatedDollarCost(monthlyUsed),
    },
    cost: CREDIT_COST,
  });
}
