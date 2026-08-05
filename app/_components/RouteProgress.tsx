"use client";

/**
 * Purple route-transition bar (ported from Claude Design "Loading States").
 * A thin gradient bar pinned to the top of the viewport that crawls on client
 * navigation and snaps to 100% + fades when the new route commits.
 *
 * App Router has no router events, so we START on internal <a> clicks + back/
 * forward, and FINISH when usePathname() changes (route committed). A safety
 * timeout completes it for same-path / search-only navigations.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteProgress() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const crawlRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const firstRef = useRef(true);
  const reducedRef = useRef(false);

  function clearAll() {
    if (crawlRef.current) { window.clearInterval(crawlRef.current); crawlRef.current = null; }
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }

  function start() {
    clearAll();
    setFading(false);
    setVisible(true);
    if (reducedRef.current) { setWidth(90); return; } // no crawl for reduced motion
    setWidth(8);
    crawlRef.current = window.setInterval(() => {
      setWidth((w) => (w >= 80 ? w : Math.min(80, w + (w < 40 ? 8 : w < 65 ? 4 : 1.5))));
    }, 240);
    // Safety: finish if the route never "commits" (same-path / search-only nav).
    timersRef.current.push(window.setTimeout(() => finish(), 8000));
  }

  function finish() {
    if (crawlRef.current) { window.clearInterval(crawlRef.current); crawlRef.current = null; }
    setWidth(100);
    timersRef.current.push(window.setTimeout(() => {
      setFading(true);
      timersRef.current.push(window.setTimeout(() => { setVisible(false); setWidth(0); setFading(false); }, 320));
    }, 200));
  }

  // Complete the bar when the new route commits.
  useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return; }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Start the bar on internal link clicks + browser back/forward.
  useEffect(() => {
    reducedRef.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || target === "_blank" || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (a.hasAttribute("download")) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      } catch { return; }
      start();
    }
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", start);
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;
  return (
    <div aria-hidden style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 100, pointerEvents: "none" }}>
      <div
        role="progressbar"
        aria-label="Page loading"
        style={{
          height: "100%",
          width: `${width}%`,
          background: "linear-gradient(90deg,#4338ca,#8b5cf6)",
          boxShadow: "0 0 8px rgba(139,92,246,0.5)",
          borderRadius: "0 2px 2px 0",
          opacity: fading ? 0 : reducedRef.current ? 0.25 : 1,
          transition: "width 0.2s ease-out, opacity 0.3s ease",
        }}
      />
    </div>
  );
}
