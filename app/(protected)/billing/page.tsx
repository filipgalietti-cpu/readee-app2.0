"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { CreditCard, Star, Check, Sparkles, BookOpen, Target, Puzzle, Map, Zap } from "lucide-react";
import SettingsShell from "@/app/_components/SettingsShell";
import { usePlanStore } from "@/lib/stores/plan-store";

interface BillingData {
  plan: string;
  display_name: string;
  promo_code: string | null;
  redeemed_at: string | null;
}

const PREMIUM_FEATURES = [
  { icon: BookOpen, label: "Full lesson library across all grades" },
  { icon: Target, label: "Unlimited practice questions" },
  { icon: Puzzle, label: "All interactive game types" },
  { icon: Map, label: "Complete reading journey & roadmap" },
  { icon: Sparkles, label: "Up to 5 reader profiles" },
  { icon: Zap, label: "Priority support" },
];

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<BillingData | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data: profRows } = await supabase
        .from("profiles")
        .select("display_name, plan")
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

      const plan = prof?.plan ?? "free";
      usePlanStore.getState().setPlan(plan);
      setBilling({
        plan,
        display_name: prof?.display_name || "User",
        promo_code: redemption?.promo_codes?.code || null,
        redeemed_at: redemption?.redeemed_at || null,
      });
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading || !billing) {
    return (
      <SettingsShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  const isPremium = billing.plan === "premium";
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
                    {isPremium ? "Readee+" : "Free"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isPremium ? "bg-violet-200 text-violet-800" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {isPremium ? "ACTIVE" : "CURRENT"}
                  </span>
                </div>
                {isPremium && activatedDate && (
                  <p className="text-sm text-violet-600/70 mt-1">Activated on {activatedDate}</p>
                )}
                {isPremium && billing.promo_code && (
                  <p className="text-xs text-violet-500 mt-0.5">Via promo code: {billing.promo_code}</p>
                )}
              </div>
              {isPremium && <Star className="w-10 h-10 text-violet-400" fill="currentColor" strokeWidth={0} />}
            </div>

            {isPremium ? (
              <div className="rounded-xl bg-white/60 border border-violet-100 p-4">
                <p className="text-sm font-medium text-violet-900 mb-1">Lifetime Access</p>
                <p className="text-xs text-violet-600/70">
                  Your Readee+ plan was activated via promotional code. You have full access to all features with no recurring charges.
                </p>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                You&apos;re on the free plan with access to starter lessons. Upgrade to unlock the full curriculum.
              </p>
            )}
          </section>

          {/* Features */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900 mb-4">
              {isPremium ? "What's Included" : "Unlock Everything with Readee+"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {PREMIUM_FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isPremium ? "bg-violet-100" : "bg-zinc-100"}`}>
                    {isPremium ? (
                      <Check className="w-4 h-4 text-violet-600" strokeWidth={2} />
                    ) : (
                      <Icon className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                    )}
                  </div>
                  <span className={`text-sm ${isPremium ? "text-zinc-700" : "text-zinc-600"}`}>{label}</span>
                </div>
              ))}
            </div>
            {!isPremium && (
              <Link
                href="/upgrade"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-center text-sm font-bold hover:from-indigo-700 hover:to-violet-600 transition-all shadow-md"
              >
                Upgrade to Readee+
              </Link>
            )}
          </section>

          {/* Billing History */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900 mb-4">Billing History</h2>
            {isPremium && activatedDate ? (
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
        </div>
      </div>
    </SettingsShell>
  );
}
