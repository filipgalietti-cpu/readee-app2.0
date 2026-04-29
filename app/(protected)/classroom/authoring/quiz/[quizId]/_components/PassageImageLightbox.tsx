"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, X, ZoomIn, RefreshCw, AlertCircle } from "lucide-react";
import { aiRegeneratePassageImage } from "@/app/(protected)/classroom/authoring-actions";

/**
 * Click-to-zoom lightbox for the passage hero illustration. Plain
 * fixed overlay, no library. Esc closes; click outside closes.
 *
 * The "Regenerate" pill (top-right) reruns the image generator with
 * a fresh brief. Costs the teacher's normal image-gen credit (~8 by
 * default). Updates every question still pointing at this URL.
 */
export default function PassageImageLightbox({
  src,
  quizId,
}: {
  src: string;
  quizId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [currentSrc, setCurrentSrc] = useState(src);

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

  function regenerate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setErr(null);
    start(async () => {
      const res = await aiRegeneratePassageImage({ quizId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setCurrentSrc(res.imageUrl);
      router.refresh();
    });
  }

  return (
    <>
      <div className="relative h-full">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block h-full w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          aria-label="Open illustration"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentSrc}
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
        <button
          type="button"
          onClick={regenerate}
          disabled={pending}
          className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-violet-700 shadow ring-1 ring-violet-200 transition hover:bg-violet-50 disabled:opacity-60 dark:bg-slate-900/90 dark:text-violet-300 dark:ring-violet-900/40"
          title="Generate a new illustration for this passage"
        >
          <RefreshCw className={`h-3 w-3 ${pending ? "animate-spin" : ""}`} />
          {pending ? "Generating…" : "Regenerate"}
        </button>
      </div>

      {err && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
          {err}
        </div>
      )}

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
              src={currentSrc}
              alt="Passage illustration"
              className="max-h-[85vh] w-auto rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
