"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import PageTransition from "./PageTransition";

/**
 * Site chrome (header + centered content column + footer) for every page
 * except the immersive ones, which own the whole viewport: the reading
 * placement and its reveal/report are a child + parent ceremony, not a page.
 */
const IMMERSIVE_PREFIXES = ["/placement", "/demo/placement-run", "/demo/placement-reveal"];

export function isImmersivePath(pathname: string): boolean {
  return IMMERSIVE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default function Chrome({ nav, footer, children }: { nav: React.ReactNode; footer: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const immersive = isImmersivePath(pathname);
  // The body carries the fixed-header offset (globals.css); drop it here.
  useEffect(() => {
    document.body.classList.toggle("immersive-route", immersive);
    document.body.style.paddingTop = immersive ? "env(safe-area-inset-top)" : "";
    return () => {
      document.body.classList.remove("immersive-route");
      document.body.style.paddingTop = "";
    };
  }, [immersive]);
  if (immersive) {
    return <main className="flex min-h-dvh w-full flex-col">{children}</main>;
  }
  return (
    <>
      {nav}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-2 pb-4 sm:pb-8">
        <PageTransition>{children}</PageTransition>
      </main>
      {footer}
    </>
  );
}
