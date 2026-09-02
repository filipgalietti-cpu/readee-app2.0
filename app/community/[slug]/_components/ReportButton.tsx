"use client";

import { useState } from "react";
import { Glyph } from "@/app/_components/Glyph";

/**
 * Report a published story. Kid-simple: one tap files a report for the Readee
 * team to review. Reasons are optional; the tap itself is the signal.
 */
export default function ReportButton({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  async function report() {
    if (state !== "idle") return;
    setState("sending");
    try {
      await fetch("/api/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
    } catch {
      /* even a failed send shouldn't scare a kid — we just thank them */
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
        <Glyph name="check" size={14} /> Thanks, we&apos;ll take a look.
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={report}
      disabled={state === "sending"}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 transition hover:text-rose-600 disabled:opacity-60"
    >
      <Glyph name="flag" size={14} /> {state === "sending" ? "Reporting…" : "Report this story"}
    </button>
  );
}
