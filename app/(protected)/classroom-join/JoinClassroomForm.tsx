"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { joinClassroom } from "../classroom/actions";
import type { Child } from "@/lib/db/types";

export default function JoinClassroomForm({
  children,
}: {
  children: Pick<Child, "id" | "first_name" | "grade">[];
}) {
  const [code, setCode] = useState("");
  const [childId, setChildId] = useState<string>(children[0]?.id ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const res = await joinClassroom({ code, childId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-green-50 px-6 py-10 text-center dark:bg-green-950/30">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white">
          <Check className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-green-900 dark:text-green-200">
          You&apos;re in!
        </h2>
        <p className="mt-1 text-sm text-green-800/80 dark:text-green-300/80">
          Heading back to your dashboard…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label
          htmlFor="code"
          className="text-sm font-semibold text-zinc-700 dark:text-slate-300"
        >
          Join code
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="6-CHAR"
          maxLength={6}
          autoComplete="off"
          className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center font-mono text-2xl font-extrabold uppercase tracking-[0.3em] text-zinc-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-zinc-700 dark:text-slate-300">
          Which child?
        </label>
        <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
          {children.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setChildId(c.id)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                c.id === childId
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <span className="block text-sm font-bold">{c.first_name}</span>
              {c.grade && (
                <span className="block text-xs font-medium text-zinc-500 dark:text-slate-400">
                  {c.grade}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {err && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {err}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || code.length !== 6 || !childId}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
      >
        {pending ? "Joining…" : "Join class"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
