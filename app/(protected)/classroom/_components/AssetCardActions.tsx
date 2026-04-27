"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2, Loader2, X, AlertTriangle, Check } from "lucide-react";
import {
  renameLesson,
  deleteLesson,
  renameBook,
  deleteBook,
  renameLeveled,
  deleteLeveled,
} from "../asset-actions";

type AssetType = "lesson" | "book" | "leveled";

export default function AssetCardActions({
  type,
  id,
  initialTitle,
}: {
  type: AssetType;
  id: string;
  initialTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "rename" | "confirm-delete">("menu");
  const [title, setTitle] = useState(initialTitle);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setMode("menu");
        setErr(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function close() {
    setOpen(false);
    setMode("menu");
    setErr(null);
  }

  function doRename() {
    setErr(null);
    start(async () => {
      const args =
        type === "lesson"
          ? await renameLesson({ lessonId: id, title })
          : type === "book"
            ? await renameBook({ bookId: id, title })
            : await renameLeveled({ passageId: id, title });
      if (!args.ok) {
        setErr(args.error);
        return;
      }
      close();
      router.refresh();
    });
  }

  function doDelete() {
    setErr(null);
    start(async () => {
      const args =
        type === "lesson"
          ? await deleteLesson({ lessonId: id })
          : type === "book"
            ? await deleteBook({ bookId: id })
            : await deleteLeveled({ passageId: id });
      if (!args.ok) {
        setErr(args.error);
        return;
      }
      close();
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="absolute right-2 top-2 z-20">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="More actions"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-zinc-600 shadow-sm ring-1 ring-zinc-200 transition hover:bg-white hover:text-zinc-900"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-0 top-10 w-64 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl"
        >
          {mode === "menu" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setTitle(initialTitle);
                  setMode("rename");
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                <Pencil className="h-4 w-4" />
                Rename
              </button>
              <button
                type="button"
                onClick={() => setMode("confirm-delete")}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}

          {mode === "rename" && (
            <div className="p-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                New title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") doRename();
                  if (e.key === "Escape") close();
                }}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
              />
              {err && (
                <div className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-red-600">
                  <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  {err}
                </div>
              )}
              <div className="mt-2 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={close}
                  disabled={pending}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={doRename}
                  disabled={pending || !title.trim()}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {pending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Save
                </button>
              </div>
            </div>
          )}

          {mode === "confirm-delete" && (
            <div className="p-1">
              <div className="flex items-start gap-2 px-1 pb-2 text-sm text-zinc-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <div>
                  <div className="font-bold">Delete this?</div>
                  <div className="text-xs text-zinc-500">
                    This is permanent. Any assignments using it will lose access.
                  </div>
                </div>
              </div>
              {err && (
                <div className="mt-1 flex items-start gap-1.5 px-1 text-xs font-semibold text-red-600">
                  <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  {err}
                </div>
              )}
              <div className="mt-1 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={close}
                  disabled={pending}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={doDelete}
                  disabled={pending}
                  className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {pending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
