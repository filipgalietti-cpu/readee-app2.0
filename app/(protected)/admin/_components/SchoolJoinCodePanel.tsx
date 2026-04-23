"use client";

import { useState, useTransition } from "react";
import { Copy, RefreshCw, Check, KeyRound } from "lucide-react";
import { rotateSchoolJoinCode } from "../actions";

export default function SchoolJoinCodePanel({
  schoolId,
  initialCode,
}: {
  schoolId: string;
  initialCode: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function rotate() {
    if (!confirm("Rotate the school join code? Teachers with the old code will need the new one to link new classrooms.")) return;
    setErr(null);
    start(async () => {
      const res = await rotateSchoolJoinCode({ schoolId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setCode(res.code);
    });
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-violet-950/30">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
        <KeyRound className="h-3.5 w-3.5" />
        School code for teachers
      </div>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-mono text-2xl font-extrabold tracking-[0.25em] text-indigo-700 dark:text-indigo-200">
            {code}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
            Teachers enter this in classroom Settings → School to link their
            class to this school. Works without granting them admin scope.
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-indigo-300 bg-white px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-700 dark:bg-slate-900 dark:text-indigo-300"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={rotate}
            disabled={pending}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-300 bg-white text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-700 dark:bg-slate-900 dark:text-indigo-300"
            aria-label="Rotate code"
            title="Rotate code"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      {err && <p className="mt-2 text-xs font-semibold text-red-600">{err}</p>}
    </div>
  );
}
