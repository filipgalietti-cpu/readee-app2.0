import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  MONTHLY_PARENT_CREDIT_LIMIT,
  HOURLY_PARENT_CREDIT_LIMIT,
} from "@/lib/ai/build-parent-content";
import { CREDIT_COST, estimatedDollarCost } from "@/lib/ai/credits";
import { getTopUpBalance } from "@/lib/ai/credit-balance";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await requireProfile();

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

  const topUpBalance = await getTopUpBalance(profile.id, "parent");
  const effectiveLimit = MONTHLY_PARENT_CREDIT_LIMIT + topUpBalance;

  return NextResponse.json({
    plan: profile.plan,
    isPremium: profile.plan === "premium",
    hourly: {
      used: hourlyUsed,
      limit: HOURLY_PARENT_CREDIT_LIMIT,
      remaining: Math.max(0, HOURLY_PARENT_CREDIT_LIMIT - hourlyUsed),
    },
    monthly: {
      used: monthlyUsed,
      limit: effectiveLimit,
      entitlement: MONTHLY_PARENT_CREDIT_LIMIT,
      topUpBalance,
      remaining: Math.max(0, effectiveLimit - monthlyUsed),
      estimatedCostUsd: estimatedDollarCost(monthlyUsed),
    },
    cost: CREDIT_COST,
  });
}
