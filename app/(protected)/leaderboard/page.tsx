"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { Crown, Medal, Carrot, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { SkeletonPage } from "@/app/_components/Skeleton";
import { EmptyState } from "@/app/_components/EmptyState";

interface LeaderEntry {
  id: string;
  name: string;
  carrots: number;
  isMe: boolean;
}

const RANK_ICONS: ReactNode[] = [
  <Crown key="1st" className="w-5 h-5 text-amber-500" strokeWidth={1.75} />,
  <Medal key="2nd" className="w-5 h-5 text-zinc-400" strokeWidth={1.75} />,
  <Medal key="3rd" className="w-5 h-5 text-amber-600" strokeWidth={1.75} />,
];

/** "K" → "Kindergarten", "2nd" → "Grade 2". */
function gradeLabel(grade: string | null | undefined): string {
  if (!grade) return "your grade";
  if (grade.toUpperCase() === "K") return "Kindergarten";
  const n = grade.replace(/\D/g, "");
  return n ? `Grade ${n}` : grade;
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<SkeletonPage cards={4} />}>
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
  const [loadError, setLoadError] = useState<string | null>(null);

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

      try {
        const res = await fetch(`/api/leaderboard?child=${childId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.leaders) setLeaders(json.leaders);
        if (json.myRank) setMyRank(json.myRank);
      } catch (e) {
        console.error("Failed to load leaderboard:", e);
        setLoadError(
          "We couldn't reach the leaderboard. Check your connection and try again.",
        );
      }

      setLoading(false);
    }
    load();
  }, [childId]);

  if (loading || !child) {
    return <SkeletonPage cards={4} />;
  }

  const cohort = gradeLabel(child.grade);
  const ahead = myRank && myRank > 1 ? leaders[myRank - 2] : null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 pb-16">
      {/* Rank hero */}
      <div className="text-center animate-slideUp">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/25">
          <Trophy className="h-8 w-8 text-white" strokeWidth={1.75} />
        </div>
        {myRank ? (
          <>
            <div className="text-4xl font-bold text-zinc-900 dark:text-white">
              #{myRank}
            </div>
            <p className="mt-1 text-zinc-500 dark:text-slate-400">
              {child.first_name} in the {cohort} race
            </p>
          </>
        ) : (
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {cohort} race
          </div>
        )}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 dark:border-orange-500/30 dark:bg-orange-500/10">
          <Carrot className="h-4 w-4 text-orange-500" strokeWidth={1.75} />
          <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
            {child.carrots.toLocaleString()} carrots
          </span>
        </div>
        {ahead && (
          <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
            {(ahead.carrots - child.carrots).toLocaleString()} carrots to pass{" "}
            <span className="font-semibold text-zinc-700 dark:text-slate-200">
              {ahead.name}
            </span>
          </p>
        )}
      </div>

      {loadError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {loadError}
        </div>
      )}

      {/* Board */}
      {leaders.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
          <div className="border-b border-zinc-100 p-4 dark:border-slate-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              {cohort} leaderboard
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-slate-500">
              Top readers by carrots earned
            </p>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-slate-800">
            {leaders.map((entry, i) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                  entry.isMe
                    ? "bg-indigo-50 dark:bg-indigo-500/10"
                    : ""
                }`}
              >
                <div className="w-8 flex-shrink-0 text-center">
                  {i < 3 ? (
                    <span className="inline-flex">{RANK_ICONS[i]}</span>
                  ) : (
                    <span className="text-sm font-bold text-zinc-400 dark:text-slate-500">
                      #{i + 1}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-sm font-medium ${
                      entry.isMe
                        ? "font-bold text-indigo-700 dark:text-indigo-300"
                        : "text-zinc-700 dark:text-slate-200"
                    }`}
                  >
                    {entry.name}
                    {entry.isMe && (
                      <span className="ml-1 text-xs text-indigo-500 dark:text-indigo-400">
                        (You)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  <Carrot className="h-4 w-4 text-orange-500" strokeWidth={1.75} />
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      entry.isMe
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-zinc-900 dark:text-white"
                    }`}
                  >
                    {entry.carrots.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          mascot="cheer"
          title="Start earning carrots!"
          description="Finish a lesson to put yourself on the board and start climbing the ranks."
          action={{ href: "/dashboard", label: "Start learning" }}
        />
      )}
    </div>
  );
}
