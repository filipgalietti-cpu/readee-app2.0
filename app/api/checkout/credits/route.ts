import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import {
  CREDIT_PACKS,
  type CreditPackSku,
} from "@/lib/ai/credit-balance";

/**
 * One-time Stripe checkout for AI credit packs. Distinct from the
 * subscription /api/checkout route — this is mode:"payment", not
 * mode:"subscription", and doesn't trial.
 *
 * Caller passes:
 *   { sku: "credits_250" | "credits_500", pool: "teacher" | "parent" }
 *
 * Stripe price IDs come from env vars:
 *   STRIPE_PRICE_CREDITS_250
 *   STRIPE_PRICE_CREDITS_500
 *
 * On success.webhook, we look up the sku + pool from the checkout
 * session metadata and grant a matching row in ai_credit_balance.
 */

const SKU_TO_PRICE_ENV: Record<CreditPackSku, string> = {
  credits_250: "STRIPE_PRICE_CREDITS_250",
  credits_500: "STRIPE_PRICE_CREDITS_500",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as {
    sku: CreditPackSku;
    pool: "teacher" | "parent";
  };

  const pack = CREDIT_PACKS.find((p) => p.sku === body.sku);
  if (!pack) {
    return NextResponse.json({ error: "Unknown pack" }, { status: 400 });
  }
  if (body.pool !== "teacher" && body.pool !== "parent") {
    return NextResponse.json({ error: "Invalid pool" }, { status: 400 });
  }

  const priceEnv = SKU_TO_PRICE_ENV[body.sku];
  const priceId = process.env[priceEnv];
  if (!priceId) {
    return NextResponse.json(
      { error: `${priceEnv} is not configured` },
      { status: 500 },
    );
  }

  // Look up or create a Stripe customer.
  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const origin = req.headers.get("origin") || "https://learn.readee.app";
  const successReturn = body.pool === "parent" ? "/dashboard/ask-readee" : "/classroom";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}${successReturn}?topup=success`,
    cancel_url: `${origin}${successReturn}?topup=cancelled`,
    metadata: {
      kind: "ai_credit_pack",
      sku: body.sku,
      pool: body.pool,
      credits: String(pack.credits),
      supabase_user_id: user.id,
    },
    // Support for tax + receipts.
    customer_update: { name: "auto", address: "auto" },
  });

  return NextResponse.json({ url: session.url });
}
