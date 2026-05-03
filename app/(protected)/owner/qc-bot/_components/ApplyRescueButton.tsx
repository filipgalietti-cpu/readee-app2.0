"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Check, AlertTriangle, Copy, Loader2 } from "lucide-react";

/**
 * Apply-rescue button for the QC bot dashboard.
 *
 * For URL-rewrite actions (regenerate_audio_with_constraint,
 * regenerate_image_with_constraint), this POSTs to the API and the
 * action runs server-side.
 *
 * For JSON-edit actions (drop_audio, convert_to_X, etc.), the API
 * returns a "run-locally" hint; the button shows the npm command
 * with copy-to-clipboard.
 */
export default function ApplyRescueButton({
  targetId,
  action,
}: {
  targetId: string;
  action: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "running" }
    | { kind: "applied" }
    | { kind: "needs_local"; hint: string }
    | { kind: "error"; error: string }
  >({ kind: "idle" });

  async function apply() {
    setState({ kind: "running" });
    try {
      const res = await fetch("/api/qc/format-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setState({
          kind: "error",
          error: data.error ?? `${res.status}`,
        });
        return;
      }
      if (data.executed) {
        setState({ kind: "applied" });
        router.refresh();
      } else if (data.hint) {
        setState({ kind: "needs_local", hint: data.hint });
      } else {
        setState({ kind: "applied" });
      }
    } catch (e: any) {
      setState({ kind: "error", error: e?.message ?? "request failed" });
    }
  }

  if (state.kind === "applied") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
        <Check className="h-3 w-3" />
        Applied
      </span>
    );
  }
  if (state.kind === "needs_local") {
    return (
      <div className="flex items-center gap-1.5 text-[10px]">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(state.hint).catch(() => {});
          }}
          title={state.hint}
          className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-extrabold uppercase tracking-wider text-amber-800 hover:bg-amber-200"
        >
          <Copy className="h-3 w-3" />
          Copy local cmd
        </button>
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <span
        title={state.error}
        className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-red-700"
      >
        <AlertTriangle className="h-3 w-3" />
        Error
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={apply}
      disabled={state.kind === "running"}
      className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white hover:bg-violet-700 disabled:opacity-60"
    >
      {state.kind === "running" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Wand2 className="h-3 w-3" />
      )}
      Apply
    </button>
  );
}
