"use client";

import { usePathname } from "next/navigation";

/**
 * Site chrome (header + centered content column + footer) for every page
 * except the immersive ones, which own the whole viewport: the reading
 * placement and its reveal/report are a child + parent ceremony, not a page.
 */
const IMMERSIVE_PREFIXES = ["/placement", "/demo/placement-run", "/demo/placement-reveal", "/demo/placement-studio"];

export function isImmersivePath(pathname: string): boolean {
  return IMMERSIVE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default function Chrome({ nav, footer, children }: { nav: React.ReactNode; footer: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const immersive = isImmersivePath(pathname);
  // Keep the same React tree across routes. A pathname-keyed wrapper here
  // remounts even shared layouts, restarting consent, sidebar and page effects.
  return (
    <>
      <div hidden={immersive} data-site-header>{nav}</div>
      <main data-app-chrome={immersive ? "immersive" : "standard"} className={immersive
        ? "flex min-h-dvh w-full flex-col"
        : "flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-2 pb-4 sm:pb-8"}>
        {children}
      </main>
      <div hidden={immersive} data-site-footer>{footer}</div>
    </>
  );
}
