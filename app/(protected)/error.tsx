"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, RotateCw } from "lucide-react";

/**
 * Route-level error boundary for the protected (signed-in) zone.
 *
 * Without this, an unhandled render error in any single page nukes
 * the whole app shell — the parent loses their sidebar context and
 * sees a generic full-page error. This boundary keeps them inside
 * the app shell, names the situation in kid-app voice, and gives
 * them a fast recovery path (retry the page or jump home).
 *
 * Errors are reported to Sentry on mount so we still see them.
 */
export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: "protected" },
    });
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 py-16 text-center">
      <Image
        src="/images/ui/bunny-thinking.png"
        alt=""
        width={120}
        height={120}
        className="h-28 w-28 object-contain"
        priority
      />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Hmm, that page tripped on something.
      </h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-slate-400">
        We&apos;ve been pinged automatically. Try the page again, or
        head back to the dashboard — the rest of Readee is still
        working.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <RotateCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 text-sm font-bold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <Home className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
      {error?.digest && (
        <p className="mt-6 font-mono text-[10px] text-zinc-300 dark:text-slate-600">
          ref: {error.digest}
        </p>
      )}
    </div>
  );
}
