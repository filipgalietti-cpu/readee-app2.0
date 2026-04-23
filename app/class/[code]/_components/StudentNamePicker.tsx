"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, X } from "lucide-react";

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
  "from-purple-500 to-fuchsia-600",
  "from-lime-500 to-green-600",
  "from-cyan-500 to-sky-600",
];

function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function StudentNamePicker({
  code,
  classroomId,
  students,
  pinRequired,
}: {
  code: string;
  classroomId: string;
  students: { id: string; first_name: string }[];
  pinRequired: boolean;
}) {
  const router = useRouter();
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [pinFor, setPinFor] = useState<{ id: string; name: string } | null>(null);
  const [pin, setPin] = useState("");

  function pick(childId: string) {
    if (pending) return;
    if (pinRequired) {
      const stu = students.find((s) => s.id === childId);
      setPinFor({ id: childId, name: stu?.first_name ?? "you" });
      setPin("");
      setErr(null);
      return;
    }
    doSignIn(childId);
  }

  function doSignIn(childId: string, pinValue?: string) {
    setClickedId(childId);
    setErr(null);
    start(async () => {
      const res = await fetch("/api/student/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, classroomId, childId, pin: pinValue }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        if (body.error === "pin_required") {
          setErr(body.message ?? "That PIN didn't match.");
        } else {
          setErr(body.error ?? "Could not sign in. Try again.");
        }
        setClickedId(null);
        return;
      }
      setPinFor(null);
      router.push("/student");
      router.refresh();
    });
  }

  function submitPin() {
    if (!pinFor) return;
    if (!/^[0-9]{4}$/.test(pin)) {
      setErr("PIN is 4 digits.");
      return;
    }
    doSignIn(pinFor.id, pin);
  }

  return (
    <div>
      {err && !pinFor && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {err}
        </div>
      )}
      {pinFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPinFor(null)} />
          <div className="relative w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-900">
            <button
              onClick={() => setPinFor(null)}
              className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-zinc-900 dark:text-white">
              Hi, {pinFor.name}!
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
              Enter your class PIN.
            </p>
            <input
              autoFocus
              value={pin}
              onChange={(e) => {
                setErr(null);
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitPin();
              }}
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              className="mt-4 w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-center font-mono text-3xl font-extrabold tracking-[0.4em] text-indigo-700 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-200"
            />
            {err && <p className="mt-3 text-xs font-semibold text-red-600">{err}</p>}
            <button
              type="button"
              onClick={submitPin}
              disabled={pending || pin.length !== 4}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign in
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {students.map((s) => {
          const color = colorFor(s.id);
          const initial = s.first_name.charAt(0).toUpperCase();
          const isLoading = pending && clickedId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => pick(s.id)}
              disabled={pending}
              className={`group flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-transparent bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg disabled:opacity-60 dark:bg-slate-900 ${
                isLoading ? "ring-4 ring-indigo-300" : ""
              }`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${color} text-2xl font-extrabold text-white shadow-md sm:h-20 sm:w-20 sm:text-3xl`}
              >
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : initial}
              </div>
              <div className="mt-3 truncate text-sm font-extrabold text-zinc-900 sm:text-base dark:text-white">
                {s.first_name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
