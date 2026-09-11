import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  syncCustomerSubscription,
  grantsSubscriptionAccess,
} from "@/lib/billing/sync-subscription";
import { reportFailure } from "@/lib/observability/critical";

export const maxDuration = 30;
/** Checkout's URL is not proof of payment. Reconcile the signed-in parent's own Stripe customer. */
export async function POST() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const { data: profile, error } = await db
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    if (!profile?.stripe_customer_id) return NextResponse.json({ ok: true, fullAccess: false });
    const synced = await syncCustomerSubscription(profile.stripe_customer_id);
    return NextResponse.json({
      ok: true,
      fullAccess: !!synced.subscription && grantsSubscriptionAccess(synced.subscription),
    });
  } catch (error) {
    reportFailure("billing.confirm", error, { route: "/api/billing/confirm" });
    return NextResponse.json(
      { ok: false, error: "Your subscription is still being confirmed. Please retry." },
      { status: 503 },
    );
  }
}
