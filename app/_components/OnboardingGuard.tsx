"use client";

import React from "react";

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  // IMPORTANT:
  // Do NOT redirect from the client. Server decides onboarding routing.
  // Client redirects cause hydration/route thrash and flicker.
  return <>{children}</>;
}