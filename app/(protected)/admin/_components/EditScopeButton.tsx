"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2, Check } from "lucide-react";
import { updateDistrict, updateSchool } from "../actions";

type Props =
  | {
      kind: "district";
      id: string;
      initialName: string;
      initialState: string | null;
    }
  | {
      kind: "school";
      id: string;
      initialName: string;
      initialCity: string | null;
      initialState: string | null;
    };

export default function EditScopeButton(props: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(props.initialName);
  const [state, setState] = useState(props.initialState ?? "");
  const [city, setCity] = useState(props.kind === "school" ? props.initialCity ?? "" : "");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setErr(null);
    start(async () => {
      const res =
        props.kind === "district"
          ? await updateDistrict({
              districtId: props.id,
              name,
              state: state || null,
            })
          : await updateSchool({
              schoolId: props.id,
              name,
              city: city || null,
              state: state || null,
            });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setOpen(false);
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
        <Pencil className="h-3.5 w-3.5" />
        Edit {props.kind}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Edit {props.kind}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                  Name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
              {props.kind === "school" && (
                <label className="block">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                    City
                  </span>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    maxLength={80}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </label>
              )}
              <label className="block">
                <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                  State (2-letter)
                </span>
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
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
                onClick={save}
                disabled={pending || !name.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
