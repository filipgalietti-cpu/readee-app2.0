"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Lock, ArrowRight } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { getWeakSpots, type WeakSpot } from "@/lib/adaptive/weak-spots";
import { findStandardById } from "@/lib/data/all-standards";

/**
 * Sharpen Up — premium adaptive review tile.
 *
 * Reads the kid's worst standards over the last 30 days (per-question
 * data from `practice_answers`) and surfaces a one-tap "go practice
 * your tricky spots" CTA. For free users we still show the tile but
 * route through /upgrade — premium drives the kid into a targeted
 * practice session for the standard with the lowest accuracy.
 *
 * Hides itself when:
 *  - premium kid has no weak spots yet (don't show an empty grey card —
 *    see feedback_no_empty_grey_boxes memory)
 *  - free kid has no signal AND no weak spots — wait until they have
 *    practice data before pitching the upgrade
 */
export default function SharpenUpCard({
  childId,
  userPlan,
}: {
  childId: string;
  userPlan: "free" | "premium" | string;
}) {
  const [weakSpots, setWeakSpots] = useState<WeakSpot[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = supabaseBrowser();
      const spots = await getWeakSpots(supabase, childId, {
        windowDays: 30,
        minAttempts: 5,
        minMissRate: 0.3,
        limit: 5,
      });
      if (cancelled) return;
      setWeakSpots(spots);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [childId]);

  // Hide the tile entirely when there's nothing useful to show.
  if (loading) return null;
  if (!weakSpots || weakSpots.length === 0) return null;

  const top = weakSpots[0];
  const standard = findStandardById(top.standard_id);
  const standardLabel = standard?.standard_description ?? top.standard_id;
  const isPremium = userPlan === "premium";

  // Where the CTA points — premium kids head to /review (which hosts
  // the multi-section Sharpen Up surface alongside the existing SRS
  // queue, so they can pick which weak spot to drill). Free kids hit
  // the upgrade page with a contextual reason that the /upgrade hero
  // copy can speak to.
  const href = isPremium
    ? `/review?child=${childId}`
    : `/upgrade?reason=sharpen`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm dark:border-violet-900/40 dark:from-violet-950/30 dark:to-slate-900"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          <Brain className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Sharpen Up
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
              {isPremium ? "Premium" : <><Lock className="h-2.5 w-2.5" strokeWidth={2.4} /> Premium</>}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-slate-400">
            {isPremium ? (
              <>
                Your tricky spot right now: <span className="font-bold text-zinc-900 dark:text-white">{standardLabel}</span>.
                {" "}
                {weakSpots.length === 1
                  ? "5 quick questions to nail it down."
                  : `5 questions from your top ${Math.min(weakSpots.length, 3)} tricky spots.`}
              </>
            ) : (
              <>
                We&apos;ve been watching where {standardLabel.toLowerCase().includes("read") ? "" : ""}you trip up.
                {" "}
                <span className="font-bold text-zinc-900 dark:text-white">Readee+ rebuilds a session from your tricky spots.</span>
              </>
            )}
          </p>

          {/* Mini weak-spot strip — visualizes the miss-rate spread on
              the top 3 standards so parents see the why behind the
              recommendation. */}
          {isPremium && weakSpots.length > 0 && (
            <div className="mt-4 flex gap-2">
              {weakSpots.slice(0, 3).map((spot) => {
                const s = findStandardById(spot.standard_id);
                const pct = Math.round(spot.miss_rate * 100);
                return (
                  <div
                    key={spot.standard_id}
                    className="flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2 dark:border-violet-900/40 dark:bg-slate-800"
                  >
                    <div className="font-mono text-[10px] font-bold text-violet-700 dark:text-violet-300">
                      {s?.standard_id ?? spot.standard_id}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                      {pct}% missed
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            href={href}
            className={`mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-extrabold transition active:scale-[0.97] ${
              isPremium
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
            }`}
          >
            {isPremium ? "Start review session" : "Unlock Sharpen Up"}
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
