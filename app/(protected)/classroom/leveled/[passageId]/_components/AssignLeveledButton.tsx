"use client";

import { useEffect, useState, useTransition } from "react";
import {
  GraduationCap,
  X,
  Check,
  Loader2,
  AlertCircle,
  CalendarDays,
  Layers,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { assignLeveledPassage } from "@/app/(protected)/classroom/actions";

type Level = "easy" | "on_level" | "advanced";
type Classroom = {
  id: string;
  name: string;
  /** If this passage is already assigned to that class, the level it's at. */
  existingLevel: Level | null;
};

const LEVEL_LABEL: Record<Level, string> = {
  easy: "Easy",
  on_level: "On level",
  advanced: "Advanced",
};

export default function AssignLeveledButton({
  passageId,
  defaultLevel,
}: {
  passageId: string;
  defaultLevel: Level;
}) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<Level>(defaultLevel);
  const [classroomId, setClassroomId] = useState<string>("");
  const [dueAt, setDueAt] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  useEffect(() => {
    setLevel(defaultLevel);
  }, [defaultLevel]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    async function load() {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }
      const [{ data: rows }, { data: assigns }] = await Promise.all([
        supabase
          .from("classrooms")
          .select("id, name")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("assignments")
          .select("classroom_id, source_level")
          .eq("source_passage_id", passageId),
      ]);
      const existingByClass = new Map<string, Level>();
      for (const a of (assigns ?? []) as any[]) {
        if (a.source_level) existingByClass.set(a.classroom_id, a.source_level as Level);
      }
      const list: Classroom[] = ((rows ?? []) as any[]).map((c) => ({
        id: c.id as string,
        name: c.name as string,
        existingLevel: existingByClass.get(c.id) ?? null,
      }));
      if (!cancelled) {
        setClassrooms(list);
        // Pre-select first non-conflicting class if any
        const firstFree = list.find((c) => !c.existingLevel);
        if (firstFree) setClassroomId(firstFree.id);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [open, passageId]);

  function close() {
    setOpen(false);
    setErr(null);
    setDoneMsg(null);
  }

  function submit() {
    if (!classroomId) {
      setErr("Pick a classroom.");
      return;
    }
    setErr(null);
    setDoneMsg(null);
    const due = dueAt.trim() ? new Date(dueAt).toISOString() : null;
    start(async () => {
      const res = await assignLeveledPassage({
        passageId,
        level,
        classroomId,
        dueAt: due,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      const cls = classrooms.find((c) => c.id === classroomId);
      setDoneMsg(`Assigned to ${cls?.name ?? "class"} at ${LEVEL_LABEL[level]}.`);
      // Reflect new state locally so the dropdown shows the lock immediately
      setClassrooms((prev) =>
        prev.map((c) =>
          c.id === classroomId ? { ...c, existingLevel: level } : c,
        ),
      );
    });
  }

  const selected = classrooms.find((c) => c.id === classroomId) ?? null;
  const conflict = selected?.existingLevel ?? null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700"
      >
        <GraduationCap className="h-3.5 w-3.5" />
        Assign to my class
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
              className="absolute right-3 top-3 rounded-full p-1 text-zinc-400 hover:bg-zinc-100"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Assign leveled passage
            </h3>
            <p className="mt-0.5 text-sm text-zinc-500">
              One class, one level. A class can&apos;t get two versions of
              the same passage at once.
            </p>

            <label className="mt-4 block text-xs font-semibold text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3 w-3" />
                Reading level
              </span>
              <div className="mt-2 inline-flex w-full rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold">
                {(["easy", "on_level", "advanced"] as Level[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`flex-1 rounded-full px-3 py-1 transition ${
                      level === l
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-zinc-500"
                    }`}
                  >
                    {LEVEL_LABEL[l]}
                  </button>
                ))}
              </div>
            </label>

            <label className="mt-4 block text-xs font-semibold text-zinc-500">
              Classroom
              {loading ? (
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading your classes…
                </div>
              ) : classrooms.length === 0 ? (
                <div className="mt-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  You don&apos;t have any classrooms yet.
                </div>
              ) : (
                <select
                  value={classroomId}
                  onChange={(e) => setClassroomId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-violet-500 focus:outline-none"
                >
                  <option value="" disabled>
                    Choose a class…
                  </option>
                  {classrooms.map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                      disabled={!!c.existingLevel}
                    >
                      {c.name}
                      {c.existingLevel
                        ? ` — already at ${LEVEL_LABEL[c.existingLevel]}`
                        : ""}
                    </option>
                  ))}
                </select>
              )}
            </label>

            {conflict && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                This class is already assigned this passage at{" "}
                {LEVEL_LABEL[conflict]}. Pick a different class or unassign
                from the class page first.
              </div>
            )}

            <label className="mt-4 block text-xs font-semibold text-zinc-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" />
                Due date (optional)
              </span>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm"
              />
            </label>

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
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
              >
                {doneMsg ? "Done" : "Cancel"}
              </button>
              {!doneMsg && (
                <button
                  type="button"
                  onClick={submit}
                  disabled={
                    pending ||
                    classrooms.length === 0 ||
                    !classroomId ||
                    !!conflict
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-60"
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
