import { NextRequest, NextResponse } from "next/server";
import { stripe, planFromPriceId } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { grantTopUp } from "@/lib/ai/credit-balance";
import { trackFunnel } from "@/lib/analytics/funnel.server";
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

      // Subscription state → plan mapping:
      //   active, trialing → keep premium (paid)
      //   past_due         → keep premium (grace period — Stripe is
      //                       retrying the card, usually 3 attempts
      //                       over ~3 weeks. Don't strand a paying
      //                       customer over a temporary card decline.
      //                       customer.subscription.deleted will fire
      //                       if collection ultimately fails.)
      //   canceled, unpaid, incomplete*, paused → free
      const grantsAccess =
        subscription.status === "active" ||
        subscription.status === "trialing" ||
        subscription.status === "past_due";

      // Inspect the subscribed price to choose the plan tier. Teacher
      // Solo and Readee+ are separate products in Stripe, so we have to
      // map the price ID → plan string explicitly.
      const priceId = subscription.items.data[0]?.price?.id ?? null;
      const tier = planFromPriceId(priceId) ?? "premium";

      const { data: updated } = await admin
        .from("profiles")
        .update({
          plan: grantsAccess ? tier : "free",
          stripe_subscription_id: subscription.id,
        })
        .eq("stripe_customer_id", customerId)
        .select("id")
        .maybeSingle();

      // Funnel steps 5 & 6 — fire only on the `subscription.created`
      // event so a status flip from trialing→active later doesn't
      // double-count. `customer.subscription.updated` runs the same
      // plan-flip logic above for resilience but skips telemetry.
      if (event.type === "customer.subscription.created" && updated?.id) {
        if (subscription.status === "trialing") {
          await trackFunnel("funnel.trial_started", updated.id, {
            tier,
            price_id: priceId,
          });
        } else if (subscription.status === "active") {
          // Non-trial direct activation (eg promo with $0 first month
          // or annual pay-now flow).
          await trackFunnel("funnel.subscription_active", updated.id, {
            tier,
            price_id: priceId,
          });
        }
      }

      // When a trialing subscription converts (trialing → active), the
      // .updated event carries the transition. Fire subscription_active
      // exactly on that edge so we don't lose the conversion signal.
      if (event.type === "customer.subscription.updated" && updated?.id) {
        const prev = event.data.previous_attributes as Stripe.Subscription | undefined;
        const wasTrialing = prev?.status === "trialing";
        const nowActive = subscription.status === "active";
        if (wasTrialing && nowActive) {
          await trackFunnel("funnel.subscription_active", updated.id, {
            tier,
            price_id: priceId,
            from: "trial_conversion",
          });
        }
      }

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

    // Refund issued (full or partial). Stripe will normally fire a
    // customer.subscription.updated alongside, but if the merchant
    // refunds a one-time credit-pack we won't get that — handle the
    // refund event directly so a refunded user doesn't keep premium
    // entitlement they paid for.
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const customerId =
        typeof charge.customer === "string" ? charge.customer : charge.customer?.id;
      if (!customerId) break;
      // Full refund only. Partial refunds are common for prorations
      // and we don't want to revoke access for those.
      if (charge.amount_refunded < charge.amount) break;
      // If this charge was tied to an active subscription, leave the
      // sub event handler to flip the plan. Refunded one-time credit
      // packs are best-effort visibility; we don't auto-claw credits
      // back (that turns into a support ticket either way).
      console.warn("[stripe] charge.refunded — flagging account", {
        customerId,
        amountCents: charge.amount,
      });
      break;
    }

    // Trial ending in 3 days. Stripe fires this once per sub. Hook
    // here to send a "your trial ends soon" email — wired loosely
    // for now (just logged) so we have telemetry; the email sender
    // can pick up on this event later without changing the webhook.
    case "customer.subscription.trial_will_end": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      console.warn("[stripe] trial_will_end — 3 days out", {
        customerId,
        subscriptionId: subscription.id,
        trialEnd: subscription.trial_end,
      });
      break;
    }

    // Renewal payment failed. Stripe will retry on its own (3 attempts
    // over ~3 weeks) and eventually fire customer.subscription.deleted
    // if collection ultimately fails. Logging here so we have a CS
    // signal before the cancel — at-risk dashboard can pick this up.
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (!customerId) break;
      console.warn("[stripe] invoice.payment_failed", {
        customerId,
        attemptCount: invoice.attempt_count,
        nextPaymentAttempt: invoice.next_payment_attempt,
      });
      break;
    }

    // Customer record deleted (rare — only fires if the merchant
    // deletes a Stripe customer). Clean up the FK so the user can
    // resubscribe with a fresh record.
    case "customer.deleted": {
      const customer = event.data.object as Stripe.Customer;
      await admin
        .from("profiles")
        .update({ plan: "free", stripe_customer_id: null, stripe_subscription_id: null })
        .eq("stripe_customer_id", customer.id);
      break;
    }

    default:
      // Unhandled event type — no action needed
      break;
  }

  return NextResponse.json({ received: true });
}
