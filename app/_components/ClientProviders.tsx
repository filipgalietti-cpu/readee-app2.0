"use client";

import React from "react";
import { ProfileProvider } from "./ProfileContext";
import OnboardingGuard from "./OnboardingGuard";
import { SpeechProvider } from "./SpeechContext";
import PostHogProvider from "./PostHogProvider";
import SentryIdentity from "./SentryIdentity";
import PWARegister from "./PWARegister";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PostHogProvider>
      <SentryIdentity />
      <SpeechProvider>
        <ProfileProvider>
          <PWARegister />
          <OnboardingGuard>{children}</OnboardingGuard>
        </ProfileProvider>
      </SpeechProvider>
    </PostHogProvider>
  );
}