"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, School, KeyRound } from "lucide-react";
import { setClassroomSchool, joinSchoolWithCode } from "../../actions";

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
  const [ok, setOk] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [codePending, codeStart] = useTransition();

  const dirty = (value || null) !== (initialSchoolId ?? null);

  function saveSelected() {
    if (!dirty) return;
    setErr(null);
    setOk(null);
    start(async () => {
      const res = await setClassroomSchool({
        classroomId,
        schoolId: value || null,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setOk("Saved");
      router.refresh();
    });
  }

  function joinByCode() {
    setCodeErr(null);
    codeStart(async () => {
      const res = await joinSchoolWithCode({ classroomId, code });
      if (!res.ok) {
        setCodeErr(res.error);
        return;
      }
      setCode("");
      setCodeErr(`Linked to ${res.schoolName}.`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {schools.length > 0 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveSelected();
          }}
          className="space-y-3"
        >
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
              <School className="h-3 w-3" />
              Pick from your schools
            </div>
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
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!dirty || pending}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
            {ok && !pending && !err && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                <Check className="h-3.5 w-3.5" />
                {ok}
              </span>
            )}
            {err && <span className="text-xs font-semibold text-red-600">{err}</span>}
          </div>
        </form>
      )}

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
          <KeyRound className="h-3 w-3" />
          Or enter a school code
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
          Your principal or district admin shares a 6-character school
          code. Enter it to link this class — no admin scope required.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            joinByCode();
          }}
          className="mt-3 flex items-center gap-2"
        >
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().slice(0, 6));
              setCodeErr(null);
            }}
            placeholder="ABCDE1"
            maxLength={6}
            className="w-32 rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-center font-mono text-lg font-extrabold tracking-[0.2em] text-indigo-700 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-200"
          />
          <button
            type="submit"
            disabled={code.length !== 6 || codePending}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
          >
            {codePending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Link
          </button>
        </form>
        {codeErr && (
          <p
            className={`mt-2 text-xs font-semibold ${
              codeErr.startsWith("Linked")
                ? "text-green-600 dark:text-green-400"
                : "text-red-600"
            }`}
          >
            {codeErr}
          </p>
        )}
      </div>
    </div>
  );
}
