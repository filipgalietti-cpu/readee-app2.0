"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { safeValidate } from "@/lib/validate";
import { ChildSchema } from "@/lib/schemas";

const TIERS = [
  { name: "Bronze", carrots: 50, emoji: "🥉", color: "from-amber-600 to-amber-700", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  { name: "Silver", carrots: 100, emoji: "🥈", color: "from-gray-400 to-gray-500", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" },
  { name: "Gold", carrots: 200, emoji: "🥇", color: "from-yellow-400 to-yellow-500", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  { name: "Platinum", carrots: 500, emoji: "💎", color: "from-cyan-400 to-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
  { name: "Diamond", carrots: 1000, emoji: "👑", color: "from-violet-500 to-purple-600", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
];

export default function CarrotRewardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <CarrotRewardsContent />
    </Suspense>
  );
}

function CarrotRewardsContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!childId) return;
      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();
      if (data) setChild(safeValidate(ChildSchema, data) as Child);
      setLoading(false);
    }
    load();
  }, [childId]);

  if (loading || !child) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const carrots = Number(child.carrots) || 0;
  const currentTierIdx = TIERS.findLastIndex((t) => carrots >= t.carrots);
  const nextTier = TIERS[currentTierIdx + 1] || null;
  const prevTierCarrots = currentTierIdx >= 0 ? TIERS[currentTierIdx].carrots : 0;
  const nextTierCarrots = nextTier ? nextTier.carrots : carrots;
  const range = nextTierCarrots - prevTierCarrots;
  const progressPct = nextTier && range > 0
    ? Math.min(Math.round(((carrots - prevTierCarrots) / range) * 100), 100)
    : 100;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          &larr; Back
        </Link>
      </div>

      {/* Carrots Display */}
      <div className="text-center animate-slideUp">
        <div className="text-5xl mb-3">🥕</div>
        <div className="text-4xl font-bold text-orange-600">{carrots} Carrots</div>
        <p className="text-zinc-500 mt-1">{child.first_name}&apos;s Carrot Collection</p>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dash-slide-up-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-600">
              Next: {nextTier.emoji} {nextTier.name}
            </span>
            <span className="text-sm font-bold text-orange-600">{carrots}/{nextTier.carrots} 🥕</span>
          </div>
          <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            {nextTier.carrots - carrots} carrots to go!
          </p>
        </div>
      )}

      {/* Badge Tiers */}
      <div className="space-y-3 dash-slide-up-2">
        <h2 className="text-lg font-bold text-zinc-900">Milestone Badges</h2>
        {TIERS.map((tier, i) => {
          const earned = carrots >= tier.carrots;
          return (
            <div
              key={tier.name}
              className={`rounded-2xl border p-4 flex items-center gap-4 transition-all duration-300 ${
                earned
                  ? `${tier.border} ${tier.bg}`
                  : "border-zinc-100 bg-zinc-50 opacity-60"
              } ${earned ? "animate-badgeUnlock" : ""}`}
              style={earned ? { animationDelay: `${i * 0.1}s` } : undefined}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${
                  earned ? "shadow-md" : "grayscale"
                }`}
              >
                {tier.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold ${earned ? tier.text : "text-zinc-400"}`}>
                  {tier.name}
                </div>
                <div className="text-xs text-zinc-400">
                  {tier.carrots} 🥕 required
                </div>
              </div>
              {earned ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  Earned!
                </span>
              ) : (
                <span className="text-2xl grayscale opacity-40">🔒</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Rewards Shop Link */}
      <Link href={`/shop?child=${child.id}`} className="block">
        <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-6 text-center hover:border-orange-300 hover:shadow-md transition-all dash-slide-up-3">
          <div className="text-3xl mb-2">🛍️</div>
          <h3 className="font-bold text-orange-700">Rewards Shop</h3>
          <p className="text-sm text-orange-500 mt-1">Spend your carrots on fun rewards!</p>
          <span className="inline-block mt-3 px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-sm">
            Visit Shop →
          </span>
        </div>
      </Link>
    </div>
  );
}
