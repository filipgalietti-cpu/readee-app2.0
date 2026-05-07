"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/**
 * Drop into any owner-facing server component:
 *   <RefreshIndicator renderedAt={new Date().toISOString()} />
 *
 * Shows "Refreshed Xs/m/h ago" with a click-to-refetch button.
 * Server-side: each render gets a fresh timestamp because the
 * pages declare `export const dynamic = "force-dynamic"`. Client-
 * side: ticks the relative-time label every 30s and calls
 * router.refresh() to re-fetch the server component without a
 * full page reload.
 */
export default function RefreshIndicator({
  renderedAt,
}: {
  renderedAt: string;
}) {
  const [now, setNow] = useState<number>(() => Date.now());
  const [pending, start] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const ageSec = Math.max(
    0,
    Math.round((now - new Date(renderedAt).getTime()) / 1000),
  );
  const label =
    ageSec < 5
      ? "just now"
      : ageSec < 60
        ? `${ageSec}s ago`
        : ageSec < 3600
          ? `${Math.round(ageSec / 60)}m ago`
          : `${Math.round(ageSec / 3600)}h ago`;

  // Tone shifts amber if the snapshot is over 5 minutes old —
  // gives Filip a visual cue that the numbers are stale before
  // he draws conclusions from them.
  const stale = ageSec >= 300;

  return (
    <button
      type="button"
      onClick={() => start(() => router.refresh())}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition disabled:opacity-60 ${
        stale
          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
      }`}
      aria-label={`Refreshed ${label} — click to refresh`}
    >
      <RefreshCw className={`h-3 w-3 ${pending ? "animate-spin" : ""}`} />
      <span>
        {pending ? "Refreshing…" : `Refreshed ${label}`}
      </span>
      {!pending && <span className="text-zinc-400">·</span>}
      {!pending && <span className="text-zinc-600">Refresh</span>}
    </button>
  );
}
