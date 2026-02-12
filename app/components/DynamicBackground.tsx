"use client";

import { useEffect } from "react";
import { useProfile } from "../../ProfileContext";

/**
 * DynamicBackground
 * 
 * Applies the user's selected favorite color to the page background
 * with smooth, subtle transitions. Uses CSS custom properties for
 * real-time updates without re-rendering the entire app.
 */
export function DynamicBackground() {
  const { profile } = useProfile();

  useEffect(() => {
    if (profile?.favoriteColorHex) {
      // Set CSS custom property for the accent color
      document.documentElement.style.setProperty(
        "--accent-color",
        profile.favoriteColorHex
      );
    } else {
      // Default to a soft blue if no color is selected
      document.documentElement.style.setProperty(
        "--accent-color",
        "#74C0FC"
      );
    }
  }, [profile?.favoriteColorHex]);

  return null;
}
