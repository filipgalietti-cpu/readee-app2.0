"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, X, Loader2 } from "lucide-react";
import { createDistrict } from "../actions";

export default function CreateDistrictButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setErr(null);
    start(async () => {
      const res = await createDistrict({ name, state: state || null });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setOpen(false);
      router.push(`/admin/district/${res.districtId}`);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300"
      >
        <Plus className="h-4 w-4" />
        New district
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-violet-600" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Create a district
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
              You become a district admin automatically. Add schools and
              other admins from the district dashboard.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                  District name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Somerset County School District"
                  maxLength={120}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                  State (2-letter)
                </span>
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="NJ"
                  maxLength={2}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold uppercase focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
            </div>
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
                disabled={pending || !name.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
