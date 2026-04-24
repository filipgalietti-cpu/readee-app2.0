/**
 * Credit top-up balance — queries and mutations that sit alongside the
 * monthly entitlement in both the teacher and parent Readee.ai budget
 * paths.
 *
 * Effective remaining credits for a user in a pool:
 *   max(0, monthly_entitlement - monthly_used) + sum(balance rows)
 *
 * Top-ups are consumed only after the monthly entitlement is exhausted,
 * so a power user who tops up doesn't lose their monthly "free" credits
 * silently.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export type CreditPool = "teacher" | "parent";

/** Total unspent top-up credits for a user in the given pool. */
export async function getTopUpBalance(
  profileId: string,
  pool: CreditPool,
): Promise<number> {
  const admin = supabaseAdmin();
  const nowIso = new Date().toISOString();
  const { data } = await admin
    .from("ai_credit_balance")
    .select("balance, expires_at")
    .eq("profile_id", profileId)
    .eq("pool", pool)
    .gt("balance", 0);
  let total = 0;
  for (const r of (data ?? []) as any[]) {
    if (r.expires_at && r.expires_at < nowIso) continue;
    total += Number(r.balance ?? 0);
  }
  return total;
}

/**
 * Spend up to `amount` credits from the user's top-up pool. Consumes
 * oldest rows first (FIFO). Returns the amount actually spent — caller
 * can detect under-consumption and error out accordingly. Used by the
 * orchestrator ONLY after the monthly entitlement is exhausted.
 */
export async function spendTopUp(input: {
  profileId: string;
  pool: CreditPool;
  amount: number;
}): Promise<{ spent: number }> {
  if (input.amount <= 0) return { spent: 0 };
  const admin = supabaseAdmin();
  const { data: rows } = await admin
    .from("ai_credit_balance")
    .select("id, balance")
    .eq("profile_id", input.profileId)
    .eq("pool", input.pool)
    .gt("balance", 0)
    .order("created_at", { ascending: true });

  let remaining = input.amount;
  for (const r of (rows ?? []) as any[]) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, Number(r.balance));
    const newBalance = Number(r.balance) - take;
    const { error } = await admin
      .from("ai_credit_balance")
      .update({ balance: newBalance })
      .eq("id", r.id);
    if (error) continue;
    remaining -= take;
  }
  return { spent: input.amount - remaining };
}

/** Grant a new top-up row. Called by the Stripe webhook on success. */
export async function grantTopUp(input: {
  profileId: string;
  pool: CreditPool;
  credits: number;
  source: "purchase" | "promo" | "referral" | "refund" | "adjustment";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  amountPaidUsdCents?: number;
  notes?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = supabaseAdmin();
  const { error } = await admin.from("ai_credit_balance").insert({
    profile_id: input.profileId,
    pool: input.pool,
    balance: input.credits,
    source: input.source,
    stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
    amount_paid_usd_cents: input.amountPaidUsdCents ?? null,
    notes: input.notes ?? null,
  });
  if (error) {
    // Unique constraint hit on checkout session → webhook retry, safe
    // to ignore.
    if ((error as any).code === "23505") return { ok: true };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Hard-coded SKU catalog. Keep in sync with Stripe product metadata on
 * the dashboard. `usdCents` is for display — the actual charge is
 * driven by the Stripe price.
 */
export const CREDIT_PACKS = [
  {
    sku: "credits_250" as const,
    label: "+250 credits",
    credits: 250,
    usdCents: 500,
    subtitle: "About 30 images or 125 TTS clips",
  },
  {
    sku: "credits_500" as const,
    label: "+500 credits",
    credits: 500,
    usdCents: 800,
    subtitle: "About 60 images or 250 TTS clips. Best value.",
    best: true,
  },
];

export type CreditPackSku = (typeof CREDIT_PACKS)[number]["sku"];

export function creditsForSku(sku: CreditPackSku): number {
  const pack = CREDIT_PACKS.find((p) => p.sku === sku);
  return pack?.credits ?? 0;
}
