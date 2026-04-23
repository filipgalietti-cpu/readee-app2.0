"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X, Check } from "lucide-react";
import { updateClassroomStudent } from "../../actions";

const GRADES = [
  { v: "", label: "—" },
  { v: "pre-k", label: "Pre-K" },
  { v: "kindergarten", label: "Kindergarten" },
  { v: "1st", label: "1st" },
  { v: "2nd", label: "2nd" },
  { v: "3rd", label: "3rd" },
  { v: "4th", label: "4th" },
];

export default function EditStudentButton({
  studentId,
  firstName,
  grade,
  ownerType,
}: {
  studentId: string;
  firstName: string;
  grade: string | null;
  ownerType: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(firstName);
  const [g, setG] = useState(grade ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (ownerType !== "classroom") {
    return (
      <span className="text-[11px] text-zinc-400" title="Parent-managed student">
        —
      </span>
    );
  }

  function save() {
    setErr(null);
    start(async () => {
      const res = await updateClassroomStudent({
        studentId,
        firstName: name.trim(),
        grade: g || null,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-7 items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 text-[11px] font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        title={`Edit ${firstName}`}
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Edit student</h3>
          <button
            onClick={() => setOpen(false)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
              First name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
              Grade
            </span>
            <select
              value={g}
              onChange={(e) => setG(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {GRADES.map((o) => (
                <option key={o.v || "none"} value={o.v}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {err && <p className="mt-3 text-xs font-semibold text-red-600">{err}</p>}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending || !name.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
