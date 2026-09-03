"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Read a child's lifetime carrots — the monotonic "ever earned" total that
 * drives the reader-level ladder.
 *
 * This used to SUM every `practice_results.carrots_earned` row. That was wrong
 * twice over. Correctness: only lessons, practice and stories write that table,
 * so Luna, journey chests and the mystery box never levelled anyone up (one
 * child sat on a 20,365 balance with a 935 ladder total). Cost: it fetched
 * every row and summed in JS, which is fine at 22 rows and not fine in the
 * sidebar, where it would run on every navigation forever.
 *
 * Now it reads `children.lifetime_carrots` (migration 134), which every award
 * path increments through `awardCarrots()`. One indexed row, no aggregation.
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
        .from("children")
        .select("lifetime_carrots")
        .eq("id", childId)
        .maybeSingle();
      if (!alive) return;
      setLifetimeCarrots(error || !data ? 0 : (data as { lifetime_carrots: number | null }).lifetime_carrots ?? 0);
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
