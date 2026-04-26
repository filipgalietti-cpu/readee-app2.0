"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, Loader2 } from "lucide-react";
import {
  markQcReportReviewed,
  reopenQcReport,
} from "@/app/(protected)/admin/qc/actions";

/**
 * Mark-reviewed / reopen control for a QC report. Optional note
 * captures reviewer reasoning ("approved despite warn — passage tone
 * works for this grade") for future audit.
 */
export default function ReviewActions({
  reportId,
  alreadyReviewed,
  existingNote,
}: {
  reportId: string;
  alreadyReviewed: boolean;
  existingNote: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(existingNote ?? "");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function approve() {
    setErr(null);
    start(async () => {
      const res = await markQcReportReviewed({
        reportId,
        note: note.trim() || null,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function reopen() {
    setErr(null);
    start(async () => {
      const res = await reopenQcReport({ reportId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (alreadyReviewed) {
    return (
      <button
        type="button"
        onClick={reopen}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RotateCcw className="h-3.5 w-3.5" />
        )}
        Reopen for review
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
        >
          <Check className="h-3.5 w-3.5" />
          Mark reviewed
        </button>
      ) : (
        <div className="flex w-full max-w-md flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Optional note (for the audit trail)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 400))}
            placeholder="e.g. Approved — warn was a false positive on grade level."
            rows={3}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          />
          {err && (
            <div className="text-xs font-semibold text-red-600">{err}</div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={approve}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
