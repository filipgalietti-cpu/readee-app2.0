"use client";

import React from "react";
import { ProfileProvider } from "./ProfileContext";
import { OnboardingGuard } from "./OnboardingGuard";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      <OnboardingGuard>{children}</OnboardingGuard>
    </ProfileProvider>
  );
}