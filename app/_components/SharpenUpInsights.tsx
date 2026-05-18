"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, Target, Lock, ArrowRight, Sparkles } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  getWeakSpots,
  getWeakTypes,
  questionTypeLabel,
  type WeakSpot,
  type WeakType,
} from "@/lib/adaptive/weak-spots";
import { findStandardById } from "@/lib/data/all-standards";

/**
 * Sharpen Up insights — accuracy-based weak-spot view, mounted as a
 * secondary section on /review under the existing SRS due-queue.
 *
 * Sibling to the SRS system (which already drives the primary /review
 * surface). SRS asks "what's time-due for review?" — this asks "what's
 * been getting wrong recently?". Same goal, different signal.
 *
 * Premium-gated:
 *  - Free + no signal → tile hides
 *  - Free + has signal → upgrade pitch
 *  - Premium + no signal → tile hides
 *  - Premium + has signal → tap-to-drill standard tiles + type breakdown
 */
export default function SharpenUpInsights({
  childId,
  userPlan,
}: {
  childId: string;
  userPlan: "free" | "premium" | string;
}) {
  const [weakSpots, setWeakSpots] = useState<WeakSpot[] | null>(null);
  const [weakTypes, setWeakTypes] = useState<WeakType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const isPremium = userPlan === "premium";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = supabaseBrowser();
      const [spots, types] = await Promise.all([
        getWeakSpots(supabase, childId, {
          windowDays: 30,
          minAttempts: 5,
          minMissRate: 0.3,
          limit: 6,
        }),
        getWeakTypes(supabase, childId, {
          windowDays: 30,
          minAttempts: 10,
          minMissRate: 0.3,
          limit: 4,
        }),
      ]);
      if (cancelled) return;
      setWeakSpots(spots);
      setWeakTypes(types);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [childId]);

  if (loading) return null;
  const hasSignal = (weakSpots?.length ?? 0) > 0 || (weakTypes?.length ?? 0) > 0;
  if (!hasSignal) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-600" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-700">
          Sharpen Up{!isPremium && " · Premium"}
        </span>
      </div>
      <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {isPremium ? "Where you've been slipping up" : "Personalized review is a Readee+ feature"}
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
        {isPremium
          ? "Standards + question styles you've missed most over the last 30 days. Different from the SRS queue above — that's time-based, this is accuracy-based."
          : "We've been tracking what trips up your kid. Unlock Readee+ to surface targeted review based on real accuracy data."}
      </p>

      {!isPremium ? (
        <Paywall />
      ) : (
        <>
          {/* Hero CTA — one-tap multi-standard review session. Routes to
              /practice?mode=sharpen which composes a 6-9 question deck
              across the kid's top 3 weak standards. Shown only when
              there are enough weak spots to compose a meaningful deck. */}
          {weakSpots && weakSpots.length >= 2 && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-violet-100 to-violet-50 p-5">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-zinc-900">
                  One Sharpen Up session
                </div>
                <div className="mt-0.5 text-xs text-zinc-600">
                  9 questions mixed across your top {Math.min(weakSpots.length, 3)} tricky spots — start here.
                </div>
              </div>
              <Link
                href={`/practice?child=${childId}&mode=sharpen`}
                className="inline-flex flex-shrink-0 items-center gap-1 rounded-xl bg-violet-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-violet-700 active:scale-[0.97]"
              >
                Start
                <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
              </Link>
            </div>
          )}

          {weakSpots && weakSpots.length > 0 && (
            <WeakStandardsGrid childId={childId} weakSpots={weakSpots} />
          )}
          {weakTypes && weakTypes.length > 0 && (
            <WeakTypesGrid weakTypes={weakTypes} />
          )}
        </>
      )}
    </section>
  );
}

function Paywall() {
  return (
    <div className="mt-5 flex items-center gap-4 rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-white p-5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
        <Lock className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-zinc-900">
          Unlock targeted review
        </div>
        <div className="mt-0.5 text-xs text-zinc-600">
          See exactly which standards + question types trip them up, and drill
          straight into them.
        </div>
      </div>
      <Link
        href="/upgrade?reason=sharpen"
        className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-extrabold text-white transition hover:from-amber-600 hover:to-orange-600 active:scale-[0.97]"
      >
        Unlock
        <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
      </Link>
    </div>
  );
}

function WeakStandardsGrid({
  childId,
  weakSpots,
}: {
  childId: string;
  weakSpots: WeakSpot[];
}) {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
        <Brain className="h-3 w-3" /> By skill
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {weakSpots.map((spot, idx) => {
          const standard = findStandardById(spot.standard_id);
          const label = standard?.standard_description ?? spot.standard_id;
          const pct = Math.round(spot.miss_rate * 100);
          const isTop = idx === 0;
          return (
            <Link
              key={spot.standard_id}
              href={`/practice?child=${childId}&standard=${spot.standard_id}&source=sharpen`}
              className={`group flex flex-col rounded-2xl border-2 p-4 transition hover:-translate-y-1 hover:shadow-md ${
                isTop
                  ? "border-violet-300 bg-violet-50"
                  : "border-zinc-200 bg-white hover:border-violet-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-violet-700">
                  {spot.standard_id}
                </span>
                {isTop && (
                  <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                    Top spot
                  </span>
                )}
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
                {label}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <MissRateBar missRate={spot.miss_rate} />
                <span className="text-xs font-bold text-zinc-600">
                  {pct}%
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  {spot.attempts} answered · {spot.correct} right
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 group-hover:text-violet-900">
                  Practice 5
                  <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function WeakTypesGrid({ weakTypes }: { weakTypes: WeakType[] }) {
  return (
    <div className="mt-7">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
        <Target className="h-3 w-3" /> By question style
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {weakTypes.map((t) => {
          const pct = Math.round(t.miss_rate * 100);
          return (
            <div
              key={t.type}
              className="flex items-center gap-3 rounded-xl border-2 border-amber-200 bg-amber-50/40 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-zinc-900">
                  {questionTypeLabel(t.type)}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <MissRateBar missRate={t.miss_rate} accent="amber" />
                  <span className="text-xs font-bold text-zinc-600">{pct}%</span>
                </div>
                <div className="mt-0.5 text-[11px] text-zinc-500">
                  {t.attempts} attempts · {t.correct} right
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">
        Insight only — to drill a specific style, pick a standard above that
        uses it.
      </p>
    </div>
  );
}

function MissRateBar({
  missRate,
  accent = "violet",
}: {
  missRate: number;
  accent?: "violet" | "amber";
}) {
  const pct = Math.max(0, Math.min(100, Math.round(missRate * 100)));
  const fill = accent === "amber" ? "bg-amber-500" : "bg-violet-500";
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
      <div className={`h-full ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
