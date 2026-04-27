"use client";

import { useEffect, useState, useTransition } from "react";
import {
  GraduationCap,
  X,
  Check,
  Loader2,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { assignFluencyPassage } from "@/app/(protected)/classroom/actions";

type Classroom = { id: string; name: string };

/**
 * Teacher-only button on /fluency. Materializes the current passage
 * into a fluency_passages row + creates an assignment per chosen
 * classroom. Anonymous / parent visitors see nothing.
 */
export default function AssignFluencyButton({
  passageTitle,
  passageText,
  gradeLevel,
}: {
  passageTitle: string;
  passageText: string;
  gradeLevel: string;
}) {
  const [eligible, setEligible] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dueAt, setDueAt] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if ((profile as any)?.role !== "educator") return;
      const { data: rows } = await supabase
        .from("classrooms")
        .select("id, name")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      const list = (rows ?? []) as Classroom[];
      if (list.length > 0) {
        setEligible(true);
        setClassrooms(list);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!eligible) return null;

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
    if (!passageText.trim()) {
      setErr("No passage selected.");
      return;
    }
    setErr(null);
    setDoneMsg(null);
    const due = dueAt.trim() ? new Date(dueAt).toISOString() : null;
    start(async () => {
      const res = await assignFluencyPassage({
        title: passageTitle,
        text: passageText,
        gradeLevel,
        classroomIds: Array.from(selected),
        dueAt: due,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setDoneMsg(
        `Assigned to ${res.assignedTo} classroom${res.assignedTo === 1 ? "" : "s"}.`,
      );
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!passageText.trim()}
        className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-4 py-2 text-xs font-bold text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:opacity-50"
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
              Assign fluency reading
            </h3>
            <p className="mt-0.5 text-sm text-zinc-500">
              Students will see <span className="font-semibold">{passageTitle}</span> in
              their assignment queue and read it aloud at home or on a tablet.
            </p>
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
                        ? "border-violet-400 bg-violet-50"
                        : "border-zinc-200 bg-white hover:border-violet-300"
                    }`}
                  >
                    <span className="font-semibold text-zinc-900">{c.name}</span>
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
                  disabled={pending}
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
