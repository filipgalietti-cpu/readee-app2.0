"use client";

import { useState, useTransition } from "react";
import {
  Users2,
  Sparkles,
  Loader2,
  AlertCircle,
  Target,
  X,
  RefreshCw,
} from "lucide-react";
import { generateSmallGroups } from "@/lib/ai/path-actions";

type Group = {
  name: string;
  focus_standard_id: string;
  focus_label: string;
  student_ids: string[];
  suggested_lesson_id: string;
  rationale: string;
};

const ACCENTS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

/**
 * Smart small-groups generator. Teacher hits the button → AI reads
 * recent practice data + proposes 2-4 differentiated rotation groups
 * with a focus standard + suggested lesson per group.
 */
export default function SmallGroupsButton({
  classroomId,
}: {
  classroomId: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [groups, setGroups] = useState<Group[]>([]);
  const [roster, setRoster] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);

  function generate() {
    setErr(null);
    setGroups([]);
    setOpen(true);
    start(async () => {
      const res = await generateSmallGroups({ classroomId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setGroups(res.groups);
      const map: Record<string, string> = {};
      for (const r of res.roster) map[r.id] = r.first_name;
      setRoster(map);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={generate}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-4 py-1.5 text-xs font-bold text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:opacity-60 dark:bg-slate-900 dark:hover:bg-violet-950/30"
      >
        {pending && !open ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Users2 className="h-3.5 w-3.5" />
        )}
        Smart groups
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={pending ? undefined : () => setOpen(false)}
          />
          <div className="relative max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
                  <Sparkles className="h-3 w-3" />
                  Readee.ai
                </div>
                <h3 className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-white">
                  Suggested small groups
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                  Built from the last 30 days of practice data. Use these as
                  rotation groups — Readee picked a focus skill and a lesson
                  for each.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!pending && groups.length > 0 && (
                  <button
                    type="button"
                    onClick={generate}
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-700 hover:bg-zinc-50"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Re-draft
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {pending && (
              <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Reading the class data and grouping…
              </div>
            )}

            {err && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {err}
              </div>
            )}

            {!pending && !err && groups.length > 0 && (
              <div className="mt-5 space-y-4">
                {groups.map((g, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div
                      className={`bg-gradient-to-r ${ACCENTS[i % ACCENTS.length]} px-5 py-3 text-white`}
                    >
                      <div className="flex items-center gap-2">
                        <Users2 className="h-4 w-4" />
                        <h4 className="text-base font-extrabold">{g.name}</h4>
                        <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                          {g.student_ids.length} kids
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-white/85">
                        <Target className="h-3 w-3" />
                        Focus: {g.focus_label} ·{" "}
                        <span className="font-mono">{g.focus_standard_id}</span>
                      </div>
                    </div>
                    <div className="px-5 py-3">
                      <p className="text-xs italic text-zinc-600 dark:text-slate-400">
                        &ldquo;{g.rationale}&rdquo;
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {g.student_ids.map((sid) => (
                          <span
                            key={sid}
                            className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {roster[sid] ?? "Unknown"}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs dark:bg-violet-950/20">
                        <Sparkles className="h-3 w-3 flex-shrink-0 text-violet-600" />
                        <span className="text-violet-900 dark:text-violet-200">
                          Suggested lesson:{" "}
                          <span className="font-mono font-bold">
                            {g.suggested_lesson_id}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="pt-2 text-center text-[11px] text-zinc-400">
                  Re-draft anytime — these aren't saved unless you assign
                  the suggested lessons. (Assign-from-here UI coming soon.)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
