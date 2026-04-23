"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { updateAssignment, deleteAssignment } from "../../actions";

export default function AssignmentActions({
  assignmentId,
  initialTitle,
  initialNote,
  initialDueAt,
}: {
  assignmentId: string;
  initialTitle: string;
  initialNote: string | null;
  initialDueAt: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "edit">("idle");
  const [title, setTitle] = useState(initialTitle);
  const [note, setNote] = useState(initialNote ?? "");
  const [dueAt, setDueAt] = useState(
    initialDueAt ? new Date(initialDueAt).toISOString().slice(0, 10) : "",
  );
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setErr(null);
    start(async () => {
      const res = await updateAssignment({
        assignmentId,
        title: title.trim(),
        note: note.trim() || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setMode("idle");
      router.refresh();
    });
  }

  function remove() {
    if (!confirm(`Delete "${initialTitle}"? All student progress on this assignment will be lost.`)) {
      return;
    }
    setErr(null);
    start(async () => {
      const res = await deleteAssignment({ assignmentId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (mode === "idle") {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40"
          aria-label="Edit assignment"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40"
          aria-label="Delete assignment"
          title="Delete"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
        {err && <span className="ml-2 text-xs text-red-600">{err}</span>}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 dark:border-indigo-900 dark:bg-indigo-950/20">
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          rows={2}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
            Due
          </label>
          <input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
          {dueAt && (
            <button
              type="button"
              onClick={() => setDueAt("")}
              className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={pending || !title.trim()}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("idle");
            setTitle(initialTitle);
            setNote(initialNote ?? "");
            setDueAt(initialDueAt ? new Date(initialDueAt).toISOString().slice(0, 10) : "");
            setErr(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
        {err && <span className="text-xs text-red-600">{err}</span>}
      </div>
    </div>
  );
}
