"use client";

import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import AppSidebar from "./AppSidebar";

/** Pages where the desktop sidebar is hidden (immersive/fullscreen modes) */
const HIDDEN_PAGES = new Set([
  "/practice",
  "/assessment",
  "/learn",
  "/lesson",
  "/billing",
  "/notifications",
  "/account",
  "/settings",
]);

export default function SidebarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const open = useSidebarStore((s) => s.open);

  // Hide desktop sidebar on immersive pages, but always render for mobile overlay
  const hidden = HIDDEN_PAGES.has(pathname);
  const isDashboard = pathname === "/dashboard";

  if (hidden || isDashboard) {
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
