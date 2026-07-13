"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { audioManager } from "@/lib/audio/audio-manager";

/**
 * Kills any in-flight audio when the route changes. The audio manager is a
 * global singleton, so a clip started on one page (a question read-aloud, a
 * feedback voice) otherwise keeps playing after you navigate away. The
 * cleanup runs on the OUTGOING path, so it only stops the page you're
 * leaving — the page you land on can start its own audio untouched.
 */
export default function StopAudioOnNav() {
  const pathname = usePathname();
  useEffect(() => {
    return () => {
      try { audioManager?.stop(); } catch { /* no-op */ }
    };
  }, [pathname]);
  return null;
}
