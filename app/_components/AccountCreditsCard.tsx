"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import TopUpCreditsButton from "@/app/_components/TopUpCreditsButton";
import { CREDIT_COST } from "@/lib/ai/credits";

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
 * Full credit balance + breakdown card for the /account page.
 * Replaces the old sidebar widget — teachers now manage credits in
 * settings, not from the top of every page.
 */
export default function AccountCreditsCard() {
  const [data, setData] = useState<Budget | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch("/api/classroom/ai-budget", { cache: "no-store" });
        if (!r.ok) {
          if (!cancelled) setErr("Couldn't load your credit balance.");
          return;
        }
        const j = (await r.json()) as Budget;
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setErr("Couldn't load your credit balance.");
      }
    }
    load();
  }, []);

  return (
    <section
      id="credits"
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm scroll-mt-20"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-violet-500" strokeWidth={1.5} />
        <h2 className="text-base font-semibold text-zinc-900">
          Readee.ai credits
        </h2>
      </div>

      {err ? (
        <p className="text-sm text-red-600">{err}</p>
      ) : !data ? (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading balance…
        </div>
      ) : (
        <CreditDetail data={data.monthly} />
      )}

      <div className="mt-5 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-500">
        <p className="font-semibold text-zinc-700 mb-1">How credits cost</p>
        <ul className="space-y-0.5">
          <li>· Quiz / passage generation: {CREDIT_COST.quiz_generation} credit</li>
          <li>· Audio (per voiceover): {CREDIT_COST.tts_generation} credits</li>
          <li>· Image generation: {CREDIT_COST.image_generation} credits</li>
        </ul>
        <p className="mt-2">
          Credits reset on the 1st of every month. Top-ups never expire.
        </p>
      </div>
    </section>
  );
}

function CreditDetail({ data }: { data: Budget["monthly"] }) {
  const { used, limit, remaining, entitlement, topUpBalance } = data;
  const pct = limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isLow = remaining < (entitlement ?? limit) * 0.2;
  const hasTopUp = (topUpBalance ?? 0) > 0;

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-extrabold text-zinc-900">
            {remaining}
            <span className="ml-1 text-base font-semibold text-zinc-400">
              / {limit}
            </span>
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            credits remaining this month
          </div>
        </div>
        <TopUpCreditsButton pool="teacher" label="Buy more credits" />
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full transition-all ${
            isLow
              ? "bg-amber-500"
              : "bg-gradient-to-r from-indigo-500 to-violet-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Stat label="Used" value={used} tone="zinc" />
        <Stat
          label="Monthly"
          value={entitlement ?? limit}
          tone="indigo"
        />
        <Stat
          label="Top-up"
          value={topUpBalance ?? 0}
          tone={hasTopUp ? "violet" : "zinc"}
        />
      </div>

      {isLow && (
        <p className="mt-3 text-xs font-semibold text-amber-700">
          You're running low. Buy more to keep building this month.
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "zinc" | "indigo" | "violet";
}) {
  const colorMap = {
    zinc: "text-zinc-700",
    indigo: "text-indigo-700",
    violet: "text-violet-700",
  } as const;
  return (
    <div className="rounded-lg bg-zinc-50 p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </div>
      <div className={`text-base font-bold ${colorMap[tone]}`}>{value}</div>
    </div>
  );
}
