"use client";

import { useState, useTransition } from "react";
import {
  Check,
  X,
  Pencil,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { approveQueueItem, rejectQueueItem, flagNeedsEdit } from "../actions";

type Item = {
  id: string;
  asset_kind: string;
  asset_ref: { table?: string; id?: string };
  source: string;
  prompt_version: string | null;
  standard_id: string | null;
  status: "ready" | "needs_review" | "rejected";
  qc_overall: "pass" | "warn" | "fail" | null;
  qc_report: any;
  title: string | null;
  thumbnail_url: string | null;
  reviewed_at: string | null;
  reviewer_verdict: "approve" | "reject" | "needs_edit" | null;
  reviewer_note: string | null;
  created_at: string;
};

export default function QueueRow({
  item,
  assetKindLabel,
}: {
  item: Item;
  assetKindLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const checks = (item.qc_report?.checks ?? []) as {
    name: string;
    severity: "pass" | "warn" | "fail";
    message: string;
  }[];

  function go(action: "approve" | "reject" | "needs_edit") {
    setErr(null);
    start(async () => {
      const fn =
        action === "approve"
          ? approveQueueItem
          : action === "reject"
          ? rejectQueueItem
          : flagNeedsEdit;
      const res = await fn({ queueId: item.id, note: note.trim() || null });
      if (!res.ok) setErr(res.error);
    });
  }

  const friendlyDate = (() => {
    const d = new Date(item.created_at);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60_000);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  })();

  return (
    <li
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition dark:bg-slate-900 ${
        item.status === "rejected"
          ? "border-red-200"
          : item.status === "ready"
          ? "border-emerald-200"
          : "border-amber-200"
      }`}
    >
      <div className="flex flex-wrap items-start gap-3 p-3">
        {item.thumbnail_url && (
          <img
            src={item.thumbnail_url}
            alt=""
            className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
            loading="lazy"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-800">
              {assetKindLabel}
            </span>
            {item.standard_id && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-mono text-indigo-800">
                {item.standard_id}
              </span>
            )}
            <QcPill severity={item.qc_overall} />
            {item.prompt_version && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
                {item.prompt_version}
              </span>
            )}
            <span className="text-zinc-400">{friendlyDate}</span>
          </div>
          <div className="mt-1 truncate text-sm font-bold text-zinc-900 dark:text-white">
            {item.title ?? "(untitled)"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-600 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900"
        >
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          QC
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-100 bg-zinc-50 px-3 py-3 text-xs dark:border-slate-800 dark:bg-slate-950">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            QC checks
          </div>
          <ul className="mt-2 space-y-1">
            {checks.length === 0 ? (
              <li className="text-zinc-500">No QC report attached.</li>
            ) : (
              checks.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <SeverityIcon s={c.severity} />
                  <div>
                    <span className="font-mono text-[10px] font-bold text-zinc-600">
                      {c.name}
                    </span>
                    <span className="ml-2 text-zinc-700 dark:text-slate-300">{c.message}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
          {item.asset_ref?.table && item.asset_ref?.id && (
            <div className="mt-3 text-[10px] text-zinc-500 dark:text-slate-500">
              Asset:{" "}
              <span className="font-mono">
                {item.asset_ref.table}/{item.asset_ref.id}
              </span>
            </div>
          )}
          {item.reviewer_note && (
            <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-2 text-[11px] dark:border-slate-700 dark:bg-slate-900">
              <span className="font-bold text-zinc-600">Reviewer note:</span>{" "}
              {item.reviewer_note}
            </div>
          )}
        </div>
      )}

      {item.status === "needs_review" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional review note"
            className="flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            type="button"
            onClick={() => go("approve")}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Approve
          </button>
          <button
            type="button"
            onClick={() => go("needs_edit")}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
          >
            <Pencil className="h-3 w-3" />
            Needs edit
          </button>
          <button
            type="button"
            onClick={() => go("reject")}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-[11px] font-bold text-red-800 hover:bg-red-100 disabled:opacity-50"
          >
            <X className="h-3 w-3" />
            Reject
          </button>
        </div>
      )}

      {err && (
        <div className="border-t border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700">
          {err}
        </div>
      )}
    </li>
  );
}

function QcPill({ severity }: { severity: "pass" | "warn" | "fail" | null }) {
  if (!severity) return null;
  const tone =
    severity === "pass"
      ? "bg-emerald-100 text-emerald-800"
      : severity === "warn"
      ? "bg-amber-100 text-amber-800"
      : "bg-red-100 text-red-800";
  return (
    <span className={`rounded-full px-2 py-0.5 ${tone}`}>QC {severity}</span>
  );
}

function SeverityIcon({ s }: { s: "pass" | "warn" | "fail" }) {
  if (s === "pass") return <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />;
  if (s === "warn") return <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-600" />;
  return <XCircle className="mt-0.5 h-3.5 w-3.5 text-red-600" />;
}
