import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe, PRICES } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { billing, sku } = (await req.json()) as {
    billing: "monthly" | "annual";
    sku?: "premium" | "teacher_solo";
  };
  const plan = sku ?? "premium";
  const priceId =
    plan === "teacher_solo"
      ? billing === "annual"
        ? PRICES.teacherSoloAnnual
        : PRICES.teacherSoloMonthly
      : billing === "annual"
      ? PRICES.annual
      : PRICES.monthly;
  if (!priceId) {
    return NextResponse.json(
      { error: `Price not configured for ${plan} ${billing}` },
      { status: 500 },
    );
  }

  // Check if user already has a Stripe customer ID
  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | null;

  // Create Stripe customer if none exists
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

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
    },
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/upgrade`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
