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
      <div
        className={`transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "lg:ml-[272px]" : "lg:ml-[72px]"
        }`}
      >
        {children}
      </div>
    </>
  );
}
