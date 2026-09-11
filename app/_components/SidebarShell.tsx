"use client";

import { useEffect } from "react";
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
  "/explore",
  "/practice",
  "/assessment",
  "/placement",
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
  const hydrateFromServer = useSidebarStore((s) => s.hydrateFromServer);
  const setDesktopSidebarVisible = useSidebarStore((s) => s.setDesktopSidebarVisible);
  useEffect(() => {
    hydrateFromServer(initialOpen);
  }, [initialOpen, hydrateFromServer]);

  // Tell the root-layout footer whether the fixed desktop sidebar is on
  // screen for this route, so it can offset past it. Reset on unmount
  // (i.e. navigating to a public page that has no sidebar).
  const hiddenPage = [...HIDDEN_PAGES].some((p) => pathname === p || pathname.startsWith(p + "/"));
  const sidebarShown = !hiddenPage;
  useEffect(() => {
    setDesktopSidebarVisible(sidebarShown);
    return () => setDesktopSidebarVisible(false);
  }, [sidebarShown, setDesktopSidebarVisible]);

  const hideAll = pathname === "/explore" || pathname.startsWith("/explore/") || pathname === "/placement" || pathname.startsWith("/placement/");

  return (
    <>
      {!hideAll && <AppSidebar mobileOnly={hiddenPage} />}
      {/* Desktop: break out of the root <main>'s centered max-w-6xl so the
          fixed sidebar doesn't eat into the content column. The content
          then spans the full viewport minus the sidebar, instead of being
          squished into the leftover of a centered 1152px box. Mobile keeps
          the normal centered container (no sidebar rail there). The sidebar
          is always open (272px) — the collapse toggle was removed. */}
      <div data-app-content className={hiddenPage ? undefined : "lg:ml-[calc(50%-50vw)] lg:mr-[calc(50%-50vw)]"}>
        <div className={hiddenPage ? undefined : "lg:ml-[272px]"}>
          {children}
        </div>
      </div>
    </>
  );
}
