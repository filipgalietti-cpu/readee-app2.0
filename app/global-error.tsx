"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">Something went wrong</h1>
          <p className="text-zinc-600 mb-8">
            An unexpected error occurred. We&apos;ve been notified and are looking into it.
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
