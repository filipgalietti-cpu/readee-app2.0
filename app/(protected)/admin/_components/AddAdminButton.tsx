"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Loader2 } from "lucide-react";
import { grantAdminScope } from "../actions";

export default function AddAdminButton({
  scope,
  schoolId,
  districtId,
  label,
}: {
  scope: "school" | "district";
  schoolId?: string | null;
  districtId?: string | null;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setErr(null);
    start(async () => {
      const res = await grantAdminScope({
        email,
        scope,
        schoolId: schoolId ?? null,
        districtId: districtId ?? null,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setOpen(false);
      setEmail("");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        <UserPlus className="h-3.5 w-3.5" />
        {label ?? "Add admin"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Add {scope} admin
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
              The user must already have a Readee account. If they
              don&apos;t, ask them to sign up at learn.readee.app/signup
              first.
            </p>
            <label className="mt-4 block">
              <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                Email
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="principal@district.edu"
                type="email"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>
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
                onClick={submit}
                disabled={pending || !email.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Grant access
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
