"use client";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export type CameraMode = "reveal" | "follow" | "settled" | "manual";

/** The only writer of the map viewport's horizontal position. Never changes keyboard focus. */
export function useJourneyCamera(
  viewport: RefObject<HTMLDivElement | null>,
  reduced: boolean,
  onInterrupt: () => void,
) {
  const [mode, setMode] = useState<CameraMode>("settled");
  const manual = useRef(false);
  const frame = useRef(0);
  const interruptCallback = useRef(onInterrupt);
  useEffect(() => {
    interruptCallback.current = onInterrupt;
  }, [onInterrupt]);
  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
  }, []);
  const interrupt = useCallback(() => {
    manual.current = true;
    stop();
    setMode("manual");
    interruptCallback.current();
  }, [stop]);
  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const key = (event: KeyboardEvent) => {
      if (
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Tab"].includes(
          event.key,
        )
      )
        interrupt();
    };
    node.addEventListener("wheel", interrupt, { passive: true });
    node.addEventListener("touchstart", interrupt, { passive: true });
    node.addEventListener("pointerdown", interrupt, { passive: true });
    node.addEventListener("keydown", key);
    return () => {
      stop();
      node.removeEventListener("wheel", interrupt);
      node.removeEventListener("touchstart", interrupt);
      node.removeEventListener("pointerdown", interrupt);
      node.removeEventListener("keydown", key);
    };
  }, [viewport, interrupt, stop]);
  function target(x: number, requested: CameraMode, force = false) {
    const node = viewport.current;
    if (!node || (manual.current && !force)) return;
    if (force) manual.current = false;
    stop();
    setMode(requested);
    const left = Math.max(
      0,
      Math.min(node.scrollWidth - node.clientWidth, x - node.clientWidth * 0.5),
    );
    if (reduced || requested === "follow") {
      node.scrollTo({ left: reduced ? left : node.scrollLeft + (left - node.scrollLeft) * 0.08, top: 0 });
      return;
    }
    const start = node.scrollLeft,
      started = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / 650);
      node.scrollTo({ left: start + (left - start) * (1 - Math.pow(1 - t, 3)), top: 0 });
      if (t < 1 && !manual.current) frame.current = requestAnimationFrame(tick);
      else setMode("settled");
    };
    frame.current = requestAnimationFrame(tick);
  }
  const begin = useCallback(() => {
    manual.current = false;
    setMode("follow");
  }, []);
  return { mode, target, begin, interrupt };
}
