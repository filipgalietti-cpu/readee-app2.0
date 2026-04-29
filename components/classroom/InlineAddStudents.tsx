"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Loader2,
  Plus,
  Check,
  AlertCircle,
  School,
  X,
} from "lucide-react";
import { createClassroomStudents } from "@/app/(protected)/classroom/invite-actions";

type Classroom = { id: string; name: string; gradeLevel?: string | null };

const GRADES = ["K", "1st", "2nd", "3rd", "4th"] as const;

/**
 * Reusable inline "add students" form. Drop into any empty state where
 * the teacher hits "no roster yet" and wants to seed kids without
 * leaving the page. Skips parent invites entirely, just creates
 * classroom-owned student profiles + memberships.
 *
 * If the teacher owns more than one classroom we let them pick which
 * one to add to. If exactly one, we skip the picker.
 *
 * The empty state CTA pattern: render <InlineAddStudents /> with a
 * `compact` prop set to true. It opens an inline mini-form on click,
 * not a full modal — minimal context switch.
 */
export default function InlineAddStudents({
  classrooms,
  defaultClassroomId,
  onCreated,
  compact = false,
}: {
  classrooms: Classroom[];
  defaultClassroomId?: string;
  onCreated?: (createdCount: number) => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(!compact);
  const [classroomId, setClassroomId] = useState(
    defaultClassroomId ?? classrooms[0]?.id ?? "",
  );
  const [names, setNames] = useState<string>("");
  // Grade for the whole batch. Defaults to the picked classroom's
  // grade_level when known so the common case is one click.
  const [grade, setGrade] = useState<string>(() => {
    const start =
      classrooms.find((c) => c.id === (defaultClassroomId ?? classrooms[0]?.id))
        ?.gradeLevel ?? "";
    return start && GRADES.includes(start as any) ? start : "";
  });
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  if (classrooms.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        Create a classroom first, then add students.
      </div>
    );
  }

  function submit() {
    setErr(null);
    setDoneMsg(null);
    const list = names
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) {
      setErr("Type at least one student's first name.");
      return;
    }
    start(async () => {
      const res = await createClassroomStudents({
        classroomId,
        students: list.map((firstName) => ({
          firstName,
          grade: grade || null,
        })),
        source: "manual",
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setDoneMsg(`Added ${res.created} student${res.created === 1 ? "" : "s"}.`);
      setNames("");
      onCreated?.(res.created);
      router.refresh();
    });
  }

  if (compact && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Add students
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
          <UserPlus className="h-3 w-3" />
          Add students
        </div>
        {compact && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {classrooms.length > 1 && (
        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          <span className="flex items-center gap-1.5">
            <School className="h-3 w-3" />
            Which classroom
          </span>
          <select
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            disabled={pending}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-60"
          >
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="mt-3 block text-xs font-semibold text-zinc-500">
        Grade (applies to all students in this batch)
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          disabled={pending}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-60"
        >
          <option value="">(use classroom default)</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 block text-xs font-semibold text-zinc-500">
        First names (one per line, or comma-separated)
        <textarea
          rows={3}
          value={names}
          onChange={(e) => setNames(e.target.value)}
          disabled={pending}
          placeholder={"Lily\nMarcus\nAisha"}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-60"
        />
      </label>

      {err && (
        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
          {err}
        </div>
      )}
      {doneMsg && (
        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700">
          <Check className="mt-0.5 h-3 w-3 flex-shrink-0" />
          {doneMsg}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Adding…
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Add to roster
            </>
          )}
        </button>
      </div>
    </div>
  );
}
