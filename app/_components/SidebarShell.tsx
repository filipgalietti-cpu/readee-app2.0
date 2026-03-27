"use client";

import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import AppSidebar from "./AppSidebar";

/** Pages where sidebar is hidden (immersive/fullscreen modes) */
const HIDDEN_PAGES = new Set([
  "/practice",
  "/assessment",
  "/learn",
  "/lesson",
]);

export default function SidebarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const open = useSidebarStore((s) => s.open);

  // Hide sidebar on immersive pages
  const hidden = HIDDEN_PAGES.has(pathname);
  // Dashboard manages its own sidebar with extra content
  const isDashboard = pathname === "/dashboard";

  if (hidden || isDashboard) return <>{children}</>;

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
