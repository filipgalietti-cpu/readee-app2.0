"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ImageOff,
} from "lucide-react";
import { approveCommunity, rejectCommunity } from "../actions";

type Item = {
  id: string;
  title: string;
  passage_text: string;
  questions: any[] | null;
  image_url: string | null;
  grade_level: string;
  topic: string;
  phonics_pattern: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  source_parent_id: string;
};

export default function CommunityReviewList({
  items,
  currentStatus,
}: {
  items: Item[];
  currentStatus: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-zinc-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <p className="text-sm text-zinc-500 dark:text-slate-400">
          Nothing in the <strong>{currentStatus}</strong> queue.
        </p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <ReviewCard key={item.id} item={item} />
      ))}
    </ul>
  );
}

function ReviewCard({ item }: { item: Item }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function approve() {
    setErr(null);
    start(async () => {
      const res = await approveCommunity({ communityId: item.id });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  function reject() {
    if (!reason.trim()) return setErr("Add a short reason for the parent.");
    setErr(null);
    start(async () => {
      const res = await rejectCommunity({
        communityId: item.id,
        reason: reason.trim(),
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-start gap-4">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt=""
            className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-slate-800 dark:text-slate-500">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
              {item.grade_level}
            </span>
            {item.phonics_pattern && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                {item.phonics_pattern}
              </span>
            )}
            <span className="text-[11px] text-zinc-400">
              {new Date(item.created_at).toLocaleString()}
            </span>
          </div>
          <h3 className="mt-1 truncate text-base font-bold text-zinc-900 dark:text-white">
            {item.title}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-slate-400">
            Topic: {item.topic}
          </p>
          {item.rejection_reason && (
            <p className="mt-1 text-xs font-semibold text-red-600">
              Rejected: {item.rejection_reason}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Hide" : "View"} passage
              {item.questions && item.questions.length > 0
                ? ` + ${item.questions.length} Qs`
                : ""}
            </button>
            {item.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={approve}
                  disabled={pending}
                  className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {pending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setRejectMode(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-3 py-1 text-[11px] font-bold text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-300"
                >
                  <XCircle className="h-3 w-3" />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="whitespace-pre-line rounded-xl bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-800 dark:bg-slate-950/50 dark:text-slate-200">
            {item.passage_text}
          </div>
          {Array.isArray(item.questions) && item.questions.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
                Questions
              </div>
              {item.questions.map((q: any, i: number) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="font-semibold text-zinc-900 dark:text-white">
                    Q{i + 1}. {q.prompt}
                  </div>
                  {Array.isArray(q.choices) && (
                    <ul className="mt-1 space-y-0.5 text-xs">
                      {q.choices.map((c: string) => (
                        <li
                          key={c}
                          className={
                            c === q.correct
                              ? "font-semibold text-green-700 dark:text-green-300"
                              : "text-zinc-600 dark:text-slate-400"
                          }
                        >
                          {c === q.correct ? "✓ " : "  "}
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {rejectMode && (
        <div className="mt-4 space-y-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/20">
          <label className="block">
            <span className="text-xs font-bold text-red-800 dark:text-red-300">
              Reason (shown to the parent)
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="e.g. Contains specific real-world references; please regenerate."
              className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm focus:border-red-400 focus:outline-none dark:border-red-900/50 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setRejectMode(false);
                setReason("");
              }}
              className="rounded-full px-3 py-1 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={reject}
              disabled={pending || !reason.trim()}
              className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
              Confirm reject
            </button>
          </div>
        </div>
      )}

      {err && (
        <p className="mt-2 text-xs font-semibold text-red-600">{err}</p>
      )}
    </li>
  );
}
