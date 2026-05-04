"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Globe2, Loader2, CheckCircle2, Clock, X } from "lucide-react";
import {
  toggleQuizCommunityShare,
  getQuizCommunityShareStatus,
} from "@/app/(protected)/classroom/authoring-actions";

type Status = "approved" | "pending" | "rejected" | null;

/**
 * Header-bar control that lets a teacher share their quiz to the
 * Readee Community Library or withdraw it. Shows the current state
 * (live / pending review / rejected / off) and a toast-style
 * confirmation after a toggle.
 */
export default function ShareWithCommunityToggle({
  quizId,
  hasPassage,
  hasQuestions,
}: {
  quizId: string;
  /** Quiz needs a description (used as the passage) and at least
   *  one question to be shareable. We disable the control with a
   *  reason if either is missing. */
  hasPassage: boolean;
  hasQuestions: boolean;
}) {
  const [status, setStatus] = useState<Status>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [flash, setFlash] = useState<
    | { kind: "auto_approved" | "queued_for_review" | "withdrawn" }
    | null
  >(null);

  useEffect(() => {
    let live = true;
    (async () => {
      const res = await getQuizCommunityShareStatus({ quizId });
      if (!live) return;
      if (res.ok) {
        setStatus(res.status);
        setSlug(res.slug);
      }
    })();
    return () => {
      live = false;
    };
  }, [quizId]);

  const isShared = status === "approved" || status === "pending";
  const blocker = !hasPassage
    ? "Add a passage to the quiz description before sharing."
    : !hasQuestions
      ? "Add at least one question before sharing."
      : null;

  function flip() {
    if (blocker) return;
    setErr(null);
    start(async () => {
      const res = await toggleQuizCommunityShare({
        quizId,
        shared: !isShared,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setFlash({ kind: res.status });
      // Refresh status from server.
      const next = await getQuizCommunityShareStatus({ quizId });
      if (next.ok) {
        setStatus(next.status);
        setSlug(next.slug);
      }
      // Clear flash after 4s.
      setTimeout(() => setFlash(null), 4000);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={flip}
        disabled={pending || !!blocker}
        title={blocker ?? undefined}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          status === "approved"
            ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
            : status === "pending"
              ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
              : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        }`}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : status === "approved" ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : status === "pending" ? (
          <Clock className="h-3.5 w-3.5" />
        ) : (
          <Globe2 className="h-3.5 w-3.5" />
        )}
        {status === "approved"
          ? "Shared with community"
          : status === "pending"
            ? "Pending review"
            : "Share with community"}
      </button>

      {/* Flash banner — slides under the button on toggle */}
      {flash && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg ring-1 ring-zinc-100 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setFlash(null)}
            className="absolute right-1.5 top-1.5 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-800"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </button>
          {flash.kind === "auto_approved" && (
            <>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Live in the community
              </div>
              <p className="mt-1 text-xs text-zinc-700 dark:text-slate-300">
                Your quiz is now public.{" "}
                {slug && (
                  <Link
                    href={`/community/${slug}`}
                    target="_blank"
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    View it →
                  </Link>
                )}
              </p>
            </>
          )}
          {flash.kind === "queued_for_review" && (
            <>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-700">
                <Clock className="h-3.5 w-3.5" />
                Queued for review
              </div>
              <p className="mt-1 text-xs text-zinc-700 dark:text-slate-300">
                A Readee admin will check it before it goes live —
                usually within a day.
              </p>
            </>
          )}
          {flash.kind === "withdrawn" && (
            <>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                <X className="h-3.5 w-3.5" />
                Withdrawn
              </div>
              <p className="mt-1 text-xs text-zinc-700 dark:text-slate-300">
                Removed from the community library.
              </p>
            </>
          )}
        </div>
      )}

      {err && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 shadow-lg dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {err}
        </div>
      )}
    </div>
  );
}
