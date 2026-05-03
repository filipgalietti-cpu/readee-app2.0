"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, RotateCcw, Loader2 } from "lucide-react";

type Status = "open" | "fixed" | "wont_fix" | "duplicate";

/** Per-finding action row — Mark fixed / Won't fix / Reopen.
 *  Posts to /api/qc/audit-findings and refreshes the server component
 *  so counts + filter results stay in sync. */
export default function FindingActions({
  findingId,
  currentStatus,
}: {
  findingId: string;
  currentStatus: Status;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function update(next: Status) {
    setErr(null);
    start(async () => {
      const res = await fetch("/api/qc/audit-findings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [findingId], status: next }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
      {currentStatus === "open" ? (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => update("fixed")}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Mark fixed
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => update("wont_fix")}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 font-semibold text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-50"
          >
            <X className="h-3 w-3" />
            Won&apos;t fix
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => update("open")}
          className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
          Reopen
        </button>
      )}
      {err && <span className="text-[11px] font-semibold text-red-600">{err}</span>}
    </div>
  );
}
