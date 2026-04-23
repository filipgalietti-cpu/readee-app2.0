"use client";

import { useState, useTransition } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import { rotateJoinCode } from "../../actions";

export default function JoinCodePanel({
  classroomId,
  initialCode,
}: {
  classroomId: string;
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
    if (!confirm("Rotate the join code? The old code will stop working.")) return;
    setErr(null);
    start(async () => {
      const res = await rotateJoinCode(classroomId);
      if (!res.ok) setErr(res.error);
      else setCode(res.code);
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900/40">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
        Join code
      </p>
      <div className="mt-1 flex items-center gap-3">
        <span className="font-mono text-2xl font-extrabold tracking-[0.2em] text-indigo-700 dark:text-indigo-300">
          {code}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400"
            aria-label="Copy join code"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={rotate}
            disabled={pending}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400"
            aria-label="Rotate join code"
            title="Rotate code"
          >
            <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-slate-400">
        Parents enter this code on the student&apos;s Readee account to join.
      </p>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
    </div>
  );
}
