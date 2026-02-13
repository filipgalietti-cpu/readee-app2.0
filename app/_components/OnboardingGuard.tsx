"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useProfile } from "./ProfileContext";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ["/welcome", "/login", "/signup", "/about"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isLoading) return;

    if (!profile?.onboardingComplete && !isPublicPath) {
      router.replace("/welcome");
      return;
    }

    if (profile?.onboardingComplete && pathname === "/welcome") {
      router.replace("/");
    }
  }, [isLoading, profile, isPublicPath, pathname, router]);

  if (isLoading) return null;
  if (!profile?.onboardingComplete && !isPublicPath) return null;

  return <>{children}</>;
}
