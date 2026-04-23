"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { updateClassroom } from "../../actions";
import type { GradeLevel } from "@/lib/db/types";

const GRADE_OPTIONS: { value: GradeLevel | ""; label: string }[] = [
  { value: "", label: "No grade set" },
  { value: "K", label: "Kindergarten" },
  { value: "1st", label: "1st grade" },
  { value: "2nd", label: "2nd grade" },
  { value: "3rd", label: "3rd grade" },
  { value: "4th", label: "4th grade" },
  { value: "Mixed", label: "Mixed grades" },
];

export default function ClassroomSettingsForm({
  classroomId,
  initialName,
  initialGradeLevel,
}: {
  classroomId: string;
  initialName: string;
  initialGradeLevel: GradeLevel | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | "">(initialGradeLevel ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const dirty = name.trim() !== initialName || (gradeLevel || null) !== (initialGradeLevel ?? null);

  function submit() {
    if (!dirty) return;
    setErr(null);
    setSavedAt(null);
    start(async () => {
      const res = await updateClassroom({
        classroomId,
        name: name.trim(),
        gradeLevel: (gradeLevel || null) as GradeLevel | null,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Class name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Grade level
        </label>
        <select
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value as GradeLevel | "")}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {GRADE_OPTIONS.map((o) => (
            <option key={o.value || "none"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={!dirty || pending}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </button>
        {savedAt && !pending && !err && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
        {err && <span className="text-xs font-semibold text-red-600">{err}</span>}
      </div>
    </form>
  );
}
