"use client";

import { usePathname } from "next/navigation";
import AuthLayout from "@/app/components/auth/AuthLayout";

/**
 * Shared shell for /login + /signup. Because this is a persistent layout,
 * flipping between the two routes only swaps the form (the page children) —
 * the logo, tab toggle, and side panel stay mounted, so the toggle is smooth
 * (no remount flicker). The active tab is derived from the current path.
 */
export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mode = pathname?.startsWith("/signup") ? "signup" : "signin";
  return <AuthLayout mode={mode}>{children}</AuthLayout>;
}
