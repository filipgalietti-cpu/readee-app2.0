"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Loader2, X, Check, AlertCircle, Lightbulb } from "lucide-react";
import {
  addQuestionToQuiz,
  updateCustomQuestion,
  removeQuestionFromQuiz,
  deleteCustomQuiz,
  updateCustomQuiz,
} from "../../../../authoring-actions";
import AIGenerateButton from "./AIGenerateButton";

type QuestionKind = "multiple_choice" | "true_false" | "fill_in_blank";

type Question = {
  id: string;
  position: number;
  kind: QuestionKind;
  prompt: string;
  choices: string[] | null;
  correct: any;
  hint: string | null;
};

export default function QuizBuilder({
  quizId,
  initialTitle,
  initialDescription,
  initialGradeLevel,
  questions,
}: {
  quizId: string;
  initialTitle: string;
  initialDescription: string;
  initialGradeLevel: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Question | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <QuizMetaForm
        quizId={quizId}
        initialTitle={initialTitle}
        initialDescription={initialDescription}
        initialGradeLevel={initialGradeLevel}
      />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            Questions
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <AIGenerateButton quizId={quizId} gradeHint={initialGradeLevel || null} />
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add question
            </button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="mt-3 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-sm text-zinc-500 dark:text-slate-400">
              No questions yet. Click &quot;Add question&quot; to start.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {questions.map((q, i) => (
              <li
                key={q.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {kindLabel(q.kind)}
                      </span>
                      <span className="text-xs text-zinc-400">Q{i + 1}</span>
                    </div>
                    <div className="mt-1.5 whitespace-pre-line text-sm font-semibold text-zinc-900 dark:text-white">
                      {q.prompt}
                    </div>
                    {renderChoices(q)}
                    {q.hint && (
                      <div className="mt-2 inline-flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                        <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0" />
                        {q.hint}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(q)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <RemoveQuestionButton quizId={quizId} questionId={q.id} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DangerZone quizId={quizId} />

      {(creating || editing) && (
        <QuestionFormModal
          quizId={quizId}
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function kindLabel(k: QuestionKind): string {
  if (k === "multiple_choice") return "Multiple choice";
  if (k === "true_false") return "True / false";
  return "Fill in the blank";
}

function renderChoices(q: Question): React.ReactNode {
  if (q.kind === "multiple_choice" && Array.isArray(q.choices)) {
    const correct = String(q.correct);
    return (
      <ul className="mt-2 space-y-1 text-xs">
        {q.choices.map((c) => (
          <li
            key={c}
            className={`flex items-center gap-2 rounded-lg px-2 py-1 ${
              c === correct
                ? "bg-green-50 font-semibold text-green-800 dark:bg-green-950/30 dark:text-green-300"
                : "text-zinc-600 dark:text-slate-400"
            }`}
          >
            {c === correct && <Check className="h-3 w-3 text-green-600" />}
            {c}
          </li>
        ))}
      </ul>
    );
  }
  if (q.kind === "true_false") {
    return (
      <div className="mt-2 inline-flex gap-2 text-xs">
        <span
          className={`rounded-lg px-2 py-1 ${
            q.correct === "True"
              ? "bg-green-50 font-semibold text-green-800 dark:bg-green-950/30 dark:text-green-300"
              : "text-zinc-500"
          }`}
        >
          True
        </span>
        <span
          className={`rounded-lg px-2 py-1 ${
            q.correct === "False"
              ? "bg-green-50 font-semibold text-green-800 dark:bg-green-950/30 dark:text-green-300"
              : "text-zinc-500"
          }`}
        >
          False
        </span>
      </div>
    );
  }
  if (q.kind === "fill_in_blank" && Array.isArray(q.correct)) {
    return (
      <div className="mt-2 text-xs">
        <span className="font-semibold text-green-700 dark:text-green-300">Accepted: </span>
        {q.correct.join(" / ")}
      </div>
    );
  }
  return null;
}

function QuizMetaForm({
  quizId,
  initialTitle,
  initialDescription,
  initialGradeLevel,
}: {
  quizId: string;
  initialTitle: string;
  initialDescription: string;
  initialGradeLevel: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [gradeLevel, setGradeLevel] = useState(initialGradeLevel);
  const [err, setErr] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const dirty =
    title.trim() !== initialTitle ||
    description !== initialDescription ||
    gradeLevel !== initialGradeLevel;

  function submit() {
    if (!dirty) return;
    setErr(null);
    setSavedAt(null);
    start(async () => {
      const res = await updateCustomQuiz({
        quizId,
        title: title.trim(),
        description: description || null,
        gradeLevel: gradeLevel || null,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
      <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
        Quiz details
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-3 space-y-3"
      >
        <label className="block">
          <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
            Title
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <label className="block">
            <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
              Description
            </span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
              Grade
            </span>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
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
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!dirty || pending}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Save
          </button>
          {savedAt && !pending && !err && (
            <span className="text-xs font-semibold text-green-600">Saved</span>
          )}
          {err && <span className="text-xs font-semibold text-red-600">{err}</span>}
        </div>
      </form>
    </section>
  );
}

function RemoveQuestionButton({ quizId, questionId }: { quizId: string; questionId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function submit() {
    if (!confirm("Delete this question? This can't be undone.")) return;
    start(async () => {
      await removeQuestionFromQuiz({ quizId, questionId });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={submit}
      disabled={pending}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40"
      title="Delete question"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}

function DangerZone({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  function submit() {
    if (!confirm("Delete this entire quiz and all its questions? This can't be undone.")) return;
    setErr(null);
    start(async () => {
      const res = await deleteCustomQuiz({ quizId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.push("/classroom/authoring");
      router.refresh();
    });
  }
  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/50 dark:bg-red-950/20">
      <h3 className="text-xs font-bold uppercase tracking-widest text-red-700 dark:text-red-300">
        Danger zone
      </h3>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="text-xs text-red-800 dark:text-red-300">
          Delete this quiz. Existing assignments that referenced it will
          stop working for students.
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Delete quiz
        </button>
      </div>
      {err && <p className="mt-2 text-xs font-semibold text-red-600">{err}</p>}
    </section>
  );
}

/* ─── Question form modal ──────────────────────────────────────── */

function QuestionFormModal({
  quizId,
  initial,
  onClose,
}: {
  quizId: string;
  initial: Question | null;
  onClose: () => void;
}) {
  const isEdit = !!initial;
  const [kind, setKind] = useState<QuestionKind>(initial?.kind ?? "multiple_choice");
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [hint, setHint] = useState(initial?.hint ?? "");
  const initialChoices =
    initial?.kind === "multiple_choice" && initial.choices
      ? (initial.choices as string[])
      : ["", "", "", ""];
  const [choices, setChoices] = useState<string[]>(initialChoices);
  const [correctMcq, setCorrectMcq] = useState<string>(
    initial?.kind === "multiple_choice" ? String(initial.correct) : "",
  );
  const [correctTf, setCorrectTf] = useState<"True" | "False">(
    initial?.kind === "true_false" && initial.correct === "False" ? "False" : "True",
  );
  const [fillAnswers, setFillAnswers] = useState<string>(
    initial?.kind === "fill_in_blank" && Array.isArray(initial.correct)
      ? (initial.correct as string[]).join(", ")
      : "",
  );
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setErr(null);
    start(async () => {
      const payload = buildPayload();
      if (typeof payload === "string") {
        setErr(payload);
        return;
      }
      const res = isEdit && initial
        ? await updateCustomQuestion({ questionId: initial.id, quizId, question: payload })
        : await addQuestionToQuiz({ quizId, question: payload });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      onClose();
    });
  }

  function buildPayload():
    | { kind: "multiple_choice"; prompt: string; choices: string[]; correct: string; hint?: string | null }
    | { kind: "true_false"; prompt: string; correct: "True" | "False"; hint?: string | null }
    | { kind: "fill_in_blank"; prompt: string; correct: string[]; hint?: string | null }
    | string {
    const p = prompt.trim();
    if (!p) return "Prompt is required.";
    const hintVal = hint.trim() || null;
    if (kind === "multiple_choice") {
      const c = choices.map((x) => x.trim()).filter(Boolean);
      if (c.length < 2) return "Add at least 2 choices.";
      if (!correctMcq.trim()) return "Pick the correct answer.";
      if (!c.includes(correctMcq.trim())) return "Correct answer must match one of the choices.";
      return {
        kind: "multiple_choice",
        prompt: p,
        choices: c,
        correct: correctMcq.trim(),
        hint: hintVal,
      };
    }
    if (kind === "true_false") {
      return {
        kind: "true_false",
        prompt: p,
        correct: correctTf,
        hint: hintVal,
      };
    }
    const answers = fillAnswers
      .split(/[,\n]/)
      .map((a) => a.trim())
      .filter(Boolean);
    if (answers.length === 0) return "At least one accepted answer is required.";
    return {
      kind: "fill_in_blank",
      prompt: p,
      correct: answers,
      hint: hintVal,
    };
  }

  function setChoice(idx: number, val: string) {
    setChoices((prev) => prev.map((c, i) => (i === idx ? val : c)));
  }
  function addChoice() {
    if (choices.length >= 6) return;
    setChoices([...choices, ""]);
  }
  function removeChoice(idx: number) {
    setChoices((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-slate-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            {isEdit ? "Edit question" : "New question"}
          </h3>
          <button
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <label className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
              Type
            </label>
            <div className="mt-1 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
              {(["multiple_choice", "true_false", "fill_in_blank"] as QuestionKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`rounded-full px-3 py-1 transition ${
                    kind === k
                      ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                      : "text-zinc-500"
                  }`}
                >
                  {kindLabel(k)}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
              Prompt
            </span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. What was the main idea of the passage?"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>

          {kind === "multiple_choice" && (
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                Choices (tap the radio for the correct answer)
              </label>
              <div className="mt-2 space-y-2">
                {choices.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-mcq"
                      checked={correctMcq === c && c.trim() !== ""}
                      onChange={() => setCorrectMcq(c)}
                      disabled={!c.trim()}
                      className="h-4 w-4 accent-indigo-600 disabled:opacity-40"
                    />
                    <input
                      value={c}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChoice(i, val);
                        if (correctMcq && c === correctMcq) setCorrectMcq(val);
                      }}
                      placeholder={`Choice ${i + 1}`}
                      className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    {choices.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(i)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        aria-label="Remove choice"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {choices.length < 6 && (
                  <button
                    type="button"
                    onClick={addChoice}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add choice
                  </button>
                )}
              </div>
            </div>
          )}

          {kind === "true_false" && (
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                Correct answer
              </label>
              <div className="mt-2 inline-flex gap-2">
                {(["True", "False"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCorrectTf(v)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                      correctTf === v
                        ? "bg-indigo-600 text-white"
                        : "border border-zinc-200 bg-white text-zinc-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {kind === "fill_in_blank" && (
            <label className="block">
              <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                Accepted answers (comma or newline-separated)
              </span>
              <textarea
                value={fillAnswers}
                onChange={(e) => setFillAnswers(e.target.value)}
                rows={2}
                placeholder="cat, kitten"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
              Hint (optional)
            </span>
            <input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Shown only if a student answers incorrectly."
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>

          {err && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              {err}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isEdit ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
