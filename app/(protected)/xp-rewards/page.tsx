"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";

const TIERS = [
  { name: "Bronze", xp: 50, emoji: "🥉", color: "from-amber-600 to-amber-700", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  { name: "Silver", xp: 100, emoji: "🥈", color: "from-gray-400 to-gray-500", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" },
  { name: "Gold", xp: 200, emoji: "🥇", color: "from-yellow-400 to-yellow-500", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  { name: "Platinum", xp: 500, emoji: "💎", color: "from-cyan-400 to-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
  { name: "Diamond", xp: 1000, emoji: "👑", color: "from-violet-500 to-purple-600", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
];

export default function XPRewardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <XPRewardsContent />
    </Suspense>
  );
}

function XPRewardsContent() {
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
      if (data) setChild(data as Child);
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

  const currentTierIdx = TIERS.findLastIndex((t) => child.xp >= t.xp);
  const nextTier = TIERS[currentTierIdx + 1] || null;
  const prevTierXP = currentTierIdx >= 0 ? TIERS[currentTierIdx].xp : 0;
  const nextTierXP = nextTier ? nextTier.xp : child.xp;
  const progressPct = nextTier
    ? Math.min(Math.round(((child.xp - prevTierXP) / (nextTierXP - prevTierXP)) * 100), 100)
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

      {/* XP Display */}
      <div className="text-center animate-slideUp">
        <div className="text-5xl mb-3">⭐</div>
        <div className="text-4xl font-bold text-zinc-900">{child.xp} XP</div>
        <p className="text-zinc-500 mt-1">{child.first_name}&apos;s Experience Points</p>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dash-slide-up-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-600">
              Next: {nextTier.emoji} {nextTier.name}
            </span>
            <span className="text-sm font-bold text-indigo-600">{child.xp}/{nextTier.xp} XP</span>
          </div>
          <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            {nextTier.xp - child.xp} XP to go!
          </p>
        </div>
      )}

      {/* Badge Tiers */}
      <div className="space-y-3 dash-slide-up-2">
        <h2 className="text-lg font-bold text-zinc-900">Milestone Badges</h2>
        {TIERS.map((tier, i) => {
          const earned = child.xp >= tier.xp;
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
                  {tier.xp} XP required
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

      {/* Rewards Shop Teaser */}
      <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-6 text-center dash-slide-up-3">
        <div className="text-3xl mb-2">🛍️</div>
        <h3 className="font-bold text-indigo-700">Rewards Shop</h3>
        <p className="text-sm text-indigo-500 mt-1">Coming Soon! Spend your XP on fun rewards.</p>
      </div>
    </div>
  );
}
