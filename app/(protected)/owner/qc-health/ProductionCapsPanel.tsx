"use client";

import { useState, useTransition } from "react";
import { TrendingUp, TrendingDown, Lock, Bot, Hand, Play } from "lucide-react";
import {
  applySuggestedCapAction,
  toggleAutoApplyAction,
  runAdaptiveReviewNowAction,
} from "./actions";

type Row = {
  content_type: string;
  daily_target: number;
  daily_max: number;
  auto_apply: boolean;
  suggested_target: number | null;
  suggested_reason: string | null;
  suggested_at: string | null;
};

export default function ProductionCapsPanel({ rows }: { rows: Row[] }) {
  const [busy, startTransition] = useTransition();
  const [reviewing, startReview] = useTransition();
  const [lastReview, setLastReview] = useState<string | null>(null);

  function apply(contentType: string, target: number) {
    startTransition(async () => {
      const r = await applySuggestedCapAction({ contentType, target });
      if (!r.ok) alert(r.error);
    });
  }

  function toggleAuto(contentType: string, next: boolean) {
    startTransition(async () => {
      const r = await toggleAutoApplyAction({ contentType, autoApply: next });
      if (!r.ok) alert(r.error);
    });
  }

  function runNow() {
    startReview(async () => {
      const r = await runAdaptiveReviewNowAction();
      if (r.ok) setLastReview(`Reviewed ${r.reviewed} content types.`);
      else alert(r.error);
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-zinc-400" />
          <h2 className="text-sm font-bold text-zinc-900">Production caps</h2>
        </div>
        <button
          onClick={runNow}
          disabled={reviewing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
        >
          <Play className="h-3 w-3" />
          {reviewing ? "Reviewing…" : "Run review now"}
        </button>
      </div>
      {lastReview && (
        <p className="text-xs font-semibold text-emerald-700">{lastReview}</p>
      )}
      <p className="text-xs text-zinc-500">
        Daily target adjusts adaptively from QC health. 7d green → +1, 14d
        green → 2×, yellow → −1, quarantine → freeze. Auto-apply OFF means
        you click to approve each change.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500">
              <th className="pb-2 pr-2 font-semibold">Content type</th>
              <th className="pb-2 px-2 font-semibold text-right">Today</th>
              <th className="pb-2 px-2 font-semibold text-right">Max</th>
              <th className="pb-2 px-2 font-semibold">Suggestion</th>
              <th className="pb-2 px-2 font-semibold text-right">Auto-apply</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const hasSuggestion =
                r.suggested_target !== null &&
                r.suggested_target !== r.daily_target;
              const direction =
                r.suggested_target !== null
                  ? r.suggested_target > r.daily_target
                    ? "up"
                    : r.suggested_target < r.daily_target
                      ? "down"
                      : "same"
                  : "same";
              return (
                <tr
                  key={r.content_type}
                  className="border-b border-zinc-50 last:border-0"
                >
                  <td className="py-2 pr-2 font-mono text-xs text-zinc-700">
                    {r.content_type}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold">
                    {r.daily_target}
                    <span className="ml-1 text-zinc-400 text-xs">/day</span>
                  </td>
                  <td className="py-2 px-2 text-right text-zinc-500">
                    {r.daily_max}
                  </td>
                  <td className="py-2 px-2">
                    {hasSuggestion ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold ring-1 ${
                            direction === "up"
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                              : "bg-amber-50 text-amber-800 ring-amber-200"
                          }`}
                        >
                          {direction === "up" ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {r.daily_target} → {r.suggested_target}
                        </span>
                        <button
                          onClick={() =>
                            apply(r.content_type, r.suggested_target as number)
                          }
                          disabled={busy}
                          className="rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                          Apply
                        </button>
                        {r.suggested_reason && (
                          <span className="block w-full text-[11px] text-zinc-500">
                            {r.suggested_reason}
                          </span>
                        )}
                      </div>
                    ) : r.daily_target >= r.daily_max ? (
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                        <Lock className="h-3 w-3" />
                        At ceiling — bump max to keep ramping
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">
                        {r.suggested_reason ?? "Holding steady."}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <button
                      onClick={() => toggleAuto(r.content_type, !r.auto_apply)}
                      disabled={busy}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 transition ${
                        r.auto_apply
                          ? "bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100"
                          : "bg-zinc-50 text-zinc-600 ring-zinc-200 hover:bg-zinc-100"
                      }`}
                      title={
                        r.auto_apply
                          ? "Nightly review applies the suggestion automatically. Click to switch back to manual."
                          : "Nightly review surfaces a suggestion; click Apply manually. Click to opt in to auto-apply."
                      }
                    >
                      {r.auto_apply ? (
                        <>
                          <Bot className="h-3 w-3" /> Auto
                        </>
                      ) : (
                        <>
                          <Hand className="h-3 w-3" /> Manual
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
