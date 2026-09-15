"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export const ANSWER_SELECTION_HOLD_MS = 1100;
export const SLIDE_FADE_MS = 240;
/** One cancellable exit per slide; changing content happens only after the fade. */
export function useSlideTransition<T extends unknown[]>(scope: string, commit: (...args: T) => void) {
  const [leaving, setLeaving] = useState(false);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(commit);
  useEffect(() => { latest.current = commit; }, [commit]);
  const cancel = useCallback(() => {
    if (pending.current !== null) clearTimeout(pending.current);
    pending.current = null;
    setLeaving(false);
  }, []);
  useEffect(() => { return cancel; }, [scope, cancel]);
  const advance = useCallback((...args: T) => {
    if (pending.current !== null) return;
    setLeaving(true);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : SLIDE_FADE_MS;
    pending.current = setTimeout(() => {
      pending.current = null;
      latest.current(...args);
      setLeaving(false);
    }, delay);
  }, []);
  return { leaving, advance, cancel };
}
