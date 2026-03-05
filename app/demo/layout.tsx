"use client";

import { useEffect } from "react";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hide nav, footer, and remove main padding for full-screen demo
    const nav = document.querySelector("nav, [data-nav]") as HTMLElement;
    const footer = document.querySelector("footer") as HTMLElement;
    const main = document.querySelector("main") as HTMLElement;

    if (nav) nav.style.display = "none";
    if (footer) footer.style.display = "none";
    if (main) {
      main.style.maxWidth = "none";
      main.style.padding = "0";
      main.style.margin = "0";
    }

    // Hide Next.js dev indicator (the "N" badge in bottom-left)
    const style = document.createElement("style");
    style.textContent = `
      nextjs-portal, [data-nextjs-dialog-overlay], [data-nextjs-toast],
      #__next-build-indicator, [class*="nextjs-toast"] { display: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      if (nav) nav.style.display = "";
      if (footer) footer.style.display = "";
      if (main) {
        main.style.maxWidth = "";
        main.style.padding = "";
        main.style.margin = "";
      }
      style.remove();
    };
  }, []);

  return <>{children}</>;
}
