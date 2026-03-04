"use client";

import React from "react";
import { ProfileProvider } from "./ProfileContext";
import OnboardingGuard from "./OnboardingGuard";
import { ThemeProvider } from "./ThemeContext";
import { SpeechProvider } from "./SpeechContext";
import PostHogProvider from "./PostHogProvider";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PostHogProvider>
      <ThemeProvider>
        <SpeechProvider>
          <ProfileProvider>
            <OnboardingGuard>{children}</OnboardingGuard>
          </ProfileProvider>
        </SpeechProvider>
      </ThemeProvider>
    </PostHogProvider>
  );
}