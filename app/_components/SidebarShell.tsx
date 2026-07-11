"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import AppSidebar from "./AppSidebar";

/**
 * Immersive routes that hide the desktop sidebar — these are
 * fullscreen kid experiences where a sidebar would just steal real
 * estate from the lesson/practice runner. Everywhere else (including
 * dashboard, settings, account, billing) renders the single shared
 * AppSidebar so parents/kids never see a different chrome between
 * pages.
 */
const HIDDEN_PAGES = new Set([
  "/practice",
  "/assessment",
  "/learn",
  "/lesson",
]);

export default function SidebarShell({
  initialOpen,
  children,
}: {
  initialOpen: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // We want the FIRST render (and subsequent renders before the store
  // catches up) to match the server's view, so we don't shift the
  // content column horizontally. We use a local state that mirrors the
  // server-provided cookie, hydrate the store with it on mount, and
  // then track the store as the source of truth afterwards.
  const storeOpen = useSidebarStore((s) => s.open);
  const hydrateFromServer = useSidebarStore((s) => s.hydrateFromServer);
  const hydrated = useRef(false);
  const [open, setLocalOpen] = useState(initialOpen);

  useEffect(() => {
    if (!hydrated.current) {
      hydrateFromServer(initialOpen);
      hydrated.current = true;
      return;
    }
    setLocalOpen(storeOpen);
  }, [storeOpen, initialOpen, hydrateFromServer]);

  if (HIDDEN_PAGES.has(pathname)) {
    return (
      <>
        {/* Mobile sidebar overlay still available via hamburger */}
        <AppSidebar mobileOnly />
        {children}
      </>
    );
  }

  return (
    <>
      <AppSidebar />
      {/* Desktop: break out of the root <main>'s centered max-w-6xl so the
          fixed sidebar doesn't eat into the content column. The content
          then spans the full viewport minus the sidebar, instead of being
          squished into the leftover of a centered 1152px box. Mobile keeps
          the normal centered container (no sidebar rail there). The sidebar
          is always open (272px) — the collapse toggle was removed. */}
      <div className="lg:ml-[calc(50%-50vw)] lg:mr-[calc(50%-50vw)]">
        <div className="lg:ml-[272px]">
          {children}
        </div>
      </div>
    </>
  );
}
