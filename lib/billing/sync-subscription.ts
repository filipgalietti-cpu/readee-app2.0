import { stripe, planFromPriceId } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export const grantsSubscriptionAccess = (s: Stripe.Subscription) => ["active", "trialing", "past_due"].includes(s.status);
const failure = (code: string) => Object.assign(new Error(code), { code });

/** Reconcile current Stripe state, never the stale snapshot carried by a retried event. */
export async function syncCustomerSubscription(customerId: string, expectedSubscriptionId?: string) {
  const admin = supabaseAdmin();
  const profile = await admin.from("profiles").select("id, email, stripe_subscription_id")
    .eq("stripe_customer_id", customerId).maybeSingle();
  if (profile.error) throw profile.error;
  if (!profile.data) throw failure("stripe_profile_missing");

  const subscriptions: Stripe.Subscription[] = [];
  for await (const sub of stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 })) subscriptions.push(sub);
  if (expectedSubscriptionId && !subscriptions.some((s) => s.id === expectedSubscriptionId)) throw failure("stripe_subscription_missing");
  subscriptions.sort((a, b) => Number(grantsSubscriptionAccess(b)) - Number(grantsSubscriptionAccess(a)) || b.created - a.created);
  const subscription = subscriptions[0] ?? null;
  const active = !!subscription && grantsSubscriptionAccess(subscription);
  const tier = active ? planFromPriceId(subscription.items.data[0]?.price?.id) : "free";
  if (!tier) throw failure("stripe_price_unmapped");
  let query = admin.from("profiles").update({ plan: tier,
    stripe_subscription_id: active ? subscription.id : null,
    ...(active ? { had_subscription: true } : {}),
  }).eq("id", profile.data.id).eq("stripe_customer_id", customerId);
  // Do not overwrite a concurrently linked subscription. A retry re-reads both systems.
  query = profile.data.stripe_subscription_id
    ? query.eq("stripe_subscription_id", profile.data.stripe_subscription_id)
    : query.is("stripe_subscription_id", null);
  const written = await query.select("id, email").maybeSingle();
  if (written.error) throw written.error;
  if (!written.data) throw failure("stripe_profile_changed");
  return { profile: written.data, subscription };
}
