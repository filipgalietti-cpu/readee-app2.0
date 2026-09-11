import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe, PRICES } from "@/lib/stripe";
import { reportFailure } from "@/lib/observability/critical";
import { PRICING } from "@/lib/billing-copy";
import { isPaidPlan } from "@/lib/plan/limits";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  const { billing, sku, cancelTo, childId, attemptId } = body as {
    billing: "monthly" | "annual";
    sku?: "premium" | "teacher_solo";
    /** Same-site path to return to if the parent backs out (default /upgrade). */
    cancelTo?: string;
    childId?: string;
    attemptId?: string;
  };
  if (
    !["monthly", "annual"].includes(billing) ||
    (sku !== undefined && !["premium", "teacher_solo"].includes(sku))
  )
    return NextResponse.json({ error: "Choose a billing plan." }, { status: 400 });
  if (
    attemptId !== undefined &&
    (typeof attemptId !== "string" || !/^[0-9a-f-]{36}$/i.test(attemptId))
  )
    return NextResponse.json({ error: "Invalid checkout attempt." }, { status: 400 });
  const safeCancelTo =
    typeof cancelTo === "string" &&
    /^\/(journey|upgrade|placement\/report)(\?|$)/.test(cancelTo) &&
    !/[\\\r\n]/.test(cancelTo)
      ? cancelTo
      : "/upgrade";
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

  try {
    // Check if user already has a Stripe customer ID
    const admin = supabaseAdmin();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("stripe_customer_id, had_subscription, plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) throw new Error("Billing profile unavailable");
    if (isPaidPlan(profile.plan))
      return NextResponse.json({ alreadySubscribed: true }, { status: 409 });

    let journeyReturn: string | null = null;
    if (childId !== undefined) {
      if (
        typeof childId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(childId)
      )
        return NextResponse.json({ error: "Invalid reader." }, { status: 400 });
      const { data: reader, error } = await admin
        .from("children")
        .select("id")
        .eq("id", childId)
        .eq("parent_id", user.id)
        .maybeSingle();
      if (error)
        return NextResponse.json({ error: "Could not load the reading journey." }, { status: 503 });
      if (!reader) return NextResponse.json({ error: "Reader not found." }, { status: 404 });
      journeyReturn = `/journey?child=${childId}&checkout=success`;
    }

    let customerId = profile?.stripe_customer_id as string | null;

    // Create Stripe customer if none exists
    if (!customerId) {
      const customer = await stripe.customers.create(
        {
          email: user.email,
          metadata: { supabase_user_id: user.id },
        },
        { idempotencyKey: `readee-customer-${user.id}` },
      );
      customerId = customer.id;

      const { error: customerSaveError } = await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      if (customerSaveError) throw new Error("Could not link billing customer");
    }

    const origin = new URL(req.url).origin;

    // The 14-day trial is once per account, not once per checkout.
    //
    // This asked for it unconditionally, so anyone who subscribed, cancelled and
    // came back got another free fortnight, every time, for as long as they kept
    // doing it. `had_subscription` is set by the Stripe webhook the first time a
    // subscription is created, so it is the record of "this account has had its go".
    const usedTrial = Boolean((profile as { had_subscription?: boolean } | null)?.had_subscription);

    const session = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        mode: "subscription",
        payment_method_collection: "always",
        line_items: [{ price: priceId, quantity: 1 }],
        ...(usedTrial ? {} : { subscription_data: { trial_period_days: PRICING.trialDays } }),
        success_url: `${origin}${journeyReturn ?? "/dashboard?checkout=success"}`,
        cancel_url: `${origin}${safeCancelTo}`,
        allow_promotion_codes: true,
      },
      ...(attemptId
        ? [{ idempotencyKey: `readee-checkout-${user.id}-${attemptId}-${billing}` }]
        : []),
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    reportFailure("billing.checkout", error, { route: "/api/checkout" });
    return NextResponse.json(
      { error: "Checkout is unavailable. Your reading plan is saved. Please try again." },
      { status: 503 },
    );
  }
}
