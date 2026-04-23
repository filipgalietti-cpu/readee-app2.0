"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, Check } from "lucide-react";
import { createAssignment } from "../../actions";

type LessonRef = {
  standardId: string;
  grade: string;
  title: string;
  domain: string;
};

type Step = "pick" | "details";

export default function NewAssignmentButton({
  classroomId,
  lessons,
}: {
  classroomId: string;
  lessons: LessonRef[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("pick");
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [picked, setPicked] = useState<LessonRef | null>(null);
  const [note, setNote] = useState("");
  const [dueAt, setDueAt] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const grades = useMemo(() => {
    const s = new Set<string>();
    lessons.forEach((l) => s.add(l.grade));
    return ["All", ...Array.from(s)];
  }, [lessons]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessons.filter((l) => {
      if (gradeFilter !== "All" && l.grade !== gradeFilter) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.standardId.toLowerCase().includes(q) ||
        l.domain.toLowerCase().includes(q)
      );
    });
  }, [lessons, query, gradeFilter]);

  function reset() {
    setStep("pick");
    setQuery("");
    setGradeFilter("All");
    setPicked(null);
    setNote("");
    setDueAt("");
    setErr(null);
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 200);
  }

  function submit() {
    if (!picked) return;
    setErr(null);
    start(async () => {
      const res = await createAssignment({
        classroomId,
        kind: "readee_lesson",
        sourceId: picked.standardId,
        title: picked.title,
        note: note.trim() || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      close();
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4" />
        New assignment
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900"
            >
              <header className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-slate-800">
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  {step === "pick" ? "Choose a Readee lesson" : "Assignment details"}
                </h2>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {step === "pick" ? (
                <>
                  <div className="flex items-center gap-2 border-b border-zinc-100 px-6 py-3 dark:border-slate-800">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title, standard, or domain"
                        className="block w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <select
                      value={gradeFilter}
                      onChange={(e) => setGradeFilter(e.target.value)}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {grades.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ul className="flex-1 overflow-y-auto">
                    {filtered.map((l) => {
                      const chosen = picked?.standardId === l.standardId;
                      return (
                        <li key={l.standardId}>
                          <button
                            type="button"
                            onClick={() => setPicked(l)}
                            className={`flex w-full items-start gap-3 border-b border-zinc-100 px-6 py-3 text-left transition last:border-0 hover:bg-zinc-50 dark:border-slate-800 dark:hover:bg-slate-800/40 ${
                              chosen ? "bg-indigo-50 dark:bg-indigo-950/30" : ""
                            }`}
                          >
                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 dark:border-slate-600">
                              {chosen && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold text-zinc-900 dark:text-white">
                                {l.title}
                              </span>
                              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-slate-400">
                                {l.grade} · {l.domain} · {l.standardId}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                    {filtered.length === 0 && (
                      <li className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-slate-400">
                        No lessons match your search.
                      </li>
                    )}
                  </ul>

                  <footer className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                    <p className="text-xs text-zinc-500 dark:text-slate-400">
                      {filtered.length} lesson{filtered.length === 1 ? "" : "s"}
                    </p>
                    <button
                      type="button"
                      disabled={!picked}
                      onClick={() => setStep("details")}
                      className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                    >
                      Next
                    </button>
                  </footer>
                </>
              ) : (
                <>
                  <div className="space-y-5 p-6">
                    <div className="rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-950/30">
                      <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                        Assigning
                      </div>
                      <div className="mt-0.5 font-bold text-indigo-900 dark:text-indigo-100">
                        {picked?.title}
                      </div>
                      <div className="text-xs text-indigo-700/70 dark:text-indigo-300/70">
                        {picked?.grade} · {picked?.standardId}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="due"
                        className="text-sm font-semibold text-zinc-700 dark:text-slate-300"
                      >
                        Due date (optional)
                      </label>
                      <input
                        id="due"
                        type="date"
                        value={dueAt}
                        onChange={(e) => setDueAt(e.target.value)}
                        className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="note"
                        className="text-sm font-semibold text-zinc-700 dark:text-slate-300"
                      >
                        Note to students (optional)
                      </label>
                      <textarea
                        id="note"
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Read the whole passage before answering."
                        className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    {err && (
                      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                        {err}
                      </p>
                    )}
                  </div>

                  <footer className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                    <button
                      type="button"
                      onClick={() => setStep("pick")}
                      className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={pending}
                      className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                    >
                      {pending ? "Assigning…" : "Assign to class"}
                    </button>
                  </footer>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
