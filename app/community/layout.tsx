"use client";

import { useEffect } from "react";

/**
 * Community has its own header / footer / chrome (it's a public
 * acquisition surface, not part of the app shell). This layout
 * strips the root-layout NavAuth + marketing footer + max-w-6xl
 * constraint and lets the page fill the viewport edge-to-edge.
 *
 * Same escape-hatch pattern used by /demo.
 */
export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const nav = document.querySelector("[data-nav], nav") as HTMLElement | null;
    const footer = document.querySelector("footer") as HTMLElement | null;
    const main = document.querySelector("main") as HTMLElement | null;

    if (nav) nav.style.display = "none";
    if (footer) footer.style.display = "none";
    if (main) {
      main.style.maxWidth = "none";
      main.style.padding = "0";
      main.style.margin = "0";
    }
    document.body.style.background = "#ffffff";

    return () => {
      if (nav) nav.style.display = "";
      if (footer) footer.style.display = "";
      if (main) {
        main.style.maxWidth = "";
        main.style.padding = "";
        main.style.margin = "";
      }
      document.body.style.background = "";
    };
  }, []);

  return <>{children}</>;
}
