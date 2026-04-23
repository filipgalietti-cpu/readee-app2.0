"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, School } from "lucide-react";
import { setClassroomSchool } from "../../actions";

export default function ClassroomSchoolPicker({
  classroomId,
  initialSchoolId,
  schools,
}: {
  classroomId: string;
  initialSchoolId: string | null;
  schools: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialSchoolId ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const dirty = (value || null) !== (initialSchoolId ?? null);

  function save() {
    if (!dirty) return;
    setErr(null);
    setSavedAt(null);
    start(async () => {
      const res = await setClassroomSchool({
        classroomId,
        schoolId: value || null,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  if (schools.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        <div className="flex items-center gap-2 font-semibold text-zinc-700 dark:text-slate-300">
          <School className="h-4 w-4" />
          No school scopes yet
        </div>
        <p className="mt-1 text-xs">
          A school or district admin needs to invite you into a scope before
          you can link this class. If your district signed up, email{" "}
          <a className="font-semibold text-indigo-600 underline" href="mailto:hello@readee.app">
            hello@readee.app
          </a>{" "}
          for setup.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-3"
    >
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <option value="">Not linked to a school</option>
        {schools.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!dirty || pending}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
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
