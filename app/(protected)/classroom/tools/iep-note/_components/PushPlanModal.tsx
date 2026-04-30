"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  X,
  CircleCheck,
  CircleAlert,
  Send,
  AlertCircle,
  User,
  Lock,
} from "lucide-react";

type SessionResolution = {
  index: number;
  session: {
    dayLabel: string;
    activity: string;
    materialHint: string;
    materialKind: "lesson" | "passage" | "fluency_probe" | "teacher_led";
    weekLabel: string;
  };
  resolution:
    | {
        assignable: true;
        assignmentKind: "readee_lesson";
        sourceId: string;
        title: string;
        standardId: string;
        grade: string | null;
        confidence: "exact" | "approx";
        reason?: string;
      }
    | {
        assignable: false;
        reason: string;
        kind: string;
      };
  scheduledDate: string | null;
};

function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function formatLongDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Preview = {
  ok: true;
  planId: string;
  childId: string;
  childFirstName: string;
  sessions: SessionResolution[];
  eligibleClassrooms: { id: string; name: string }[];
  startDate: string | null;
  endDate: string | null;
};

export default function PushPlanModal({
  planId,
  onClose,
  onPushed,
}: {
  planId: string;
  onClose: () => void;
  onPushed: (count: number) => void;
}) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [classroomId, setClassroomId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [pushing, setPushing] = useState(false);
  const [pushErr, setPushErr] = useState<string | null>(null);

  // Re-resolve whenever the start date changes so per-session dates
  // recompute. The first call uses the plan's stored start_date; later
  // calls send the teacher's edited startDate so the dates land on
  // weekdays from that point forward.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/iep-plan/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, startDate }),
        });
        const json = await res.json();
        if (!alive) return;
        if (!json.ok) {
          setLoadErr(json.error ?? "Couldn't resolve plan.");
          return;
        }
        setPreview(json as Preview);
        // Only seed classroom + startDate from the response on the
        // first load — don't overwrite the teacher's edits.
        setClassroomId((prev) => prev || json.eligibleClassrooms?.[0]?.id || "");
      } catch (e: any) {
        if (alive) setLoadErr(e?.message ?? "Couldn't load preview.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [planId, startDate]);

  async function push() {
    if (!preview || !classroomId) return;
    setPushErr(null);
    setPushing(true);
    try {
      const res = await fetch("/api/iep-plan/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, classroomId, startDate }),
      });
      const json = await res.json();
      if (!json.ok) {
        setPushErr(json.error ?? "Couldn't push assignments.");
        return;
      }
      onPushed(json.pushedCount ?? 0);
    } catch (e: any) {
      setPushErr(e?.message ?? "Couldn't push assignments.");
    } finally {
      setPushing(false);
    }
  }

  const assignableCount = preview?.sessions.filter((s) => s.resolution.assignable).length ?? 0;
  const skippedCount = (preview?.sessions.length ?? 0) - assignableCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={pushing ? undefined : onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-slate-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Push plan to assignments
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={pushing}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!preview && !loadErr && (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Matching sessions to lessons…
          </div>
        )}

        {loadErr && (
          <div className="flex items-start gap-2 m-5 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {loadErr}
          </div>
        )}

        {preview && (
          <>
            <div className="space-y-4 overflow-y-auto p-5">
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/40 dark:bg-violet-950/30">
                <div className="flex items-center gap-2 rounded-xl border border-violet-300 bg-white px-3 py-2 dark:border-violet-900/40 dark:bg-slate-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                      Pushing to one student only
                    </div>
                    <div className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                      {preview.childFirstName}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
                    <Lock className="h-3 w-3" />
                    private
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-violet-700 dark:text-violet-300">
                  Only {preview.childFirstName} sees these assignments — classmates
                  in the same room will not. The classroom below is just where the
                  assignments are organized.
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-violet-700 dark:text-violet-300">
                    Classroom (organization only)
                    <select
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-violet-300 bg-white px-2 py-2 text-sm focus:border-violet-500 focus:outline-none dark:border-violet-900/40 dark:bg-slate-900 dark:text-white"
                    >
                      {preview.eligibleClassrooms.length === 0 ? (
                        <option value="">No eligible classroom</option>
                      ) : (
                        preview.eligibleClassrooms.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))
                      )}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-violet-700 dark:text-violet-300">
                    Start date
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-violet-300 bg-white px-2 py-2 text-sm focus:border-violet-500 focus:outline-none dark:border-violet-900/40 dark:bg-slate-900 dark:text-white"
                    />
                  </label>
                </div>
                {preview.eligibleClassrooms.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    {preview.childFirstName} isn&apos;t in any of your classrooms.
                    Add them first, then push.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                    <CircleCheck className="h-3 w-3" />
                    {assignableCount} will be assigned
                  </span>
                  {skippedCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                      <CircleAlert className="h-3 w-3" />
                      {skippedCount} teacher-led / unmatched
                    </span>
                  )}
                  {preview.startDate && preview.endDate && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-bold text-violet-800 dark:bg-slate-900 dark:text-violet-200">
                      {formatLongDate(preview.startDate)} → {formatLongDate(preview.endDate)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-violet-600 dark:text-violet-400">
                  Sessions land on weekdays only — Saturdays and Sundays are skipped.
                </p>
              </div>

              {(() => {
                // Group sessions by weekLabel so two days with the same
                // "Day 1" label don't sit next to each other ambiguously.
                const groups: { weekLabel: string; items: SessionResolution[] }[] = [];
                for (const s of preview.sessions) {
                  const wl = s.session.weekLabel || "Sessions";
                  const last = groups[groups.length - 1];
                  if (last && last.weekLabel === wl) last.items.push(s);
                  else groups.push({ weekLabel: wl, items: [s] });
                }
                return (
                  <div className="space-y-4">
                    {groups.map((g, gi) => (
                      <div key={gi}>
                        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                          {g.weekLabel}
                        </div>
                        <ul className="space-y-2">
                          {g.items.map((s) => {
                            const r = s.resolution;
                            const ok = r.assignable;
                            return (
                              <li
                                key={s.index}
                                className={`rounded-xl border px-3 py-2 text-xs ${
                                  ok
                                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                                    : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {ok ? (
                                    <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                                  ) : (
                                    <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-baseline gap-1.5">
                                      <span className="font-bold text-zinc-800 dark:text-slate-200">
                                        {s.session.dayLabel}
                                      </span>
                                      {s.scheduledDate && (
                                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-slate-900 dark:text-violet-300">
                                          {formatShortDate(s.scheduledDate)}
                                        </span>
                                      )}
                                      <span className="text-zinc-500 dark:text-slate-400">
                                        {s.session.activity}
                                      </span>
                                    </div>
                                    {ok ? (
                                      <div className="mt-1 text-emerald-800 dark:text-emerald-300">
                                        → <span className="font-semibold">{r.title}</span>{" "}
                                        <span className="font-mono text-[10px] text-emerald-600">
                                          {r.standardId}
                                        </span>
                                        {r.confidence === "approx" && (
                                          <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                                            approx
                                          </span>
                                        )}
                                        {r.reason && (
                                          <div className="text-[10px] text-emerald-700/80">
                                            {r.reason}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="mt-1 text-amber-800 dark:text-amber-300">
                                        {r.reason}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {pushErr && (
              <div className="mx-5 mb-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5" />
                {pushErr}
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={onClose}
                disabled={pushing}
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-white disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={push}
                disabled={pushing || !classroomId || assignableCount === 0}
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {pushing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Push {assignableCount} assignment{assignableCount === 1 ? "" : "s"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
