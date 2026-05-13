"use client";

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

export default function SidebarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const open = useSidebarStore((s) => s.open);

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
