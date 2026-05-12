"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  CreditCard,
  Star,
  Check,
  ExternalLink,
  Mail,
  ShieldCheck,
} from "lucide-react";
import SettingsShell from "@/app/_components/SettingsShell";
import { usePlanStore } from "@/lib/stores/plan-store";
import { SkeletonPage } from "@/app/_components/Skeleton";
// Canonical billing copy — keep this page in lockstep with /upgrade by
// reading every price/feature/promise from lib/billing-copy.ts.
import {
  PRICING,
  PREMIUM_FEATURES,
  PLAN_LABEL,
  SUPPORT,
} from "@/lib/billing-copy";

interface BillingData {
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  promo_code: string | null;
  redeemed_at: string | null;
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  // Surface portal failures inline — a silent failure on this page
  // leaves a paying subscriber unable to update their card or cancel,
  // which becomes a chargeback waiting to happen.
  const [portalError, setPortalError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load(opts: { firstRun: boolean }) {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data: profRows } = await supabase
        .from("profiles")
        .select("plan, stripe_customer_id, stripe_subscription_id")
        .eq("id", user.id)
        .limit(1);

      const prof = profRows?.[0] as any;

      const { data: promo } = await supabase
        .from("promo_redemptions")
        .select("redeemed_at, promo_codes(code)")
        .eq("user_id", user.id)
        .order("redeemed_at", { ascending: false })
        .limit(1);

      const redemption = promo?.[0] as any;
      if (!alive) return;

      const plan = prof?.plan ?? "free";
      usePlanStore.getState().setPlan(plan);
      setBilling({
        plan,
        stripe_customer_id: prof?.stripe_customer_id || null,
        stripe_subscription_id: prof?.stripe_subscription_id || null,
        promo_code: redemption?.promo_codes?.code || null,
        redeemed_at: redemption?.redeemed_at || null,
      });
      if (opts.firstRun) setLoading(false);
    }
    load({ firstRun: true });

