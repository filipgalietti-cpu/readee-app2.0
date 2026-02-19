"use client";

import React from "react";
import { ProfileProvider } from "./ProfileContext";
import OnboardingGuard from "./OnboardingGuard";
import { ThemeProvider } from "./ThemeContext";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <OnboardingGuard>{children}</OnboardingGuard>
      </ProfileProvider>
    </ThemeProvider>
  );
}