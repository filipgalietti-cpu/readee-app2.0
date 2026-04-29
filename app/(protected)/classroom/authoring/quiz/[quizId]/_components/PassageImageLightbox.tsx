"use client";

import { useEffect, useState } from "react";
import { ImageIcon, X, ZoomIn } from "lucide-react";

/**
 * Click-to-zoom lightbox for the passage hero illustration. Plain
 * fixed overlay, no library. Esc closes; click outside closes.
 */
export default function PassageImageLightbox({ src }: { src: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        aria-label="Open illustration"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Passage illustration"
          className="block h-full w-full object-cover"
        />
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
          <ImageIcon className="h-3 w-3" /> Illustration
        </div>
        <div className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" />
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative max-h-full max-w-5xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Passage illustration"
              className="max-h-[85vh] w-auto rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
