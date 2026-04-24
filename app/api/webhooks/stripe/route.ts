import { NextRequest, NextResponse } from "next/server";
import { stripe, planFromPriceId } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { grantTopUp } from "@/lib/ai/credit-balance";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  switch (event.type) {
    // Subscription created or renewed (includes trial start)
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const isActive =
        subscription.status === "active" ||
        subscription.status === "trialing";

      // Inspect the subscribed price to choose the plan tier. Teacher
      // Solo and Readee+ are separate products in Stripe, so we have to
      // map the price ID → plan string explicitly.
      const priceId = subscription.items.data[0]?.price?.id ?? null;
      const tier = planFromPriceId(priceId) ?? "premium";

      await admin
        .from("profiles")
        .update({
          plan: isActive ? tier : "free",
          stripe_subscription_id: subscription.id,
        })
        .eq("stripe_customer_id", customerId);

      break;
    }

    // Subscription cancelled or expired
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      await admin
        .from("profiles")
        .update({
          plan: "free",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", customerId);

      break;
    }

    // One-time credit pack checkout — mode:"payment", not subscription.
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.kind !== "ai_credit_pack") break;
      if (session.payment_status !== "paid") break;

      const userId = session.metadata.supabase_user_id as string | undefined;
      const pool = session.metadata.pool as "teacher" | "parent" | undefined;
      const credits = Number(session.metadata.credits ?? 0);
      if (!userId || !pool || !credits) break;

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      await grantTopUp({
        profileId: userId,
        pool,
        credits,
        source: "purchase",
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId ?? undefined,
        amountPaidUsdCents: session.amount_total ?? undefined,
        notes: `SKU ${session.metadata.sku}`,
      });
      break;
    }

    default:
      // Unhandled event type — no action needed
      break;
  }

  return NextResponse.json({ received: true });
}
