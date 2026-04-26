"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  X,
  Check,
  Loader2,
  AlertCircle,
  CalendarDays,
  Target,
} from "lucide-react";
import { createAssignment } from "@/app/(protected)/classroom/actions";

type Classroom = { id: string; name: string };

/**
 * In-place assign-to-class flow opened from the quiz builder.
 *
 * Lets the teacher pick one or many classrooms, set an optional due
 * date + pass threshold, and create the assignment without leaving the
 * builder. After success, surfaces a toast-ish confirmation with a
 * link into the first targeted classroom so they can see the kid view.
 */
export default function AssignQuizDialog({
  quizId,
  quizTitle,
  classrooms,
  variant = "primary",
  label = "Assign to a class",
}: {
  quizId: string;
  quizTitle: string;
  classrooms: Classroom[];
  variant?: "primary" | "ghost";
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dueAt, setDueAt] = useState<string>("");
  const [passThreshold, setPassThreshold] = useState<string>("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function close() {
    setOpen(false);
    setErr(null);
    setDoneMsg(null);
  }

  function submit() {
    if (selected.size === 0) {
      setErr("Pick at least one classroom.");
      return;
    }
    setErr(null);
    setDoneMsg(null);
    const due =
      dueAt.trim().length > 0 ? new Date(dueAt).toISOString() : null;
    const threshold = (() => {
      const n = parseInt(passThreshold, 10);
      if (Number.isFinite(n) && n >= 0 && n <= 100) return n;
      return null;
    })();

    start(async () => {
      const ids = Array.from(selected);
      const failures: string[] = [];
      for (const cid of ids) {
        const res = await createAssignment({
          classroomId: cid,
          kind: "custom_quiz",
          sourceId: quizId,
          title: quizTitle,
          dueAt: due,
          passThreshold: threshold,
        });
        if (!res.ok) {
          const cn = classrooms.find((c) => c.id === cid)?.name ?? "Classroom";
          failures.push(`${cn}: ${res.error}`);
        }
      }
      if (failures.length === ids.length) {
        setErr(failures.join(" · "));
        return;
      }
      const successCount = ids.length - failures.length;
      setDoneMsg(
        `Assigned to ${successCount} classroom${successCount === 1 ? "" : "s"}.${
          failures.length ? ` (${failures.length} failed)` : ""
        }`,
      );
      // Soft refresh so the dashboard / classroom view updates if open.
      router.refresh();
    });
  }

  const triggerCls =
    variant === "primary"
      ? "inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700"
      : "inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerCls}
      >
        <GraduationCap className="h-3.5 w-3.5" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={pending ? undefined : close}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Assign quiz
            </h3>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-slate-400">
              Pick the classrooms that should see <span className="font-semibold">{quizTitle}</span>.
            </p>

            {classrooms.length === 0 ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                You don&apos;t have any classrooms yet. Create one first, then come
                back and assign.
              </div>
            ) : (
              <div className="mt-4 space-y-1.5">
                {classrooms.map((c) => {
                  const isSel = selected.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggle(c.id)}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                        isSel
                          ? "border-violet-400 bg-violet-50 dark:border-violet-500 dark:bg-violet-950/30"
                          : "border-zinc-200 bg-white hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900"
                      }`}
                    >
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {c.name}
                      </span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          isSel
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-zinc-300 bg-white"
                        }`}
                      >
                        {isSel && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" />
                  Due date (optional)
                </span>
                <input
                  type="date"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Target className="h-3 w-3" />
                  Pass threshold % (optional)
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  value={passThreshold}
                  onChange={(e) => setPassThreshold(e.target.value)}
                  placeholder="e.g. 70"
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
            </div>

            {err && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {err}
              </div>
            )}
            {doneMsg && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {doneMsg}
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                {doneMsg ? "Done" : "Cancel"}
              </button>
              {!doneMsg && (
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending || classrooms.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Assigning…
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-3.5 w-3.5" />
                      Assign
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
