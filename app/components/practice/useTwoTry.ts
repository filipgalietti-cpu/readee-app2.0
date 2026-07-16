"use client";

import { useCallback, useState } from "react";

/**
 * Shared 2-try mechanic for the interactive question widgets (SentenceBuild,
 * SpaceInsertion, CategorySort, SoundMachine, MissingWord) so they behave like
 * the MCQ 2-try: a first wrong answer gives a "try again" nudge and stays in
 * play; the second attempt (or any correct one) resolves. Only a first-try
 * correct answer earns credit — mirrors `handleMcqPick`.
 *
 * `twoTries` gates the retry: false (assessment / lesson contexts) keeps the
 * old single-attempt behavior, so callers that don't opt in are unchanged.
 */
export function useTwoTry(twoTries: boolean) {
  const [tries, setTries] = useState(0);
  const [nudge, setNudge] = useState<string | null>(null);

  /**
   * Feed the raw correctness of an attempt. Returns whether the widget should
   * now RESOLVE (call onAnswer) and, if so, whether it counts as a first try.
   * When it returns `resolve: false`, the widget should shake + let the kid
   * fix their answer and check again — the nudge is already set.
   */
  const attempt = useCallback(
    (isCorrect: boolean, nudgeMsg?: string): { resolve: boolean; firstTry: boolean } => {
      if (isCorrect) return { resolve: true, firstTry: tries === 0 };
      if (twoTries && tries === 0) {
        setTries(1);
        setNudge(nudgeMsg || "Not quite — take another look and try again!");
        return { resolve: false, firstTry: false };
      }
      return { resolve: true, firstTry: false };
    },
    [tries, twoTries],
  );

  const clearNudge = useCallback(() => setNudge(null), []);

  return { tries, nudge, attempt, clearNudge };
}
