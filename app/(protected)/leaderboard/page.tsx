"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { Crown, Medal, Flame, Sprout } from "lucide-react";
import type { ReactNode } from "react";

interface LeaderEntry {
  id: string;
  first_name: string;
  streak_days: number;
}

const RANK_ICONS: ReactNode[] = [
  <Crown key="1st" className="w-5 h-5 text-amber-500" strokeWidth={1.5} />,
  <Medal key="2nd" className="w-5 h-5 text-gray-400" strokeWidth={1.5} />,
  <Medal key="3rd" className="w-5 h-5 text-amber-600" strokeWidth={1.5} />,
];

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");
  const [child, setChild] = useState<Child | null>(null);
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!childId) return;

      const supabase = supabaseBrowser();
      const { data: childData } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (childData) setChild(childData as Child);

      // Fetch leaderboard from API
      try {
        const res = await fetch(`/api/leaderboard?child=${childId}`);
        const json = await res.json();
        if (json.leaders) setLeaders(json.leaders);
        if (json.myRank) setMyRank(json.myRank);
      } catch (e) {
        console.error("Failed to load leaderboard:", e);
      }

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

      {/* Own streak display */}
      <div className="text-center animate-slideUp">
        <Flame className={`w-16 h-16 text-orange-500 mx-auto mb-3 ${child.streak_days > 0 ? "animate-streakPulse" : ""}`} strokeWidth={1.5} />
        <div className="text-4xl font-bold text-zinc-900">
          {child.streak_days} day{child.streak_days !== 1 ? "s" : ""}
        </div>
        <p className="text-zinc-500 mt-1">{child.first_name}&apos;s streak</p>
        {myRank && (
          <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200">
            <span className="text-sm font-bold text-orange-700">Rank #{myRank}</span>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      {leaders.length > 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden dash-slide-up-1">
          <div className="p-4 border-b border-zinc-100">
            <h2 className="text-base font-bold text-zinc-900">Streak Leaderboard</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Top readers by streak</p>
          </div>
          <div className="divide-y divide-zinc-100">
            {leaders.map((entry, i) => {
              const isMe = entry.id === child.id;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                    isMe ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="w-8 text-center flex-shrink-0">
                    {i < 3 ? (
                      <span>{RANK_ICONS[i]}</span>
                    ) : (
                      <span className="text-sm font-bold text-zinc-400">#{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${isMe ? "text-indigo-700 font-bold" : "text-zinc-700"}`}>
                      {entry.first_name}
                      {isMe && <span className="text-xs text-indigo-500 ml-1">(You)</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Flame className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
                    <span className={`text-sm font-bold ${isMe ? "text-indigo-700" : "text-zinc-900"}`}>
                      {entry.streak_days}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dash-slide-up-1">
          <Sprout className="w-10 h-10 text-emerald-500 mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="font-bold text-zinc-900">No streaks yet!</h3>
          <p className="text-sm text-zinc-500 mt-1">
            Start your streak today by completing a lesson!
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-bold hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm"
          >
            Start Learning
          </Link>
        </div>
      )}
    </div>
  );
}
