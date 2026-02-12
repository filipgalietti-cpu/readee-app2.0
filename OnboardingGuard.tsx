"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useProfile } from "./ProfileContext";

/**
 * OnboardingGuard
 *
 * Wrap your app content with this component. It will:
 * - Show nothing while loading the profile
 * - Redirect to /welcome if the user hasn't completed onboarding
 * - Allow /welcome and /login and /signup to render without a profile
 * - Render children normally once profile is confirmed
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  // Pages that don't require onboarding
  const publicPaths = ["/welcome", "/login", "/signup", "/about"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isLoading) return;

    // If no profile and not on a public page, redirect to welcome
    if (!profile?.onboardingComplete && !isPublicPath) {
      router.replace("/welcome");
    }

    // If profile exists and user is on /welcome, redirect to home
    if (profile?.onboardingComplete && pathname === "/welcome") {
      router.replace("/");
    }
  }, [profile, isLoading, isPublicPath, pathname, router]);

  // Show loading state while checking profile
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFF9F0",
          fontFamily: "'Quicksand', sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
          <p style={{ color: "#7A6B5D", fontWeight: 600 }}>Loading Readee...</p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
          }
        `}</style>
      </div>
    );
  }

  // If not onboarded and not on a public page, show nothing (redirect is happening)
  if (!profile?.onboardingComplete && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
