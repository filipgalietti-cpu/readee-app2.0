"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  X,
  Check,
  Loader2,
  AlertCircle,
  CalendarDays,
  Target,
  Users,
  User,
} from "lucide-react";
import { createAssignment } from "@/app/(protected)/classroom/actions";

type Child = { id: string; first_name: string };
type Classroom = { id: string; name: string; children?: Child[] };

type Mode = "all" | "students";

type Selection = {
  selected: boolean;
  mode: Mode;
  childIds: Set<string>;
};

/**
 * In-place assign-to-class flow opened from the quiz builder.
 *
 * Per classroom the teacher can choose:
 *   - "Whole class" (default), assignment is visible to every student
 *   - "Specific students", checkbox list of children in that classroom
 *
 * Optional due date + pass threshold apply across the picked classrooms.
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
  const [picks, setPicks] = useState<Map<string, Selection>>(() => new Map());
  const [dueAt, setDueAt] = useState<string>("");
  const [passThreshold, setPassThreshold] = useState<string>("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  function getSel(id: string): Selection {
    return (
      picks.get(id) ?? { selected: false, mode: "all", childIds: new Set() }
    );
  }

  function updateSel(id: string, fn: (s: Selection) => Selection) {
    setPicks((prev) => {
      const next = new Map(prev);
      const current =
        prev.get(id) ?? { selected: false, mode: "all", childIds: new Set() };
      next.set(id, fn(current));
      return next;
    });
  }

  function toggleClassroom(id: string) {
    updateSel(id, (s) => ({ ...s, selected: !s.selected }));
  }

  function setMode(id: string, mode: Mode) {
    updateSel(id, (s) => ({ ...s, mode, selected: true }));
  }

  function toggleChild(classroomId: string, childId: string) {
    updateSel(classroomId, (s) => {
      const next = new Set(s.childIds);
      if (next.has(childId)) next.delete(childId);
      else next.add(childId);
      return { ...s, mode: "students", selected: true, childIds: next };
    });
  }

  const selectedCount = useMemo(
    () => Array.from(picks.values()).filter((s) => s.selected).length,
    [picks],
  );

  function close() {
    setOpen(false);
    setErr(null);
    setDoneMsg(null);
  }

  function submit() {
    const targets = classrooms.filter((c) => getSel(c.id).selected);
    if (targets.length === 0) {
      setErr("Pick at least one classroom.");
      return;
    }
    // Validate per-classroom: if mode=students, must pick at least one kid.
    for (const c of targets) {
      const s = getSel(c.id);
      if (s.mode === "students" && s.childIds.size === 0) {
        setErr(`Pick at least one student in ${c.name}, or switch to "Whole class".`);
        return;
      }
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
      const failures: string[] = [];
      let successCount = 0;
      for (const c of targets) {
        const s = getSel(c.id);
        const assignedChildIds =
          s.mode === "students" ? Array.from(s.childIds) : null;
        const res = await createAssignment({
          classroomId: c.id,
          kind: "custom_quiz",
          sourceId: quizId,
          title: quizTitle,
          dueAt: due,
          passThreshold: threshold,
          assignedChildIds,
        });
        if (!res.ok) {
          failures.push(`${c.name}: ${res.error}`);
        } else {
          successCount++;
        }
      }
      if (failures.length === targets.length) {
        setErr(failures.join(" · "));
        return;
      }
      const detailParts = targets
        .filter((c) => getSel(c.id).selected)
        .slice(0, 3)
        .map((c) => {
          const s = getSel(c.id);
          if (s.mode === "students") return `${c.name} (${s.childIds.size})`;
          return c.name;
        });
      setDoneMsg(
        `Assigned to ${successCount} classroom${successCount === 1 ? "" : "s"}: ${detailParts.join(", ")}${
          failures.length ? ` · ${failures.length} failed` : ""
        }`,
      );
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
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
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
              Pick where <span className="font-semibold">{quizTitle}</span> shows up.
            </p>

            {classrooms.length === 0 ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                You don&apos;t have any classrooms yet. Create one first, then come
                back and assign.
              </div>
            ) : (
              <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                {classrooms.map((c) => {
                  const sel = getSel(c.id);
                  return (
                    <div
                      key={c.id}
                      className={`rounded-xl border transition ${
                        sel.selected
                          ? "border-violet-400 bg-violet-50/40 dark:border-violet-500 dark:bg-violet-950/20"
                          : "border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleClassroom(c.id)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm"
                      >
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {c.name}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            {(c.children ?? []).length} student{(c.children ?? []).length === 1 ? "" : "s"}
                          </span>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              sel.selected
                                ? "border-violet-600 bg-violet-600 text-white"
                                : "border-zinc-300 bg-white"
                            }`}
                          >
                            {sel.selected && <Check className="h-3 w-3" />}
                          </span>
                        </span>
                      </button>

                      {sel.selected && (
                        <div className="border-t border-violet-200/60 px-3 py-2 dark:border-violet-900/40">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => setMode(c.id, "all")}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold transition ${
                                sel.mode === "all"
                                  ? "bg-violet-600 text-white"
                                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              <Users className="h-3 w-3" />
                              Whole class
                            </button>
                            <button
                              type="button"
                              onClick={() => setMode(c.id, "students")}
                              disabled={(c.children ?? []).length === 0}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                sel.mode === "students"
                                  ? "bg-violet-600 text-white"
                                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              <User className="h-3 w-3" />
                              Specific students
                            </button>
                          </div>

                          {sel.mode === "students" && (
                            <div className="mt-2">
                              {(c.children ?? []).length === 0 ? (
                                <p className="text-[11px] text-zinc-500">
                                  No students in this class yet.
                                </p>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {(c.children ?? []).map((kid) => {
                                    const isOn = sel.childIds.has(kid.id);
                                    return (
                                      <button
                                        key={kid.id}
                                        type="button"
                                        onClick={() => toggleChild(c.id, kid.id)}
                                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition ${
                                          isOn
                                            ? "border-violet-500 bg-violet-100 text-violet-800 dark:border-violet-500 dark:bg-violet-950/40 dark:text-violet-200"
                                            : "border-zinc-200 bg-white text-zinc-600 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                        }`}
                                      >
                                        {isOn && <Check className="h-2.5 w-2.5" />}
                                        {kid.first_name}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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

            <div className="mt-5 flex items-center justify-between gap-2">
              <span className="text-[11px] text-zinc-400">
                {selectedCount} classroom{selectedCount === 1 ? "" : "s"} picked
              </span>
              <div className="flex items-center gap-2">
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
        </div>
      )}
    </>
  );
}
