"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createRouteProgress, type ProgressState } from "@/lib/navigation/progress";

function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const controller = useRef<ReturnType<typeof createRouteProgress> | null>(null);
  const committed = useRef("");
  const [state, setState] = useState<ProgressState>({ visible: false, width: 0, fading: false });

  useEffect(() => {
    const progress = createRouteProgress(setState, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    controller.current = progress;
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a");
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const href = link.getAttribute("href");
      if (!href) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return;
      } catch { return; }
      progress.start();
    }
    function onHistory() {
      if (window.location.pathname + window.location.search !== committed.current) progress.start();
    }
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onHistory);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onHistory);
      progress.dispose();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    committed.current = pathname + (search ? `?${search}` : "");
    controller.current?.finish();
  }, [pathname, search]);

  if (!state.visible) return null;
  return <div data-route-progress role="progressbar" aria-label="Opening page" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5">
    <div className="h-full bg-gradient-to-r from-violet-600 to-violet-500 transition-[width,opacity] duration-200 motion-reduce:transition-none"
      style={{ width: `${state.width}%`, opacity: state.fading ? 0 : 1 }} />
  </div>;
}

export default function RouteProgress() {
  return <Suspense fallback={null}><NavigationProgress /></Suspense>;
}
