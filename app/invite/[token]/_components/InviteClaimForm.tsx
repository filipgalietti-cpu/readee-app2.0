"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Plus } from "lucide-react";
import { claimInvite } from "../../../(protected)/classroom/claim-actions";

export default function InviteClaimForm({
  token,
  studentFirstName,
  children,
}: {
  token: string;
  studentFirstName: string;
  children: { id: string; first_name: string; grade: string | null }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(children[0]?.id ?? "__new__");
  const [newName, setNewName] = useState(studentFirstName);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setErr(null);
    start(async () => {
      const res =
        selected === "__new__"
          ? await claimInvite({
              token,
              mode: "create",
              newChildFirstName: newName.trim(),
            })
          : await claimInvite({
              token,
              mode: "existing",
              existingChildId: selected,
            });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.push(`/dashboard?child=${res.childId}`);
      router.refresh();
    });
  }

  return (
    <div className="mt-6 space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
        Connect as
      </p>

      {children.map((c) => (
        <label
          key={c.id}
          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
            selected === c.id
              ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/30"
              : "border-zinc-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900/40"
          }`}
        >
          <input
            type="radio"
            name="child"
            value={c.id}
            checked={selected === c.id}
            onChange={() => setSelected(c.id)}
            className="h-4 w-4 accent-indigo-600"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-zinc-900 dark:text-white">
              {c.first_name}
            </div>
            {c.grade && (
              <div className="text-xs text-zinc-500 dark:text-slate-400">{c.grade}</div>
            )}
          </div>
        </label>
      ))}

      <label
        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
          selected === "__new__"
            ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/30"
            : "border-zinc-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900/40"
        }`}
      >
        <input
          type="radio"
          name="child"
          value="__new__"
          checked={selected === "__new__"}
          onChange={() => setSelected("__new__")}
          className="mt-0.5 h-4 w-4 accent-indigo-600"
        />
        <div className="flex-1">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-white">
            <Plus className="h-4 w-4 text-indigo-600" />
            Create a new child
          </div>
          {selected === "__new__" && (
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="First name"
              maxLength={40}
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          )}
        </div>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={submit}
          disabled={pending || (selected === "__new__" && !newName.trim())}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Connect to class
        </button>
        {err && <span className="text-xs font-semibold text-red-600">{err}</span>}
      </div>
    </div>
  );
}
