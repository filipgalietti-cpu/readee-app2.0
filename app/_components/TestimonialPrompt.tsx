"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, X, CheckCircle2 } from "lucide-react";

/**
 * Lightweight testimonial-capture prompt for the parent dashboard.
 *
 * Triggers: after the kid has completed at least N lessons AND the
 * parent hasn't dismissed or submitted within the last 90 days.
 *
 * Why this exists: we have zero real testimonials. Parents who love
 * the app won't volunteer one — we have to ask, at the moment they're
 * happy (right after a kid hits a milestone). Captures + marketing
 * consent in one step. Approved testimonials land on the homepage
 * via the parent_testimonials table.
 *
 * Storage: dismissals live in localStorage so we don't nag. A
 * successful submit also writes "dismissed" so the same parent
 * doesn't see this twice in a row.
 */

const DISMISS_KEY = "readee.testimonial-prompt.dismissed";
const DISMISS_TTL_DAYS = 90;

function shouldShow(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return true;
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return true;
  const ageMs = Date.now() - dismissedAt;
  return ageMs > DISMISS_TTL_DAYS * 24 * 60 * 60 * 1000;
}

function dismiss(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

export default function TestimonialPrompt({
  childFirstName,
  childGrade,
  completedLessons,
  /** Only show after the child has at least this many completions. */
  threshold = 3,
}: {
  childFirstName?: string | null;
  childGrade?: string | null;
  completedLessons: number;
  threshold?: number;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [quote, setQuote] = useState("");
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (completedLessons < threshold) return;
    if (!shouldShow()) return;
    // Slight delay so we don't pop the moment the page paints.
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [completedLessons, threshold]);

  function close(persist = true) {
    if (persist) dismiss();
    setOpen(false);
  }

  async function submit() {
    if (!rating || quote.trim().length < 10) {
      setErr("Pick a rating and write at least a sentence.");
      return;
    }
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/parent-testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote,
          rating,
          childGrade: childGrade ?? null,
          marketingConsent: consent,
          source: "dashboard-prompt",
        }),
      });
      const j = await res.json();
      if (!j.ok) {
        setErr(j.error ?? "Couldn't save right now. Try later?");
        return;
      }
      setSubmitted(true);
      dismiss();
      setTimeout(() => setOpen(false), 1800);
    } catch {
      setErr("Network glitch — try once more?");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pb-[max(1rem,env(safe-area-inset-bottom))] px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-sm sm:px-0">
      <div className="relative rounded-3xl border border-violet-200 bg-white p-5 shadow-2xl ring-1 ring-black/5 dark:border-violet-900/40 dark:bg-slate-900">
        <button
          onClick={() => close()}
          aria-label="Not now"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" strokeWidth={2} />
            <p className="mt-3 font-bold text-zinc-900 dark:text-white">
              Thank you — that helps a lot.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Image
                src="/images/ui/bunny-stars.png"
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 flex-shrink-0 object-contain"
              />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
                  Quick favor
                </div>
                <p className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-white">
                  How&apos;s Readee going
                  {childFirstName ? ` for ${childFirstName}` : ""}?
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} stars`}
                  className="rounded-md p-0.5 transition hover:scale-110"
                >
                  <Star
                    className={`h-7 w-7 ${
                      n <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-300 dark:text-slate-600"
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Tell us what's working — even one sentence helps."
              rows={3}
              className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-zinc-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-400"
              />
              <span>
                OK to use my note on readee.app. We&apos;ll only show your
                first name + your kid&apos;s grade — never their name.
              </span>
            </label>

            {err && (
              <div className="mt-2 text-xs font-semibold text-rose-700">
                {err}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send"}
              </button>
              <button
                onClick={() => close()}
                className="rounded-full px-3 py-2.5 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
              >
                Not now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
