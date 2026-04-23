"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
}: {
  code: string;
  classroomId: string;
  students: { id: string; first_name: string }[];
}) {
  const router = useRouter();
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function pick(childId: string) {
    if (pending) return;
    setClickedId(childId);
    setErr(null);
    start(async () => {
      const res = await fetch("/api/student/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, classroomId, childId }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(body.error ?? "Could not sign in. Try again.");
        setClickedId(null);
        return;
      }
      router.push("/student");
      router.refresh();
    });
  }

  return (
    <div>
      {err && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {err}
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
