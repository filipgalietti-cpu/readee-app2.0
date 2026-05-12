"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on first paint and listens for
 * beforeinstallprompt so InstallPWAButton can show a one-tap install.
 *
 * We stash the deferred prompt on window so any surface can read it
 * later — buddy is to keep registration decoupled from the button UI.
 */
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Register on idle so it never delays first paint.
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Some environments (private browsing, certain extensions)
        // block SW registration — silent failure is fine; app works.
      });
    };
    if ((window as any).requestIdleCallback) {
      (window as any).requestIdleCallback(register);
    } else {
      setTimeout(register, 1500);
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      (window as any).__readeeInstallPrompt = e;
      window.dispatchEvent(new Event("readee:installprompt-available"));
    }
    function onInstalled() {
      (window as any).__readeeInstallPrompt = null;
      window.dispatchEvent(new Event("readee:installed"));
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return null;
}
