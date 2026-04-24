"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  X,
  Check,
  Lightbulb,
  Link2,
  BookOpen,
  Copy,
  CheckCheck,
} from "lucide-react";
import {
  aiGenerateQuestions,
  aiGenerateMatchingPairs,
  aiGeneratePassage,
  addManyQuestionsToQuiz,
} from "../../../../authoring-actions";

type Generated = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
};

type Mode = "mcq" | "pairs" | "passage";

export default function AIGenerateButton({
  quizId,
  gradeHint,
}: {
  quizId: string;
  gradeHint?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("mcq");

  // Shared fields
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState(gradeHint ?? "");

  // MCQ state
  const [mcqCount, setMcqCount] = useState(3);
  const [mcqPreview, setMcqPreview] = useState<Generated[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Pairs state
  const [pairCount, setPairCount] = useState(4);
  const [pairsPreview, setPairsPreview] = useState<{ left: string; right: string }[] | null>(null);
  const [pairsAsMCQs, setPairsAsMCQs] = useState<Generated[] | null>(null);

  // Passage state
  const [phonics, setPhonics] = useState("");
  const [passagePreview, setPassagePreview] = useState<{
    title: string;
    passage: string;
    suggestedQuestions: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [generating, genStart] = useTransition();
  const [saving, saveStart] = useTransition();

  function close() {
    setOpen(false);
    setTimeout(() => {
      setMode("mcq");
      setTopic("");
      setMcqPreview(null);
      setPairsPreview(null);
      setPairsAsMCQs(null);
      setPassagePreview(null);
      setSelected(new Set());
      setErr(null);
      setCopied(false);
      setPhonics("");
    }, 200);
  }

  function generate() {
    setErr(null);
    setMcqPreview(null);
    setPairsPreview(null);
    setPassagePreview(null);
    setSelected(new Set());
    genStart(async () => {
      if (mode === "mcq") {
        const res = await aiGenerateQuestions({
          topic,
          gradeLevel: grade || null,
          count: mcqCount,
        });
        if (!res.ok) return setErr(res.error);
        setMcqPreview(res.questions);
        setSelected(new Set(res.questions.map((_, i) => i)));
      } else if (mode === "pairs") {
        const res = await aiGenerateMatchingPairs({
          topic,
          gradeLevel: grade || null,
          count: pairCount,
        });
        if (!res.ok) return setErr(res.error);
        setPairsPreview(res.pairs);
        setPairsAsMCQs(res.mcqs);
        setSelected(new Set(res.mcqs.map((_, i) => i)));
      } else {
        const res = await aiGeneratePassage({
          topic,
          gradeLevel: grade || null,
          phonicsPattern: phonics || null,
        });
        if (!res.ok) return setErr(res.error);
        setPassagePreview(res.passage);
      }
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
    const source =
      mode === "mcq" ? mcqPreview : mode === "pairs" ? pairsAsMCQs : null;
    if (!source) return;
    const picks = Array.from(selected)
      .map((i) => source[i])
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

  function copyPassage() {
    if (!passagePreview) return;
    const text = [
      passagePreview.title,
      "",
      passagePreview.passage,
      passagePreview.suggestedQuestions.length > 0 ? "\nSuggested questions:" : "",
      ...passagePreview.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`),
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const tabs: { mode: Mode; label: string; icon: typeof Sparkles }[] = [
    { mode: "mcq", label: "Questions", icon: Sparkles },
    { mode: "pairs", label: "Matching pairs", icon: Link2 },
    { mode: "passage", label: "Passage", icon: BookOpen },
  ];

  const anyPreview =
    mcqPreview || pairsPreview || passagePreview;
  const reviewable =
    mode === "mcq" ? mcqPreview : mode === "pairs" ? pairsAsMCQs : null;

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
                  Readee.ai
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

            <div className="flex gap-1 border-b border-zinc-100 px-5 pt-3 text-xs font-semibold dark:border-slate-800">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = mode === t.mode;
                return (
                  <button
                    key={t.mode}
                    type="button"
                    onClick={() => {
                      setMode(t.mode);
                      setMcqPreview(null);
                      setPairsPreview(null);
                      setPassagePreview(null);
                      setSelected(new Set());
                      setErr(null);
                    }}
                    className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 transition ${
                      active
                        ? "border-violet-600 text-violet-700 dark:text-violet-300"
                        : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-slate-400">
                  <Lightbulb className="h-3 w-3" />
                  {mode === "passage"
                    ? "What should the passage be about?"
                    : "What should this be about?"}
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={2}
                  placeholder={
                    mode === "mcq"
                      ? "Main idea + details; short passage about a raccoon who lost its scarf"
                      : mode === "pairs"
                      ? "Synonyms for feelings (happy, sad, angry, calm, proud, worried)"
                      : "A second-grader's first day of school. Short and warm."
                  }
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
                {mode === "mcq" && (
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                      Number of questions ({mcqCount})
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={mcqCount}
                      onChange={(e) => setMcqCount(Number(e.target.value))}
                      className="mt-3 w-full accent-indigo-600"
                    />
                  </label>
                )}
                {mode === "pairs" && (
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                      Number of pairs ({pairCount})
                    </span>
                    <input
                      type="range"
                      min={2}
                      max={8}
                      value={pairCount}
                      onChange={(e) => setPairCount(Number(e.target.value))}
                      className="mt-3 w-full accent-indigo-600"
                    />
                  </label>
                )}
                {mode === "passage" && (
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                      Phonics focus (optional)
                    </span>
                    <input
                      value={phonics}
                      onChange={(e) => setPhonics(e.target.value)}
                      placeholder="short a, long e, r-controlled…"
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </label>
                )}
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
                    Thinking…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {anyPreview ? "Regenerate" : "Generate"}
                  </>
                )}
              </button>

              {err && (
                <div className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  {err}
                </div>
              )}

              {/* MCQ preview */}
              {mode === "mcq" && mcqPreview && mcqPreview.length > 0 && (
                <QuestionPreview
                  questions={mcqPreview}
                  selected={selected}
                  toggle={toggle}
                  setAll={() => setSelected(new Set(mcqPreview.map((_, i) => i)))}
                  clearAll={() => setSelected(new Set())}
                />
              )}

              {/* Pairs preview — show pairs first, then the MCQ conversion */}
              {mode === "pairs" && pairsPreview && pairsAsMCQs && (
                <div>
                  <div className="mb-2 text-xs font-semibold text-zinc-600 dark:text-slate-400">
                    Pairs — review for quality
                  </div>
                  <ul className="mb-4 space-y-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    {pairsPreview.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        <span className="flex-1 font-semibold text-zinc-900 dark:text-white">
                          {p.left}
                        </span>
                        <span className="text-zinc-400">↔</span>
                        <span className="flex-1 text-zinc-700 dark:text-slate-300">
                          {p.right}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mb-2 text-xs font-semibold text-zinc-600 dark:text-slate-400">
                    Saved as MCQs ({pairsAsMCQs.length}) — select to keep
                  </div>
                  <QuestionPreview
                    questions={pairsAsMCQs}
                    selected={selected}
                    toggle={toggle}
                    setAll={() => setSelected(new Set(pairsAsMCQs.map((_, i) => i)))}
                    clearAll={() => setSelected(new Set())}
                  />
                </div>
              )}

              {/* Passage preview */}
              {mode === "passage" && passagePreview && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-yellow-950/20">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                      {passagePreview.title}
                    </div>
                    <div
                      className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-800 dark:text-slate-200"
                      dangerouslySetInnerHTML={{
                        __html: passagePreview.passage.replace(
                          /\*\*([^*]+)\*\*/g,
                          '<strong class="text-indigo-700 dark:text-indigo-300">$1</strong>',
                        ),
                      }}
                    />
                  </div>
                  {passagePreview.suggestedQuestions.length > 0 && (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
                        Suggested comprehension questions
                      </div>
                      <ul className="mt-2 list-decimal space-y-1 pl-5 text-zinc-700 dark:text-slate-300">
                        {passagePreview.suggestedQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-zinc-500 dark:text-slate-400">
                    Passages aren&apos;t saved as questions — paste into the
                    prompt field of a question you&apos;re authoring, or share
                    with your class directly.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                10 generations/hr per teacher. Preview before anything reaches students.
              </div>
              {mode === "passage" && passagePreview ? (
                <button
                  type="button"
                  onClick={copyPassage}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy passage"}
                </button>
              ) : reviewable && reviewable.length > 0 ? (
                <button
                  type="button"
                  onClick={add}
                  disabled={saving || selected.size === 0}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Add {selected.size} to quiz
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QuestionPreview({
  questions,
  selected,
  toggle,
  setAll,
  clearAll,
}: {
  questions: Generated[];
  selected: Set<number>;
  toggle: (i: number) => void;
  setAll: () => void;
  clearAll: () => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-zinc-600 dark:text-slate-400">
          Preview ({selected.size} of {questions.length} selected)
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={setAll} className="font-semibold text-indigo-600 hover:underline">
            Select all
          </button>
          <span className="text-zinc-300">·</span>
          <button type="button" onClick={clearAll} className="font-semibold text-zinc-600 hover:underline">
            Clear
          </button>
        </div>
      </div>
      <ul className="space-y-2">
        {questions.map((q, i) => {
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
  );
}
