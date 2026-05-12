"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Sum every `practice_results.carrots_earned` row for a child to get
 * the lifetime total. Used to drive the reader-level ladder.
 *
 * Why a SUM and not a column? `children.carrots` is the spendable
 * balance — buying a shop background reduces it, which would
 * de-level the kid mid-session. We need a monotonically-increasing
 * series, and the cheapest source is the practice_results audit
 * trail we already write to on every win.
 *
 * Cheap query — even a heavy user finishes ~hundreds of rows over a
 * year, and Supabase aggregates on the indexed child_id.
 */
export function useLifetimeCarrots(childId: string | null | undefined): {
  lifetimeCarrots: number;
  loading: boolean;
  /** Bump after a fresh completion so the badge updates immediately. */
  refresh: () => void;
} {
  const [lifetimeCarrots, setLifetimeCarrots] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!childId) {
      setLifetimeCarrots(0);
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase
        .from("practice_results")
        .select("carrots_earned")
        .eq("child_id", childId);
      if (!alive) return;
      if (error || !data) {
        setLifetimeCarrots(0);
      } else {
        let total = 0;
        for (const row of data as { carrots_earned: number | null }[]) {
          total += row.carrots_earned ?? 0;
        }
        setLifetimeCarrots(total);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [childId, tick]);

  return {
    lifetimeCarrots,
    loading,
    refresh: () => setTick((t) => t + 1),
  };
}
