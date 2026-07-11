"use client";

import { useSidebarStore } from "@/lib/stores/sidebar-store";

/**
 * Offsets the site footer past the fixed desktop sidebar so the rail
 * doesn't cover it. The footer lives in the root layout (shared by
 * public + protected pages), so we only shift it on routes where the
 * sidebar is actually on screen — signalled by SidebarShell via the
 * store. Public/immersive pages have no rail, so no offset (full width).
 */
export default function FooterShell({ children }: { children: React.ReactNode }) {
  const sidebarVisible = useSidebarStore((s) => s.desktopSidebarVisible);
  return <div className={sidebarVisible ? "lg:ml-[272px]" : ""}>{children}</div>;
}
