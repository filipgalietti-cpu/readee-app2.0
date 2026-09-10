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

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  const { billing, sku, cancelTo, childId } = body as {
    billing: "monthly" | "annual";
    sku?: "premium" | "teacher_solo";
    /** Same-site path to return to if the parent backs out (default /upgrade). */
    cancelTo?: string;
    childId?: string;
  };
  if (!["monthly", "annual"].includes(billing) || (sku !== undefined && !["premium", "teacher_solo"].includes(sku)))
    return NextResponse.json({ error: "Choose a billing plan." }, { status: 400 });
  const safeCancelTo = typeof cancelTo === "string" && cancelTo.startsWith("/") && !cancelTo.startsWith("//") ? cancelTo : "/upgrade";
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
    .select("stripe_customer_id, had_subscription")
    .eq("id", user.id)
    .single();

  let journeyReturn: string | null = null;
  if (childId !== undefined) {
    if (typeof childId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(childId))
      return NextResponse.json({ error: "Invalid reader." }, { status: 400 });
    const { data: reader, error } = await admin.from("children").select("id").eq("id", childId).eq("parent_id", user.id).maybeSingle();
    if (error) return NextResponse.json({ error: "Could not load the reading journey." }, { status: 503 });
    if (!reader) return NextResponse.json({ error: "Reader not found." }, { status: 404 });
    journeyReturn = `/journey?child=${childId}&checkout=success`;
  }

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

  // The 14-day trial is once per account, not once per checkout.
  //
  // This asked for it unconditionally, so anyone who subscribed, cancelled and
  // came back got another free fortnight, every time, for as long as they kept
  // doing it. `had_subscription` is set by the Stripe webhook the first time a
  // subscription is created, so it is the record of "this account has had its go".
  const usedTrial = Boolean((profile as { had_subscription?: boolean } | null)?.had_subscription);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_collection: "always",
    line_items: [{ price: priceId, quantity: 1 }],
    ...(usedTrial ? {} : { subscription_data: { trial_period_days: 14 } }),
    success_url: `${origin}${journeyReturn ?? "/dashboard?checkout=success"}`,
    cancel_url: `${origin}${safeCancelTo}`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
