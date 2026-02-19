"use client";

import React from "react";
import { ProfileProvider } from "./ProfileContext";
import OnboardingGuard from "./OnboardingGuard";
import { ThemeProvider } from "./ThemeContext";
import { SpeechProvider } from "./SpeechContext";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SpeechProvider>
        <ProfileProvider>
          <OnboardingGuard>{children}</OnboardingGuard>
        </ProfileProvider>
      </SpeechProvider>
    </ThemeProvider>
  );
}