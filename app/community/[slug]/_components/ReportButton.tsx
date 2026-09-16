"use client";

import { useState } from "react";
import { Glyph } from "@/app/_components/Glyph";
import { REPORT_REASONS } from "@/lib/community/report-policy";

type State = "idle" | "asking" | "sending" | "done";

/**
 * Report a published story. Kid-simple: one tap asks what is wrong, a second
 * tap on a reason files the report for the Readee team. The reason is the
 * signal that a person, not a stray tap or a crawler, is asking for a look.
 */
export default function ReportButton({ slug }: { slug: string }) {
  const [state, setState] = useState<State>("idle");

  async function report(reason: string) {
    if (state === "sending" || state === "done") return;
    setState("sending");
    try {
      await fetch("/api/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, reason }),
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

  if (state === "asking" || state === "sending") {
    const sending = state === "sending";
    return (
      <span
        className="inline-flex flex-wrap items-center justify-end gap-1.5 text-xs font-semibold text-zinc-500"
        role="group"
        aria-label="What is wrong with this story?"
      >
        <span>{sending ? "Sending…" : "What’s wrong?"}</span>
        {REPORT_REASONS.map((reason) => (
          <button
            key={reason}
            type="button"
            disabled={sending}
            onClick={() => report(reason)}
            className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-600 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-60"
          >
            {reason}
          </button>
        ))}
        <button
          type="button"
          disabled={sending}
          onClick={() => setState("idle")}
          className="text-zinc-400 underline underline-offset-2 transition hover:text-zinc-600 disabled:opacity-60"
        >
          Never mind
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setState("asking")}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 transition hover:text-rose-600"
    >
      <Glyph name="flag" size={14} /> Report this story
    </button>
  );
}
