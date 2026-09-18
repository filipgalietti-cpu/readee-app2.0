"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * The error boundary for every public route: the library, the daily, invites,
 * the marketing pages. The people who see it are mostly strangers deciding
 * whether to trust us, so it has one more job than an internal error page.
 *
 * ‼️ WHY IT RETRIES. Sentry aff62aa0, 18 Sep 2026: a parent eight minutes into
 * their first account opened the Free Reading Library, a database call failed
 * at the network layer, and this page told them "an unexpected error occurred,
 * we've been notified". They never started the assessment. Nothing was broken;
 * the connection blinked.
 *
 * A dropped connection is not an unexpected error, it is the most ordinary
 * thing on the internet, and the right response is to try again rather than to
 * apologise. So a network-class failure retries itself once, silently, and only
 * speaks up if the second attempt fails too.
 */

/** A failure of the connection rather than of the code. */
function isNetworkError(error: Error): boolean {
  const m = `${error?.name ?? ""} ${error?.message ?? ""}`.toLowerCase();
  return (
    m.includes("network error") || // WebKit
    m.includes("failed to fetch") || // Chromium
    m.includes("networkerror when attempting") || // Firefox
    m.includes("load failed") || // Safari
    m.includes("fetch failed") || // undici, server side
    m.includes("dynamically imported module") // a chunk that did not arrive
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const network = isNetworkError(error);
  const [retried, setRetried] = useState(false);

  useEffect(() => {
    // One silent retry for a blink. Most of these succeed, and the visitor sees
    // a flicker instead of a dead end.
    if (network && !retried) {
      setRetried(true);
      const t = window.setTimeout(() => reset(), 400);
      return () => window.clearTimeout(t);
    }
    // Report only what survives the retry, or what was never a network problem.
    // A blip that recovered is not an issue, and filing it buries the ones that
    // are: this route's noise is why AbortError is already on the ignore list
    // in instrumentation-client.ts.
    Sentry.captureException(error, { tags: { network: String(network), retried: String(retried) } });
  }, [error, network, retried, reset]);

  if (network && !retried) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center" aria-busy="true">
        <p className="text-zinc-600">One moment...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="mb-4 text-4xl font-bold text-zinc-900">
        {network ? "We could not reach Readee" : "Something went wrong"}
      </h1>
      <p className="mb-8 max-w-md text-zinc-600">
        {network
          ? "That looks like a connection problem rather than a fault on the page. Check your connection and try again."
          : "An unexpected error occurred. We've been notified and are looking into it."}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
