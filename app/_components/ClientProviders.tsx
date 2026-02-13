"use client";

import { ProfileProvider } from "./ProfileContext";
import { OnboardingGuard } from "./OnboardingGuard";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <OnboardingGuard>{children}</OnboardingGuard>
    </ProfileProvider>
  );
}

