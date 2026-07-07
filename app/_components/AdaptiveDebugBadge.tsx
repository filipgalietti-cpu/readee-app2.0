/**
 * Dev-only readout of the adaptive controller's current reading. Renders a
 * small fixed badge showing state / directive / throttle / reason so we can
 * watch the brakes-vs-gas brain work in real time. Gated behind a devMode
 * flag by the caller — NEVER shown to a child in production.
 */
"use client";

import type { AdaptiveReading } from "@/lib/adaptive/controller";

const STYLES: Record<
  AdaptiveReading["state"],
  { bg: string; label: string; icon: string }
> = {
  breezing: { bg: "bg-emerald-500", label: "BREEZING", icon: "▲▲" }, // ▲▲ gas
  flow: { bg: "bg-violet-500", label: "FLOW", icon: "•" }, // • hold
  struggling: { bg: "bg-amber-500", label: "STRUGGLING", icon: "▼" }, // ▼ light brakes
  frustrated: { bg: "bg-rose-600", label: "FRUSTRATED", icon: "▼▼" }, // ▼▼ hard brakes
};

export function AdaptiveDebugBadge({ reading }: { reading: AdaptiveReading }) {
  const s = STYLES[reading.state];
  return (
    <div className="fixed bottom-3 left-3 z-[60] pointer-events-none select-none">
      <div
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-white shadow-lg ${s.bg}`}
        style={{ fontFamily: "monospace", fontSize: 11 }}
      >
        <span aria-hidden>{s.icon}</span>
        <span className="font-bold">{s.label}</span>
        <span className="opacity-80">
          {reading.directive} · thr {reading.throttle >= 0 ? "+" : ""}
          {reading.throttle} · conf {reading.confidence.toFixed(2)}
        </span>
      </div>
      <div
        className="mt-1 ml-2 rounded bg-black/70 px-2 py-0.5 text-white"
        style={{ fontFamily: "monospace", fontSize: 10, maxWidth: 260 }}
      >
        {reading.reason} · n={reading.window}
      </div>
    </div>
  );
}
