/**
 * Adaptive engine — Phase 1 DECIDE layer (React binding).
 *
 * useAdaptiveController wraps the pure classifier (controller.ts) for use in
 * the lesson/practice runtimes. It:
 *   1. Seeds a cold-start read from the child's SM-2 mastery for the current
 *      standard (child_skill_memory), so the engine isn't blind on question 1.
 *   2. Accepts live events via observe() and keeps a rolling window in a ref
 *      (no re-render per keystroke; state updates only when the reading does).
 *   3. Exposes the current reading (state + directive + throttle) for a future
 *      ACT layer (Phase 2) and a dev readout to consume.
 *
 * It performs NO actions and writes NOTHING — it only decides. Wiring
 * observe() into the answer funnels is read-only and changes nothing a child
 * sees; the engine is a brain with no hands until Phase 2.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  classifyState,
  WINDOW,
  type AdaptiveEventLite,
  type AdaptiveReading,
  type MasterySeed,
} from "./controller";

export interface UseAdaptiveControllerArgs {
  childId?: string | null;
  standardId?: string | null;
}

export interface AdaptiveController {
  reading: AdaptiveReading;
  /** Feed one graded interaction. Call from an answer funnel (read-only). */
  observe: (ev: AdaptiveEventLite) => void;
  /** Clear the window (e.g. when moving to a new standard). */
  reset: () => void;
}

export function useAdaptiveController({
  childId,
  standardId,
}: UseAdaptiveControllerArgs): AdaptiveController {
  const eventsRef = useRef<AdaptiveEventLite[]>([]);
  const seedRef = useRef<MasterySeed | undefined>(undefined);
  const [reading, setReading] = useState<AdaptiveReading>(() =>
    classifyState([], undefined),
  );

  // Seed the cold-start read from prior mastery for this standard.
  useEffect(() => {
    let cancelled = false;
    if (!childId || !standardId) {
      seedRef.current = undefined;
      return;
    }
    (async () => {
      try {
        const supabase = supabaseBrowser();
        const { data } = await supabase
          .from("child_skill_memory")
          .select("consecutive_correct, ease_factor, total_attempted, total_correct")
          .eq("child_id", childId)
          .eq("standard_id", standardId)
          .maybeSingle();
        if (cancelled) return;
        const seed: MasterySeed | undefined = data
          ? {
              consecutiveCorrect: data.consecutive_correct ?? undefined,
              easeFactor: data.ease_factor ?? undefined,
              totalAttempted: data.total_attempted ?? undefined,
              totalCorrect: data.total_correct ?? undefined,
            }
          : undefined;
        seedRef.current = seed;
        // Refresh the cold-start reading with the seed if no events yet.
        if (eventsRef.current.length === 0) {
          setReading(classifyState([], seed));
        }
      } catch {
        // best-effort: a missing seed just means we start neutral.
        seedRef.current = undefined;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [childId, standardId]);

  const observe = useCallback((ev: AdaptiveEventLite) => {
    // Keep a little more than one window so trailing-streak math is stable.
    const next = [...eventsRef.current, ev].slice(-(WINDOW * 2));
    eventsRef.current = next;
    setReading(classifyState(next, seedRef.current));
  }, []);

  const reset = useCallback(() => {
    eventsRef.current = [];
    setReading(classifyState([], seedRef.current));
  }, []);

  return { reading, observe, reset };
}
