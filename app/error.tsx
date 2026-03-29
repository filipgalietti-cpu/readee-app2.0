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
      {process.env.NODE_ENV !== "production" && (
        <pre className="text-left text-xs text-red-600 bg-red-50 p-4 rounded-lg mb-8 max-w-lg overflow-auto">
          {error.message}
          {"\n"}
          {error.stack}
        </pre>
      )}
      <p className="text-zinc-400 text-xs mb-4 max-w-md font-mono">{error.message}</p>
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
