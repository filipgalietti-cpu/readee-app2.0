"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, X, Share } from "lucide-react";

const DISMISSED_KEY = "readee_pwa_install_dismissed";
const SUPPRESS_DAYS = 14;

/**
 * Install affordance — styled as a dashboard tile so it slots into
 * the existing Hero Tiles grid instead of dominating the top of the
 * page. Shows when:
 *   · The browser fired beforeinstallprompt (Chrome / Edge / Android), OR
 *   · The device is iOS Safari (which has no install API — tap → modal
 *     with the Share / Add to Home Screen instructions).
 *
 * Hidden in standalone mode and for 14 days after dismissal.
 *
 * Render `<InstallPWATile />` inline inside a 3-column grid like the
 * other Hero Tiles. Returns null when not applicable, so a `grid` with
 * 6 fixed tiles + this conditional one degrades cleanly to 6.
 */
export default function InstallPWATile() {
  const [promptAvailable, setPromptAvailable] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

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

  function dismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {}
    setDismissed(true);
  }

  async function install() {
    if (isIOSSafari && !promptAvailable) {
      setShowIosModal(true);
      return;
    }
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
    <>
      <button
        type="button"
        onClick={install}
        className="block w-full text-left"
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          className="relative h-28 sm:h-[130px] rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 p-3 sm:p-4 flex flex-col items-center justify-center text-center shadow-lg cursor-pointer overflow-hidden"
        >
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-md text-white/60 hover:bg-white/15 hover:text-white transition-colors z-10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <Download
            className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-1.5 sm:mb-2"
            strokeWidth={1.5}
          />
          <span className="text-xs sm:text-sm font-extrabold text-white leading-tight">
            Install App
          </span>
        </motion.div>
      </button>

      {showIosModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowIosModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-zinc-900">
              Add Readee to your home screen
            </h3>
            <ol className="space-y-2 text-sm text-zinc-600">
              <li>
                1. Tap the{" "}
                <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700 align-middle">
                  <Share className="h-3 w-3" /> Share
                </span>{" "}
                button at the bottom of Safari
              </li>
              <li>
                2. Scroll down and tap <strong>Add to Home Screen</strong>
              </li>
              <li>3. Tap <strong>Add</strong> in the top right</li>
            </ol>
            <button
              onClick={() => setShowIosModal(false)}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
