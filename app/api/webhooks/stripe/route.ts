import { NextRequest, NextResponse } from "next/server";
import { stripe, planFromPriceId } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { grantTopUp } from "@/lib/ai/credit-balance";
import { trackFunnel } from "@/lib/analytics/funnel.server";
import { notifyTeam } from "@/lib/email/notify-team";
import { Resend } from "resend";

/** Branded cancellation confirmation to the customer. Best-effort. */
async function sendCancellationEmail(to: string, periodEndSeconds: number | null, trialing: boolean): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to || to === "(unknown)") return;
  const endStr = periodEndSeconds
    ? new Date(periodEndSeconds * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  const lead = trialing
    ? `Your Readee+ free trial has been canceled, so you won't be charged.${endStr ? ` You'll keep full access until ${endStr},` : " You'll keep access for now,"} then your account moves to the free plan.`
    : `Your Readee+ subscription has been canceled.${endStr ? ` You'll keep full access until ${endStr},` : ""} then your account moves to the free plan and you won't be charged again.`;
  const text = ["Hi there,", "", lead, "", "Your child's progress is saved. You can resubscribe anytime at https://learn.readee.app/upgrade", "", "- Readee"].join("\n");
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 16px;background:#f6f5f2;"><tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
      <tr><td align="center" style="padding-bottom:20px;"><img src="https://learn.readee.app/readee-logo.png" alt="Readee" width="132" style="display:block;width:132px;height:auto;" /></td></tr>
      <tr><td style="background:#ffffff;border:1px solid #ececf0;border-radius:20px;padding:36px 34px;box-shadow:0 10px 40px -18px rgba(49,46,129,.18);">
        <img src="https://learn.readee.app/images/ui/bunny-wave-clipboard.png" alt="" width="96" style="display:block;margin:0 auto 18px;width:96px;height:auto;" />
        <h1 style="margin:0;text-align:center;font-size:22px;font-weight:800;color:#1e1b4b;">Your Readee+ has been canceled</h1>
        <p style="margin:16px 0 0;font-size:15px;line-height:1.65;color:#3f3f46;text-align:center;">${lead}</p>
        <p style="margin:14px 0 0;font-size:13.5px;line-height:1.6;color:#6b7280;text-align:center;">Your child's progress is saved. Come back anytime.</p>
        <div style="text-align:center;margin-top:24px;"><a href="https://learn.readee.app/upgrade" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;text-decoration:none;">Resubscribe to Readee+</a></div>
      </td></tr>
      <tr><td align="center" style="padding-top:22px;"><p style="margin:0;font-size:12px;line-height:1.7;color:#a1a1aa;">Questions? <a href="mailto:hello@readee.app" style="color:#4f46e5;text-decoration:none;">hello@readee.app</a><br/><a href="https://instagram.com/readee.app"><img src="https://learn.readee.app/images/ui/social/instagram.png" alt="Instagram" width="26" height="26" style="display:inline-block;vertical-align:middle;border:0;outline:none;text-decoration:none;" /></a>&nbsp;&nbsp;<a href="https://tiktok.com/@readee.app"><img src="https://learn.readee.app/images/ui/social/tiktok.png" alt="TikTok" width="26" height="26" style="display:inline-block;vertical-align:middle;border:0;outline:none;text-decoration:none;" /></a><br/>Readee Learning LLC &middot; Built by educators</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  try {
    await new Resend(apiKey).emails.send({ from: "Readee <hello@readee.app>", to, subject: "Your Readee+ has been canceled", text, html });
  } catch { /* best-effort */ }
}
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
          // Mark that this account has had a paid subscription, so a later
          // cancel is treated as "lapsed" (win-back) not never-paid.
          ...(grantsAccess ? { had_subscription: true } : {}),
        })
        .eq("stripe_customer_id", customerId)
        .select("id, email")
        .maybeSingle();

      // User just canceled (scheduled to end at period end) → one-time
      // confirmation email so they're never left wondering if it worked.
      const prevAttrs = (event.data as { previous_attributes?: Record<string, unknown> }).previous_attributes ?? {};
      const justCanceled =
        event.type === "customer.subscription.updated" &&
        subscription.cancel_at_period_end === true &&
        prevAttrs.cancel_at_period_end !== true;
      if (justCanceled) {
        const to = (updated as { email?: string } | null)?.email ?? "";
        await sendCancellationEmail(to, (subscription as any).current_period_end ?? null, subscription.status === "trialing");
        await notifyTeam(
          `Cancellation scheduled: ${to || "(unknown)"}`,
          `<div style="font-family:sans-serif;max-width:520px"><p>Set to cancel at period end (still has access until then).</p></div>`,
        );
      }

      // Team alert on a NEW subscription (skip the noisier .updated event).
      if (event.type === "customer.subscription.created" && grantsAccess) {
        const who = (updated as { email?: string } | null)?.email ?? "(unknown email)";
        const label = tier === "teacher_solo" ? "Teacher Solo" : "Readee+";
        const kind = subscription.status === "trialing" ? "started a free trial of" : "subscribed to";
        await notifyTeam(
          `New ${label} ${subscription.status === "trialing" ? "trial" : "subscriber"}: ${who}`,
          `<div style="font-family:sans-serif;max-width:520px">
             <h2 style="margin:0 0 12px">New ${label} ${subscription.status === "trialing" ? "trial" : "subscription"}</h2>
             <p style="margin:4px 0"><strong>Email:</strong> ${who}</p>
             <p style="margin:4px 0"><strong>Plan:</strong> ${label}</p>
             <p style="margin:4px 0"><strong>Status:</strong> ${subscription.status}</p>
           </div>`,
        );
      }

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

      const { data: canceled } = await admin
        .from("profiles")
        .update({
          plan: "free",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", customerId)
        .select("email")
        .maybeSingle();

      const churnEmail = (canceled as { email?: string } | null)?.email ?? "(unknown)";
      await notifyTeam(
        `Subscription canceled: ${churnEmail}`,
        `<div style="font-family:sans-serif;max-width:520px">
           <h2 style="margin:0 0 12px">Subscription canceled</h2>
           <p style="margin:4px 0"><strong>Email:</strong> ${churnEmail}</p>
           <p style="margin:4px 0">They're back on the free plan.</p>
         </div>`,
      );

      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Subscription checkout → flip the plan HERE. This event is reliably
      // delivered; the customer.subscription.* events (which also do this) may
      // not be configured on the endpoint, so don't depend on them for the
      // initial upgrade. (Renewals/cancels still need the subscription events.)
      if (session.mode === "subscription" && session.subscription && session.customer) {
        const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
        const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        let tier = "premium";
        try {
          const sub = await stripe.subscriptions.retrieve(subId);
          tier = planFromPriceId(sub.items.data[0]?.price?.id) ?? "premium";
        } catch { /* default to premium */ }
        const { data: up } = await admin
          .from("profiles")
          .update({ plan: tier, stripe_subscription_id: subId, had_subscription: true })
          .eq("stripe_customer_id", customerId)
          .select("id")
          .maybeSingle();
        if (!up) console.error("[stripe] checkout.session.completed: no profile for customer", customerId);
        break;
      }

      // One-time credit pack checkout — mode:"payment", not subscription.
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
