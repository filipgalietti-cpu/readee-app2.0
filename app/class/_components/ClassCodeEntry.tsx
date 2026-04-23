"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function ClassCodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function go() {
    const v = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(v)) {
      setErr("Class codes are 6 letters and numbers.");
      return;
    }
    router.push(`/class/${v}`);
  }

  return (
    <div>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-zinc-200 bg-white p-2 focus-within:border-indigo-400 dark:border-slate-700 dark:bg-slate-900">
        <input
          value={code}
          onChange={(e) => {
            setErr(null);
            setCode(e.target.value.toUpperCase().slice(0, 6));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") go();
          }}
          placeholder="ABCDE1"
          maxLength={6}
          autoFocus
          className="flex-1 bg-transparent px-3 py-3 text-center font-mono text-2xl font-extrabold tracking-[0.3em] text-indigo-700 focus:outline-none dark:text-indigo-200"
        />
        <button
          type="button"
          onClick={go}
          disabled={code.length !== 6}
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40"
          aria-label="Continue"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      {err && <p className="mt-2 text-center text-xs font-semibold text-red-600">{err}</p>}
    </div>
  );
}
