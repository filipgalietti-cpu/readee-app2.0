"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, Check, Target, BookOpen, ClipboardPen, Volume2, Settings2, Shuffle, Eye, RotateCcw } from "lucide-react";
import { createAssignment } from "../../actions";
import YesNoToggle from "@/app/_components/YesNoToggle";
import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";

type LessonRef = {
  standardId: string;
  grade: string;
  title: string;
  domain: string;
};

type CustomQuizRef = {
  id: string;
  title: string;
  description: string | null;
  grade_level: string | null;
  question_count: number;
};

type StandardQuestion = {
  id: string;
  type: string;
  prompt: string;
  difficulty?: number;
  choices?: string[];
};

type Step = "pick" | "details";

function findStandardQuestions(standardId: string): StandardQuestion[] {
  for (const bank of [kJson, g1Json, g2Json, g3Json, g4Json] as any[]) {
    const match = bank.standards?.find((s: any) => s.standard_id === standardId);
    if (match) return (match.questions ?? []) as StandardQuestion[];
  }
  return [];
}

export default function NewAssignmentButton({
  classroomId,
  lessons,
  customQuizzes,
}: {
  classroomId: string;
  lessons: LessonRef[];
  customQuizzes?: CustomQuizRef[];
}) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<"readee" | "custom">("readee");
  const [step, setStep] = useState<Step>("pick");
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [picked, setPicked] = useState<LessonRef | null>(null);
  const [pickedQuiz, setPickedQuiz] = useState<CustomQuizRef | null>(null);
  const [note, setNote] = useState("");
  const [dueAt, setDueAt] = useState<string>("");
  const [passThreshold, setPassThreshold] = useState<number | null>(null);
  const [includedQuestionIds, setIncludedQuestionIds] = useState<Set<string> | null>(null); // null = all
  const [audioPrompt, setAudioPrompt] = useState(true);
  const [audioChoices, setAudioChoices] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleChoices, setShuffleChoices] = useState(true);
  const [revealImmediately, setRevealImmediately] = useState(true);
  const [attemptsAllowed, setAttemptsAllowed] = useState<number | null>(null);
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

  const questions = useMemo(() => {
    if (!picked) return [];
    return findStandardQuestions(picked.standardId).filter(
      (q) => q.type === "multiple_choice" && Array.isArray(q.choices) && (q.choices?.length ?? 0) >= 2,
    );
  }, [picked]);

  // When the picked standard changes, reset the question-include set to all.
  useEffect(() => {
    setIncludedQuestionIds(null);
  }, [picked?.standardId]);

  function reset() {
    setSource("readee");
    setStep("pick");
    setQuery("");
    setGradeFilter("All");
    setPicked(null);
    setPickedQuiz(null);
    setNote("");
    setDueAt("");
    setPassThreshold(null);
    setIncludedQuestionIds(null);
    setAudioPrompt(true);
    setAudioChoices(false);
    setShuffleQuestions(false);
    setShuffleChoices(true);
    setRevealImmediately(true);
    setAttemptsAllowed(null);
    setErr(null);
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 200);
  }

  const includedCount = includedQuestionIds
    ? questions.filter((q) => includedQuestionIds.has(q.id)).length
    : questions.length;

  function toggleQ(id: string) {
    setIncludedQuestionIds((prev) => {
      const base = new Set(prev ?? questions.map((q) => q.id));
      if (base.has(id)) base.delete(id);
      else base.add(id);
      return base;
    });
  }

  function selectAll() {
    setIncludedQuestionIds(null);
  }

  function submit() {
    setErr(null);
    if (source === "readee") {
      if (!picked) return;
      if (includedCount === 0) {
        setErr("Pick at least one question.");
        return;
      }
      start(async () => {
        const subsetIds =
          includedQuestionIds === null
            ? null
            : Array.from(includedQuestionIds).filter((id) => questions.some((q) => q.id === id));
        const res = await createAssignment({
          classroomId,
          kind: "readee_lesson",
          sourceId: picked.standardId,
          title: picked.title,
          note: note.trim() || null,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
          passThreshold,
          questionIds: subsetIds,
          audioPromptEnabled: audioPrompt,
          audioChoicesEnabled: audioChoices,
          shuffleQuestions,
          shuffleChoices,
          revealCorrectImmediately: revealImmediately,
          attemptsAllowed,
        });
        if (!res.ok) {
          setErr(res.error);
          return;
        }
        close();
        router.refresh();
      });
    } else {
      if (!pickedQuiz) return;
      if (pickedQuiz.question_count === 0) {
        setErr("That quiz has no questions yet. Add some before assigning.");
        return;
      }
      start(async () => {
        const res = await createAssignment({
          classroomId,
          kind: "custom_quiz",
          sourceId: pickedQuiz.id,
          title: pickedQuiz.title,
          note: note.trim() || null,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
          passThreshold,
          questionIds: null,
          audioPromptEnabled: audioPrompt,
          audioChoicesEnabled: audioChoices,
          shuffleQuestions,
          shuffleChoices,
          revealCorrectImmediately: revealImmediately,
          attemptsAllowed,
        });
        if (!res.ok) {
          setErr(res.error);
          return;
        }
        close();
        router.refresh();
      });
    }
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
                  <div className="flex gap-1 border-b border-zinc-100 px-6 pt-3 text-xs font-semibold dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSource("readee")}
                      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 transition ${
                        source === "readee"
                          ? "border-indigo-600 text-indigo-700 dark:text-indigo-300"
                          : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-slate-400"
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Readee lessons
                    </button>
                    <button
                      type="button"
                      onClick={() => setSource("custom")}
                      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 transition ${
                        source === "custom"
                          ? "border-indigo-600 text-indigo-700 dark:text-indigo-300"
                          : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-slate-400"
                      }`}
                    >
                      <ClipboardPen className="h-3.5 w-3.5" />
                      My quizzes{" "}
                      {customQuizzes && customQuizzes.length > 0 && (
                        <span className="ml-0.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          {customQuizzes.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {source === "readee" && (
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
                  )}

                  {source === "custom" && (
                    <ul className="flex-1 overflow-y-auto">
                      {(customQuizzes ?? []).map((cq) => {
                        const chosen = pickedQuiz?.id === cq.id;
                        return (
                          <li key={cq.id}>
                            <button
                              type="button"
                              onClick={() => setPickedQuiz(cq)}
                              className={`flex w-full items-start gap-3 border-b border-zinc-100 px-6 py-3 text-left transition last:border-0 hover:bg-zinc-50 dark:border-slate-800 dark:hover:bg-slate-800/40 ${
                                chosen ? "bg-indigo-50 dark:bg-indigo-950/30" : ""
                              }`}
                            >
                              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 dark:border-slate-600">
                                {chosen && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-zinc-900 dark:text-white">
                                  {cq.title}
                                </span>
                                <span className="mt-0.5 block text-xs text-zinc-500 dark:text-slate-400">
                                  {cq.question_count} question
                                  {cq.question_count === 1 ? "" : "s"}
                                  {cq.grade_level ? ` · ${cq.grade_level}` : ""}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                      {(!customQuizzes || customQuizzes.length === 0) && (
                        <li className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-slate-400">
                          No custom quizzes yet.{" "}
                          <Link
                            href="/classroom/authoring"
                            className="font-semibold text-indigo-600 underline"
                          >
                            Create one
                          </Link>{" "}
                          — then assign it from here.
                        </li>
                      )}
                    </ul>
                  )}

                  {source === "readee" && <ul className="flex-1 overflow-y-auto">
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
                  </ul>}

                  <footer className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                    <p className="text-xs text-zinc-500 dark:text-slate-400">
                      {source === "readee"
                        ? `${filtered.length} lesson${filtered.length === 1 ? "" : "s"}`
                        : `${customQuizzes?.length ?? 0} quiz${(customQuizzes?.length ?? 0) === 1 ? "" : "zes"}`}
                    </p>
                    <button
                      type="button"
                      disabled={source === "readee" ? !picked : !pickedQuiz}
                      onClick={() => setStep("details")}
                      className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                    >
                      Next
                    </button>
                  </footer>
                </>
              ) : (
                <>
                  <div className="flex-1 space-y-5 overflow-y-auto p-6">
                    <div className="rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-950/30">
                      <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                        Assigning
                      </div>
                      {source === "readee" ? (
                        <>
                          <div className="mt-0.5 font-bold text-indigo-900 dark:text-indigo-100">
                            {picked?.title}
                          </div>
                          <div className="text-xs text-indigo-700/70 dark:text-indigo-300/70">
                            {picked?.grade} · {picked?.standardId}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mt-0.5 font-bold text-indigo-900 dark:text-indigo-100">
                            {pickedQuiz?.title}
                          </div>
                          <div className="text-xs text-indigo-700/70 dark:text-indigo-300/70">
                            Custom quiz · {pickedQuiz?.question_count ?? 0} question
                            {pickedQuiz?.question_count === 1 ? "" : "s"}
                            {pickedQuiz?.grade_level ? ` · ${pickedQuiz.grade_level}` : ""}
                          </div>
                        </>
                      )}
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
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Read the whole passage before answering."
                        className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700 dark:text-slate-300">
                          <Target className="h-4 w-4 text-indigo-600" />
                          Pass threshold
                        </label>
                        <div className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
                          {passThreshold === null ? "Off" : `${passThreshold}%`}
                        </div>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                        Set a minimum score students must hit to complete this assignment. Below it, the assignment stays on their list for retake.
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={passThreshold ?? 0}
                          onChange={(e) => setPassThreshold(Number(e.target.value))}
                          className="flex-1 accent-indigo-600"
                        />
                        <button
                          type="button"
                          onClick={() => setPassThreshold(null)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            passThreshold === null
                              ? "bg-indigo-600 text-white"
                              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          Off
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700 dark:text-slate-300">
                        <Volume2 className="h-4 w-4 text-indigo-600" />
                        Audio
                      </label>
                      <div className="mt-2 space-y-2">
                        <YesNoToggle
                          value={audioPrompt}
                          onChange={setAudioPrompt}
                          label="Autoplay question audio"
                          helper="Reads the prompt aloud when available. Recommended for K-2."
                        />
                        <YesNoToggle
                          value={audioChoices}
                          onChange={setAudioChoices}
                          label="Tap to preview choice audio"
                          helper="Tap once to hear a choice, tap again to pick. Useful for phoneme / letter-sound questions."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700 dark:text-slate-300">
                        <Settings2 className="h-4 w-4 text-indigo-600" />
                        Behavior
                      </label>
                      <div className="mt-2 space-y-2">
                        <YesNoToggle
                          value={shuffleQuestions}
                          onChange={setShuffleQuestions}
                          label="Shuffle question order"
                          helper="Randomize the order each student sees. Leave off if you want the whole class on the same rhythm."
                        />
                        <YesNoToggle
                          value={shuffleChoices}
                          onChange={setShuffleChoices}
                          label="Shuffle answer choices"
                          helper="Randomize A/B/C/D per student so kids can't compare tiles. Skipped for questions with pre-recorded answer audio so the narration stays in sync with the on-screen order."
                        />
                        <YesNoToggle
                          value={revealImmediately}
                          onChange={setRevealImmediately}
                          label="Reveal correct answer after each question"
                          helper="Turn off for test-mode (show only the final score, no per-question feedback)."
                        />
                      </div>
                      <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white">
                            <RotateCcw className="h-3.5 w-3.5 text-indigo-600" />
                            Attempts allowed
                          </div>
                          <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-slate-400">
                            Unlimited lets a struggling student keep practicing until they pass the threshold.
                          </div>
                        </div>
                        <select
                          value={attemptsAllowed ?? ""}
                          onChange={(e) =>
                            setAttemptsAllowed(e.target.value === "" ? null : Number(e.target.value))
                          }
                          className="flex-shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                          <option value="">Unlimited</option>
                          <option value="1">1 attempt</option>
                          <option value="2">2 attempts</option>
                          <option value="3">3 attempts</option>
                        </select>
                      </div>
                    </div>

                    {source === "readee" && questions.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-zinc-700 dark:text-slate-300">
                            Questions ({includedCount} of {questions.length})
                          </label>
                          {includedQuestionIds !== null && (
                            <button
                              type="button"
                              onClick={selectAll}
                              className="text-xs font-semibold text-indigo-600 hover:underline"
                            >
                              Use all
                            </button>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                          Uncheck to exclude. Default: all questions included.
                        </p>
                        <ul className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 dark:border-slate-700">
                          {questions.map((q) => {
                            const included = includedQuestionIds
                              ? includedQuestionIds.has(q.id)
                              : true;
                            return (
                              <li
                                key={q.id}
                                className="border-b border-zinc-100 last:border-0 dark:border-slate-800"
                              >
                                <label className="flex cursor-pointer items-start gap-3 px-3 py-2 transition hover:bg-zinc-50 dark:hover:bg-slate-800/40">
                                  <input
                                    type="checkbox"
                                    checked={included}
                                    onChange={() => toggleQ(q.id)}
                                    className="mt-0.5 h-4 w-4 accent-indigo-600"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-mono text-zinc-400">
                                      {q.id}
                                      {q.difficulty ? ` · difficulty ${q.difficulty}` : ""}
                                    </div>
                                    <div className="mt-0.5 line-clamp-2 text-sm text-zinc-700 dark:text-slate-300">
                                      {q.prompt}
                                    </div>
                                  </div>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

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
                      disabled={
                        pending ||
                        (source === "readee" && includedCount === 0) ||
                        (source === "custom" && (pickedQuiz?.question_count ?? 0) === 0)
                      }
                      className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                    >
                      {pending
                        ? "Assigning…"
                        : source === "readee"
                        ? `Assign to class (${includedCount} Q)`
                        : `Assign to class (${pickedQuiz?.question_count ?? 0} Q)`}
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
