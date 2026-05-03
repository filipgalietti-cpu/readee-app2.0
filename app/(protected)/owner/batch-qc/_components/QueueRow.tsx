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
  Volume2,
  Eye,
  ShieldQuestion,
} from "lucide-react";
import { approveQueueItem, rejectQueueItem, flagNeedsEdit } from "../actions";

type ContentPreview = {
  passageTitle?: string | null;
  passageBody?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  questionPrompt?: string | null;
  choices?: string[] | null;
  correct?: string | null;
  hint?: string | null;
};

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
  content_preview?: ContentPreview | null;
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

  // The "auto: ..." prefix on reviewer_note marks system-generated
  // rejection reasons (from decideAutoPromotion). Distinguish from
  // human reviewer notes.
  const autoNote =
    item.reviewer_note?.startsWith("auto:")
      ? item.reviewer_note.replace(/^auto:\s*/, "")
      : null;
  const humanNote = autoNote ? null : item.reviewer_note;

  // Surface the deceptive case: "QC overall = pass, but auto-rejected
  // for fidelity / mcq-balance / etc." Operators were confused why
  // pass-marked items showed up under Rejected.
  const qcPassedButRejected =
    item.status === "rejected" && item.qc_overall === "pass";

  const preview = item.content_preview ?? null;

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
      {/* Auto-rejected-but-QC-passed banner — most confusing case made obvious */}
      {qcPassedButRejected && (
        <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-[11px]">
          <ShieldQuestion className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
          <div className="flex-1">
            <span className="font-bold text-amber-900">
              QC passed but auto-rejected.
            </span>{" "}
            <span className="text-amber-800">
              {autoNote ?? "A downstream gate (fidelity / gameability) blocked promotion."}
            </span>
          </div>
        </div>
      )}

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
            <StatusPill status={item.status} />
            {item.prompt_version && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
                {item.prompt_version}
              </span>
            )}
            <span className="text-zinc-400">{friendlyDate}</span>
          </div>
          <div className="mt-1 line-clamp-2 text-sm font-bold text-zinc-900 dark:text-white">
            {item.title ?? "(untitled)"}
          </div>
          {/* Inline reviewer note (system OR human) for at-a-glance */}
          {(autoNote || humanNote) && !qcPassedButRejected && (
            <div className="mt-1.5 flex items-start gap-1.5 text-[11px]">
              {autoNote ? (
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-600">
                  auto
                </span>
              ) : (
                <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-700">
                  reviewer
                </span>
              )}
              <span className="text-zinc-700 dark:text-slate-300">
                {autoNote ?? humanNote}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-600 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900"
        >
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-100 bg-zinc-50 px-3 py-3 text-xs dark:border-slate-800 dark:bg-slate-950">
          {/* Content preview — the "what we're approving" view */}
          {preview ? (
            <div className="mb-3 space-y-3 rounded-xl bg-white p-3 ring-1 ring-zinc-100">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Content preview
              </div>
              {preview.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.imageUrl}
                  alt=""
                  className="max-h-48 w-full rounded-lg object-contain"
                />
              )}
              {preview.audioUrl && (
                <div className="flex items-center gap-2 rounded-lg bg-violet-50 p-1.5">
                  <Volume2 className="h-3.5 w-3.5 flex-shrink-0 text-violet-600" />
                  <audio controls src={preview.audioUrl} className="h-8 flex-1" />
                </div>
              )}
              {preview.passageTitle && (
                <div className="text-sm font-bold text-zinc-900">
                  {preview.passageTitle}
                </div>
              )}
              {preview.passageBody && (
                <p className="whitespace-pre-line rounded-lg bg-zinc-50 p-2 text-[12px] leading-relaxed text-zinc-800">
                  {preview.passageBody}
                </p>
              )}
              {preview.questionPrompt && (
                <div className="space-y-1.5">
                  <div className="text-[12px] font-semibold text-zinc-900">
                    {preview.questionPrompt}
                  </div>
                  {Array.isArray(preview.choices) && (
                    <ul className="space-y-0.5 text-[11px]">
                      {preview.choices.map((c, i) => {
                        const isCorrect = c === preview.correct;
                        return (
                          <li
                            key={`${i}-${c}`}
                            className={
                              isCorrect
                                ? "rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800"
                                : "px-2 py-0.5 text-zinc-700"
                            }
                          >
                            {String.fromCharCode(65 + i)}. {c}
                            {isCorrect && (
                              <span className="ml-2 text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                                ✓ Correct
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {preview.hint && (
                    <p className="text-[11px] text-zinc-500">
                      Hint: {preview.hint}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-100/40 px-3 py-2 text-[11px] text-zinc-500">
              <Eye className="mr-1 inline h-3 w-3" />
              No content preview persisted (legacy row). New factory output
              ships with a full preview.
            </div>
          )}

          {/* QC checks */}
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
                    <span className="ml-2 text-zinc-700 dark:text-slate-300">
                      {c.message}
                    </span>
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
        </div>
      )}

      {/* Action row — always visible now, not just for needs_review.
          Lets operators force-approve a wrongly-rejected row or pull
          back something that auto-promoted. */}
      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional reviewer note"
          className="flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
        />
        {item.status !== "ready" && (
          <button
            type="button"
            onClick={() => go("approve")}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            {item.status === "rejected" ? "Force-approve" : "Approve"}
          </button>
        )}
        {item.status !== "rejected" && (
          <>
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
          </>
        )}
      </div>

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

function StatusPill({ status }: { status: Item["status"] }) {
  const tone =
    status === "ready"
      ? "bg-emerald-200 text-emerald-900"
      : status === "rejected"
      ? "bg-red-200 text-red-900"
      : "bg-amber-200 text-amber-900";
  const label =
    status === "ready"
      ? "Ready"
      : status === "rejected"
      ? "Rejected"
      : "Needs review";
  return <span className={`rounded-full px-2 py-0.5 ${tone}`}>{label}</span>;
}

function SeverityIcon({ s }: { s: "pass" | "warn" | "fail" }) {
  if (s === "pass")
    return <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />;
  if (s === "warn")
    return <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-600" />;
  return <XCircle className="mt-0.5 h-3.5 w-3.5 text-red-600" />;
}