    // Re-fetch whenever the tab regains focus. The dominant exit from
    // this page is the Stripe billing portal — opened in the same tab
    // it's true, but parents on desktop very often shift between tabs
    // mid-flow (e.g., cancel in Stripe portal, then come back to
    // /billing to confirm). Without this, the page shows the pre-cancel
    // state until they manually reload, and they tap "Manage" again
    // wondering why nothing changed. Cheap to query.
    function onVisible() {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        load({ firstRun: false });
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  async function handleManageSubscription() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return; // keep spinner up during the Stripe redirect
      }
      setPortalError(
        data.error
          ? `Couldn't open the billing portal: ${data.error}. Email ${SUPPORT.email} and we'll handle it for you.`
          : `Couldn't open the billing portal. Email ${SUPPORT.email} and we'll handle it for you.`,
      );
    } catch {
      setPortalError(
        `Couldn't reach Stripe. Check your connection and try again — or email ${SUPPORT.email}.`,
      );
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading || !billing) {
    return (
      <SettingsShell>
        <SkeletonPage cards={3} />
      </SettingsShell>
    );
  }

  const isPremium = billing.plan === "premium";
  const hasStripe = !!billing.stripe_customer_id;
  const hasPromo = !!billing.promo_code;
  const activatedDate = billing.redeemed_at
    ? new Date(billing.redeemed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <SettingsShell>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Billing</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your subscription</p>
        </div>

        <div className="space-y-5">
          {/* Current Plan */}
          <section className={`rounded-2xl border p-6 shadow-sm ${
            isPremium
              ? "border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50"
              : "border-zinc-200 bg-white"
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className={`w-5 h-5 ${isPremium ? "text-violet-500" : "text-zinc-400"}`} strokeWidth={1.5} />
              <h2 className="text-base font-semibold text-zinc-900">Current Plan</h2>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${isPremium ? "text-violet-700" : "text-zinc-900"}`}>
                    {PLAN_LABEL[billing.plan] ?? "Free"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isPremium ? "bg-violet-200 text-violet-800" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {isPremium ? "ACTIVE" : "CURRENT"}
                  </span>
                </div>
                {/* For paying customers, show the price clearly so there
                    are zero surprises. Same numbers as /upgrade — both
                    read from lib/billing-copy.ts. */}
                {isPremium && hasStripe && (
                  <p className="mt-1 text-sm text-violet-700">
                    {PRICING.monthly.label} or {PRICING.annual.label} —
                    full access, cancel anytime
                  </p>
                )}
                {isPremium && hasPromo && activatedDate && (
                  <p className="text-sm text-violet-600/70 mt-1">Activated on {activatedDate}</p>
                )}
                {isPremium && hasPromo && (
                  <p className="text-xs text-violet-500 mt-0.5">Via promo code: {billing.promo_code}</p>
                )}
              </div>
              {isPremium && <Star className="w-10 h-10 text-violet-400" fill="currentColor" strokeWidth={0} />}
            </div>

            {isPremium && hasStripe && (
              <div className="space-y-3">
                <div className="rounded-xl bg-white/60 border border-violet-100 p-4">
                  <p className="text-sm font-medium text-violet-900 mb-1">Subscription managed by Stripe</p>
                  <p className="text-xs text-violet-600/70">
                    Update payment method, switch monthly ↔ annual, view
                    invoices, or cancel — all in the Stripe billing portal.
                    Cancellation keeps you on Readee+ until the end of
                    your billing period, then drops you to Free.
                  </p>
                </div>
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-violet-200 text-sm font-semibold text-violet-700 hover:bg-violet-50 transition-colors disabled:opacity-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  {portalLoading ? "Opening..." : "Manage subscription"}
                </button>
                {portalError && (
                  <div
                    role="alert"
                    className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
                  >
                    {portalError}
                  </div>
                )}
              </div>
            )}

            {isPremium && hasPromo && !hasStripe && (
              <div className="rounded-xl bg-white/60 border border-violet-100 p-4">
                <p className="text-sm font-medium text-violet-900 mb-1">Promo access</p>
                <p className="text-xs text-violet-600/70">
                  Your Readee+ access was activated via promo code. No
                  card on file, no recurring charge — just full access
                  for the promo period.
                </p>
              </div>
            )}

            {!isPremium && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-600">
                  You&apos;re on the free plan — adaptive placement test,
                  first lesson per grade, 10 practice questions per
                  standard, 2 stories per grade, the daily question, and
                  the public community library.
                </p>
                <Link
                  href="/upgrade"
                  className="block w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:from-indigo-700 hover:to-violet-600"
                >
                  Start {PRICING.trialDays}-day free trial — {PRICING.monthly.label}
                </Link>
                <p className="text-center text-[11px] text-zinc-400">
                  No charge until day {PRICING.trialDays + 1}. Cancel anytime.
                </p>
              </div>
            )}
          </section>

          {/* Features — same canonical list /upgrade shows. Single
              source of truth in lib/billing-copy.ts so the list never
              drifts between the two pages. */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-zinc-900">
              {isPremium ? "What's included" : "Unlock everything with Readee+"}
            </h2>
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {PREMIUM_FEATURES.map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                      isPremium ? "bg-violet-100" : "bg-zinc-100"
                    }`}
                  >
                    <Check
                      className={`h-4 w-4 ${
                        isPremium ? "text-violet-600" : "text-zinc-400"
                      }`}
                      strokeWidth={2.4}
                    />
                  </div>
                  <span className="text-sm leading-snug text-zinc-700">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Billing History */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900 mb-4">Billing History</h2>
            {isPremium && hasStripe ? (
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4 text-center">
                <p className="text-sm text-zinc-600">View your invoices and payment history in the Stripe portal.</p>
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {portalLoading ? "Opening..." : "View in Stripe"}
                </button>
                {portalError && (
                  <div
                    role="alert"
                    className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
                  >
                    {portalError}
                  </div>
                )}
              </div>
            ) : isPremium && hasPromo && activatedDate ? (
              <div className="rounded-xl border border-zinc-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50">
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Date</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Description</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Amount</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 text-zinc-700">{activatedDate}</td>
                      <td className="px-4 py-3 text-zinc-700">Readee+ Activation (Promo)</td>
                      <td className="px-4 py-3 text-right text-zinc-700">$0.00</td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Completed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-8 h-8 text-zinc-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-zinc-400">No billing history</p>
              </div>
            )}
          </section>

          {/* Refund policy + support — explicit so parents see it
              before they need it. Trust through clarity. */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-zinc-900">
              Refunds &amp; support
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              {SUPPORT.refundPolicy}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <a
                href={`mailto:${SUPPORT.email}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={2.2} />
                {SUPPORT.email}
              </a>
              <span className="inline-flex items-center gap-1.5 text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.2} />
                Secure checkout via Stripe
              </span>
            </div>
          </section>
        </div>
      </div>
    </SettingsShell>
  );
}
