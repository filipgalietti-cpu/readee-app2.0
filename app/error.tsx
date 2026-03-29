"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold text-zinc-900 mb-4">Something went wrong</h1>
      <p className="text-zinc-600 mb-8 max-w-md">
        An unexpected error occurred. We&apos;ve been notified and are looking into it.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
