"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, X, Check, Lightbulb } from "lucide-react";
import { aiGenerateQuestions, addManyQuestionsToQuiz } from "../../../../authoring-actions";

type Generated = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

export default function AIGenerateButton({
  quizId,
  gradeHint,
}: {
  quizId: string;
  gradeHint?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(3);
  const [grade, setGrade] = useState(gradeHint ?? "");
  const [generated, setGenerated] = useState<Generated[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [err, setErr] = useState<string | null>(null);
  const [generating, genStart] = useTransition();
  const [saving, saveStart] = useTransition();

  function close() {
    setOpen(false);
    setTimeout(() => {
      setGenerated(null);
      setSelected(new Set());
      setErr(null);
      setTopic("");
    }, 200);
  }

  function generate() {
    setErr(null);
    setGenerated(null);
    setSelected(new Set());
    genStart(async () => {
      const res = await aiGenerateQuestions({
        topic,
        gradeLevel: grade || null,
        count,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setGenerated(res.questions);
      setSelected(new Set(res.questions.map((_, i) => i)));
    });
  }

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function add() {
    if (!generated) return;
    const picks = Array.from(selected)
      .map((i) => generated[i])
      .filter(Boolean);
    if (picks.length === 0) {
      setErr("Select at least one question.");
      return;
    }
    setErr(null);
    saveStart(async () => {
      const res = await addManyQuestionsToQuiz({
        quizId,
        questions: picks.map((q) => ({
          kind: "multiple_choice" as const,
          prompt: q.prompt,
          choices: q.choices,
          correct: q.correct,
          hint: q.hint,
        })),
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
        className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-1.5 text-xs font-bold text-violet-700 transition hover:border-violet-300 hover:shadow-sm dark:border-violet-900/50 dark:from-violet-950/30 dark:to-indigo-950/30 dark:text-violet-300"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate with Readee.ai
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Readee.ai — question generator
                </h3>
              </div>
              <button
                onClick={close}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-slate-400">
                  <Lightbulb className="h-3 w-3" />
                  What should the questions be about?
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  placeholder={"e.g. Main idea and supporting details, for a short passage about a raccoon who lost its scarf."}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                    Grade
                  </span>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">—</option>
                    <option value="K">Kindergarten</option>
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="3rd">3rd</option>
                    <option value="4th">4th</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                    Number of questions ({count})
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="mt-3 w-full accent-indigo-600"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={generate}
                disabled={generating || !topic.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking up questions…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {generated ? "Regenerate" : "Generate"}
                  </>
                )}
              </button>

              {err && (
                <div className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  {err}
                </div>
              )}

              {generated && generated.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-600 dark:text-slate-400">
                      Preview ({selected.size} of {generated.length} selected)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelected(new Set(generated.map((_, i) => i)))}
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        Select all
                      </button>
                      <span className="text-zinc-300">·</span>
                      <button
                        type="button"
                        onClick={() => setSelected(new Set())}
                        className="font-semibold text-zinc-600 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {generated.map((q, i) => {
                      const checked = selected.has(i);
                      return (
                        <li
                          key={i}
                          className={`rounded-2xl border-2 p-3 transition ${
                            checked
                              ? "border-indigo-400 bg-indigo-50/40 dark:border-indigo-500 dark:bg-indigo-950/20"
                              : "border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                          }`}
                        >
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggle(i)}
                              className="mt-1 h-4 w-4 accent-indigo-600"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                                {q.prompt}
                              </div>
                              <ul className="mt-2 space-y-1 text-xs">
                                {q.choices.map((c) => (
                                  <li
                                    key={c}
                                    className={`rounded-lg px-2 py-1 ${
                                      c === q.correct
                                        ? "bg-green-50 font-semibold text-green-800 dark:bg-green-950/30 dark:text-green-300"
                                        : "text-zinc-600 dark:text-slate-400"
                                    }`}
                                  >
                                    {c === q.correct && "✓ "}
                                    {c}
                                  </li>
                                ))}
                              </ul>
                              {q.hint && (
                                <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-400">
                                  Hint: {q.hint}
                                </div>
                              )}
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                Hourly limit: 10 generations. All output reviewable before it reaches students.
              </div>
              {generated && (
                <button
                  type="button"
                  onClick={add}
                  disabled={saving || selected.size === 0}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Add {selected.size} to quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
