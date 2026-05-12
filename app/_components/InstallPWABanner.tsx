"use client";

import { useEffect, useState } from "react";
import { Smartphone, X, Share } from "lucide-react";

const DISMISSED_KEY = "readee_pwa_install_dismissed";
const SUPPRESS_DAYS = 14;

/**
 * One-tap install banner. Shows on the parent dashboard when:
 *   · The browser has fired beforeinstallprompt (Chrome / Edge / Android),
 *     OR the device is iOS Safari (we show the "Add to Home Screen"
 *     instruction since iOS doesn't expose a prompt API).
 *   · The user hasn't dismissed it in the last 14 days.
 *   · The app isn't already running in standalone mode.
 */
export default function InstallPWABanner() {
  const [promptAvailable, setPromptAvailable] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    try {
      const raw = localStorage.getItem(DISMISSED_KEY);
      const at = raw ? Number(raw) : 0;
      const ageDays = (Date.now() - at) / (1000 * 60 * 60 * 24);
      setDismissed(ageDays < SUPPRESS_DAYS);
    } catch {
      setDismissed(false);
    }

    if ((window as any).__readeeInstallPrompt) setPromptAvailable(true);
    function onAvail() {
      setPromptAvailable(true);
    }
    function onInstalledEvt() {
      setInstalled(true);
    }
    window.addEventListener("readee:installprompt-available", onAvail);
    window.addEventListener("readee:installed", onInstalledEvt);

    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    setIsIOSSafari(iOS && safari);

    return () => {
      window.removeEventListener("readee:installprompt-available", onAvail);
      window.removeEventListener("readee:installed", onInstalledEvt);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {}
    setDismissed(true);
  }

  async function install() {
    const e = (window as any).__readeeInstallPrompt;
    if (!e || typeof e.prompt !== "function") return;
    try {
      e.prompt();
      await e.userChoice;
    } catch {}
    (window as any).__readeeInstallPrompt = null;
    setPromptAvailable(false);
  }

  if (installed || dismissed) return null;
  if (!promptAvailable && !isIOSSafari) return null;

  return (
    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm">
          <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-900 dark:text-slate-100">
            Add Readee to your home screen
          </p>
          {promptAvailable ? (
            <>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-slate-300">
                One tap to install — opens like a regular app, works on flaky wifi.
              </p>
              <button
                onClick={install}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Install Readee
              </button>
            </>
          ) : (
            <>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-slate-300">
                Tap{" "}
                <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 align-middle">
                  <Share className="h-3 w-3" /> Share
                </span>{" "}
                then <strong>Add to Home Screen</strong> for an app-like experience.
              </p>
            </>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/60 dark:hover:bg-slate-800 hover:text-zinc-700 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
