"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Loader2, Check } from "lucide-react";

export default function FeedbackButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  function submit() {
    setErr(null);
    start(async () => {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, path: pathname }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(body.error ?? "Could not send. Try again.");
        return;
      }
      setSent(true);
      setMessage("");
      setTimeout(() => {
        setOpen(false);
        setSent(false);
      }, 1500);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition hover:scale-105 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 print:hidden"
        aria-label="Report an issue or share feedback"
        title="Report an issue"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !pending && setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
                  Feedback
                </div>
                <h3 className="mt-0.5 text-base font-bold text-zinc-900 dark:text-white">
                  Tell us what&apos;s up
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                disabled={pending}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {sent ? (
              <div className="my-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300">
                  <Check className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
                  Got it — thanks for sending.
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
                  Filip will follow up if we need more info.
                </p>
              </div>
            ) : (
              <>
                <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
                  Bug reports, feature ideas, weird behavior, or just "this is
                  confusing" — all welcome. We reply by email.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  placeholder="What happened? What did you expect?"
                  autoFocus
                  className="mt-4 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <p className="mt-1 text-right text-[11px] text-zinc-400">
                  {message.length}/5000
                </p>
                {err && (
                  <p className="mt-2 text-xs font-semibold text-red-600">{err}</p>
                )}
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full px-4 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={pending || !message.trim()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
