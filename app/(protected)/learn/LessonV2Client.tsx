"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Child } from "@/lib/db/types";
import type { LessonDef, LearningEvent } from "@/lib/lesson-engine/types";
import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { recordLessonCompletion } from "@/lib/lessons/record-completion";
import { getDailyMultiplier, getSessionStreakTier } from "@/lib/carrots/multipliers";
import { finalizeSessionCarrots } from "@/lib/carrots/finalize-session";
import { getActiveMultiplier } from "@/lib/carrots/active-multiplier";

/**
 * The V2 lesson engine, wired to a real child.
 *
 * LessonRunner draws scenes and reports events; it deliberately knows nothing
 * about children, carrots or Supabase. This component is the join: it loads the
 * reader, tallies the event stream into a score, and hands a finish to
 * lib/lessons/record-completion, which owns what a finish means.
 *
 * The lesson arrives as a PROP from the server page, never by importing the
 * registry. Importing it here would pull all 184 authored lessons - 7.9 MB - into
 * the browser to render one (see lib/lessons/v2-lookup).
 *
 * Carrots mirror the legacy runner exactly, because a child should not earn a
 * different amount for the same work depending on which engine happens to teach
 * their standard: 5 per correct answer, times the daily streak multiplier, times
 * the session streak tier, then any active mystery-box boost applied at the end.
 */

const CARROTS_PER_CORRECT = 5;

export default function LessonV2Client({ lesson }: { lesson: LessonDef }) {
  const params = useSearchParams();
  const childId = params.get("child");

  const [child, setChild] = useState<Child | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  // Scored from the event stream rather than component state, so a re-render
  // can never double-count an answer.
  const tally = useRef({ attempted: 0, correct: 0, carrots: 0, streak: 0 });

  useEffect(() => {
    if (!childId) {
      setError("We couldn't tell which reader this is. Pick again from the dashboard.");
      return;
    }
    let cancelled = false;
    (async () => {
      const supabase = supabaseBrowser();
      const { data, error: fetchError } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();
      if (cancelled) return;
      if (fetchError || !data) {
        setError("We couldn't open this reader's profile. Pick again from the dashboard.");
        return;
      }
      setChild(data as Child);
    })();
    return () => {
      cancelled = true;
    };
  }, [childId]);

  const onEvent = useCallback(
    (e: LearningEvent) => {
      // Info scenes report no correctness - they are teaching, not testing, and
      // counting them would inflate the score toward the >= 3 completion bar.
      if (typeof e.correct !== "boolean") return;
      const t = tally.current;
      t.attempted += 1;
      if (!e.correct) {
        t.streak = 0;
        return;
      }
      t.correct += 1;
      t.streak += 1;
      const daily = getDailyMultiplier(child?.streak_days ?? 0);
      const session = getSessionStreakTier(t.streak);
      t.carrots += Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier);
    },
    [child?.streak_days],
  );

  const onComplete = useCallback(async () => {
    if (!child) return;
    const t = tally.current;
    const settled = finalizeSessionCarrots(t.carrots, child);
    const { saved } = await recordLessonCompletion(supabaseBrowser(), {
      childId: child.id,
      standardId: lesson.standard,
      attempted: t.attempted,
      correct: t.correct,
      carrots: settled.final,
      boost: getActiveMultiplier(child),
    });
    if (!saved) setSaveFailed(true);
  }, [child, lesson.standard]);

  if (error) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-6">
        <p className="max-w-sm text-center text-lg text-zinc-600">{error}</p>
      </div>
    );
  }

  // Wait for the child before mounting the runner. Starting the lesson first
  // would let a child finish scenes we cannot attribute to anyone.
  if (!child) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-500" />
      </div>
    );
  }

  return (
    <>
      <LessonRunner lesson={lesson} onEvent={onEvent} onComplete={onComplete} />
      {saveFailed && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800">
          We could not save this lesson. Your reader keeps their carrots on screen, but this finish was not recorded.
        </div>
      )}
    </>
  );
}
