"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share, Wifi, Zap } from "lucide-react";

const DISMISSED_KEY = "readee_pwa_install_dismissed";
const SUPPRESS_DAYS = 14;

/**
 * One-tap install banner. Shows on the parent dashboard when:
 *   · The browser has fired beforeinstallprompt (Chrome / Edge / Android),
 *     OR the device is iOS Safari (we show the "Add to Home Screen"
 *     instruction since iOS doesn't expose a prompt API).
 *   · The user hasn't dismissed it in the last 14 days.
 *   · The app isn't already running in standalone mode.
 *
 * Visual design: brand-forward (bunny mascot + indigo/violet gradient)
 * rather than a generic system prompt — the install moment is also a
 * branding moment, especially for new parents.
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 sm:p-6 text-white shadow-lg">
      {/* Decorative orbs — purely visual, hidden on small screens. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-10 hidden h-40 w-40 rounded-full bg-white/10 blur-2xl sm:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-8 hidden h-44 w-44 rounded-full bg-fuchsia-300/20 blur-3xl sm:block"
      />

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-white/70 hover:bg-white/15 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative flex items-center gap-4 sm:gap-5">
        {/* Bunny mascot, served from /public. Acts as the "icon" so the
            banner doubles as a brand impression. */}
        <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
          <Image
            src="/images/ui/bunny-stars.png"
            alt=""
            width={96}
            height={96}
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-lg"
            priority={false}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">
            Make Readee one tap away
          </p>
          <h3 className="mt-0.5 text-lg sm:text-xl font-extrabold leading-tight">
            Add Readee to your home screen
          </h3>

          {promptAvailable ? (
            <>
              <ul className="mt-2 space-y-1 text-xs sm:text-sm text-indigo-100/95">
                <li className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.4} />
                  Opens like a regular app — no browser bar
                </li>
                <li className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.4} />
                  Keeps working when wifi gets flaky
                </li>
              </ul>
              <button
                onClick={install}
                className="mt-3 sm:mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors"
              >
                <Download className="h-4 w-4" strokeWidth={2.4} />
                Install Readee
              </button>
            </>
          ) : (
            <>
              <p className="mt-1.5 text-xs sm:text-sm text-indigo-100/95 leading-relaxed">
                Tap the{" "}
                <span className="inline-flex items-center gap-1 rounded-md bg-white/20 px-1.5 py-0.5 text-[11px] font-bold align-middle">
                  <Share className="h-3 w-3" strokeWidth={2.4} />
                  Share
                </span>{" "}
                button in Safari, then choose{" "}
                <strong className="text-white">Add to Home Screen</strong>.
              </p>
              <p className="mt-2 text-[11px] text-indigo-200/80">
                Works on flaky wifi · No app store needed
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
