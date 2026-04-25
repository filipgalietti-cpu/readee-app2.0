"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import TopUpCreditsButton from "@/app/_components/TopUpCreditsButton";

type Budget = {
  monthly: {
    used: number;
    limit: number;
    remaining: number;
    entitlement?: number;
    topUpBalance?: number;
  };
};

/**
 * Compact credit balance + top-up entry point that lives in the
 * teacher sidebar. Re-fetches on mount + every 60 seconds so a
 * recent build / purchase reflects without a full reload.
 */
export default function TeacherCreditWidget() {
  const [data, setData] = useState<Budget | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch("/api/classroom/ai-budget", { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as Budget;
        if (!cancelled) setData(j);
      } catch {
        /* silent */
      }
    }
    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (!data) {
    return (
      <div className="mx-3 my-2 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
          <Sparkles className="h-3 w-3" />
          Readee.ai credits
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800" />
        <div className="mt-1.5 text-[11px] text-zinc-400">Loading…</div>
      </div>
    );
  }

  const { used, limit, remaining, entitlement, topUpBalance } = data.monthly;
  const pct = limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isLow = remaining < (entitlement ?? limit) * 0.2;
  const hasTopUp = (topUpBalance ?? 0) > 0;

  return (
    <div className="mx-3 my-2 rounded-2xl border border-zinc-200 bg-white p-3 transition hover:border-violet-200 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
          <Sparkles className="h-3 w-3" />
          Readee.ai credits
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-extrabold text-zinc-900 dark:text-white">
            {remaining}
            <span className="ml-0.5 text-[11px] font-semibold text-zinc-400">
              /{limit}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${
            isLow
              ? "bg-amber-500"
              : "bg-gradient-to-r from-indigo-500 to-violet-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <div className="text-zinc-500 dark:text-slate-400">
          {hasTopUp ? (
            <>
              {entitlement} monthly + <span className="font-bold text-violet-600 dark:text-violet-300">{topUpBalance}</span> top-up
            </>
          ) : isLow ? (
            <span className="font-semibold text-amber-700 dark:text-amber-400">Running low</span>
          ) : (
            <>{used} used this month</>
          )}
        </div>
        <TopUpCreditsButton pool="teacher" label="Top up" variant="secondary" />
      </div>
    </div>
  );
}
