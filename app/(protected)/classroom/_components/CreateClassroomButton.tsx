"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { createClassroom } from "../actions";
import type { GradeLevel } from "@/lib/db/types";

const GRADES: GradeLevel[] = ["K", "1st", "2nd", "3rd", "4th", "Mixed"];

export default function CreateClassroomButton({
  className = "",
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<GradeLevel | "">("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    setError(null);
    start(async () => {
      const res = await createClassroom({
        name,
        gradeLevel: grade || null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setName("");
      setGrade("");
      router.push(`/classroom/${res.classroom.id}`);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 ${className}`}
      >
        <Plus className="h-4 w-4" />
        New class
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Create a class
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="cls-name"
                  className="text-sm font-semibold text-zinc-700 dark:text-slate-300"
                >
                  Class name
                </label>
                <input
                  id="cls-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mrs. K's 3rd Grade — Period 2"
                  maxLength={80}
                  className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold text-zinc-700 dark:text-slate-300">
                  Grade level
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g === grade ? "" : g)}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                        g === grade
                          ? "bg-indigo-600 text-white"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </p>
              )}

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending || !name.trim()}
                  className="flex-1 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                >
                  {pending ? "Creating…" : "Create class"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
