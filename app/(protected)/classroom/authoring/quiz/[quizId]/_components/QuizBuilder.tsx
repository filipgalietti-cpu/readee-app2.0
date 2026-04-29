"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Loader2, X, Check, AlertCircle, Lightbulb, ImagePlus, Sparkles, Volume2, RefreshCw, Wand2 } from "lucide-react";
import {
  addQuestionToQuiz,
  updateCustomQuestion,
  removeQuestionFromQuiz,
  deleteCustomQuiz,
  updateCustomQuiz,
  aiGenerateImage,
  aiGenerateAudio,
  aiGeneratePassage,
} from "../../../../authoring-actions";
import TopUpCreditsButton from "@/app/_components/TopUpCreditsButton";
import CsvImportButton from "./CsvImportButton";
import RegenerateQuestionButton from "./RegenerateQuestionButton";

type QuestionKind =
  | "multiple_choice"
  | "true_false"
  | "fill_in_blank"
  | "matching_pairs"
  | "free_response";

type Question = {
  id: string;
  position: number;
  kind: QuestionKind;
  prompt: string;
  choices: string[] | null;
  correct: any;
  hint: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
};

export type StandardOption = {
  standardId: string;
  title: string;
  standardDescription: string;
  domain: string;
  grade: string;
  gradeLabel: string;
};

export default function QuizBuilder({
  quizId,
  initialTitle,
  initialDescription,
  initialGradeLevel,
  questions,
  passageImageUrl,
  passageAudioUrl,
  standards,
}: {
  quizId: string;
  initialTitle: string;
  initialDescription: string;
  initialGradeLevel: string;
  questions: Question[];
  /** When the wizard generated a passage hero, every question is
   *  stamped with the same image/audio URL. We suppress those on the
   *  per-question cards so the teacher isn't seeing the same image
   *  ten times. Real per-question media (added manually) still shows. */
  passageImageUrl?: string | null;
  passageAudioUrl?: string | null;
  /** Standards catalog feeding the in-modal "AI fill" picker. */
  standards: StandardOption[];
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
            <CsvImportButton quizId={quizId} />
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
          <ul className="mt-3 space-y-3">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                quizId={quizId}
                q={q}
                index={i}
                onEdit={() => setEditing(q)}
                passageImageUrl={passageImageUrl ?? null}
                passageAudioUrl={passageAudioUrl ?? null}
              />
            ))}
          </ul>
        )}
      </section>

      <DangerZone quizId={quizId} />

      {(creating || editing) && (
        <QuestionFormModal
          quizId={quizId}
          initial={editing}
          standards={standards}
          quizGradeLevel={initialGradeLevel}
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
  if (k === "matching_pairs") return "Matching pairs";
  if (k === "free_response") return "Writing response";
  return "Fill in the blank";
}

/**
 * QuestionCard — teacher-friendly review tile for one question.
 *
 * Replaces the dense list row with a card that shows the question
 * the way a kid would see it: prompt as headline, choices as actual
 * tappable-looking chips, image at a useful size. Action toolbar
 * (regenerate / edit / delete) lives at the top-right.
 */
function QuestionCard({
  quizId,
  q,
  index,
  onEdit,
  passageImageUrl,
  passageAudioUrl,
}: {
  quizId: string;
  q: Question;
  index: number;
  onEdit: () => void;
  passageImageUrl: string | null;
  passageAudioUrl: string | null;
}) {
  // Suppress per-question media when it's the same URL as the shared
  // passage hero. The teacher is looking at the hero already; redundant
  // copies on every card are noise. Real per-question media (manual)
  // has a different URL and still renders.
  const showImage = q.imageUrl && q.imageUrl !== passageImageUrl;
  const showAudio = q.audioUrl && q.audioUrl !== passageAudioUrl;
  return (
    <li className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900/40">
      {/* Header strip */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-5 py-2.5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
            {index + 1}
          </span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            {kindLabel(q.kind)}
          </span>
          {showAudio && (
            <button
              type="button"
              onClick={() => {
                const a = new Audio(q.audioUrl!);
                a.play().catch(() => {});
              }}
              className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 transition hover:bg-violet-100 dark:bg-violet-950/30 dark:text-violet-300"
              title="Play question audio"
            >
              <Volume2 className="h-3 w-3" />
              Audio
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {q.kind !== "free_response" && (
            <RegenerateQuestionButton
              quizId={quizId}
              questionId={q.id}
              kind={q.kind}
            />
          )}
          {q.kind !== "matching_pairs" && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-indigo-400 transition hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/40"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          <RemoveQuestionButton quizId={quizId} questionId={q.id} />
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-4">
          {showImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={q.imageUrl!}
              alt=""
              className="h-24 w-24 flex-shrink-0 rounded-xl border border-zinc-200 object-cover dark:border-slate-700"
            />
          )}
          <div className="min-w-0 flex-1">
            <p
              className="whitespace-pre-line text-[15px] font-semibold leading-snug text-zinc-900 dark:text-white"
              style={{
                fontFamily:
                  'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
              }}
            >
              {q.prompt}
            </p>
          </div>
        </div>

        <div className="mt-4">{renderChoicesAsCards(q)}</div>

        {q.hint && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
            <div>
              <span className="font-bold">Hint: </span>
              {q.hint}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Renders the answer choices the way a kid would see them — as
 * tappable-looking chips with the correct one outlined in green.
 */
function renderChoicesAsCards(q: Question): React.ReactNode {
  if (q.kind === "multiple_choice" && Array.isArray(q.choices)) {
    const correct = String(q.correct);
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {q.choices.map((c, i) => {
          const isCorrect = c === correct;
          return (
            <div
              key={`${i}-${c}`}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "border-zinc-200 bg-white text-zinc-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {isCorrect && (
                <Check className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              )}
              <span className="truncate">{c}</span>
            </div>
          );
        })}
      </div>
    );
  }
  if (q.kind === "true_false") {
    const correct = q.correct;
    return (
      <div className="grid grid-cols-2 gap-2">
        {(["True", "False"] as const).map((label) => {
          const isCorrect = correct === label;
          return (
            <div
              key={label}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "border-zinc-200 bg-white text-zinc-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {isCorrect && <Check className="h-4 w-4 text-emerald-600" />}
              {label}
            </div>
          );
        })}
      </div>
    );
  }
  if (q.kind === "fill_in_blank" && Array.isArray(q.correct)) {
    return (
      <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs dark:bg-emerald-950/20">
        <span className="font-bold text-emerald-800 dark:text-emerald-300">
          Accepted answers:{" "}
        </span>
        <span className="text-emerald-900 dark:text-emerald-200">
          {q.correct.join(" · ")}
        </span>
      </div>
    );
  }
  if (q.kind === "matching_pairs") {
    const pairs = (q.correct?.pairs ?? []) as { left: string; right: string }[];
    return (
      <div className="grid gap-2">
        {pairs.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex-1 font-semibold text-zinc-800 dark:text-slate-200">
              {p.left}
            </div>
            <div className="text-zinc-300">→</div>
            <div className="flex-1 rounded-lg bg-violet-50 px-2 py-1 font-semibold text-violet-800 dark:bg-violet-950/30 dark:text-violet-300">
              {p.right}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (q.kind === "free_response") {
    return (
      <div className="rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/40 px-3 py-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
        <div className="font-bold">AI-graded writing response</div>
        <div className="mt-0.5 text-rose-700 dark:text-rose-300">
          Student types an answer; Readee scores it on a 4-domain rubric
          (ideas, organization, voice, conventions) and surfaces a
          strength + growth tip.
        </div>
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
  standards,
  quizGradeLevel,
}: {
  quizId: string;
  initial: Question | null;
  onClose: () => void;
  standards: StandardOption[];
  quizGradeLevel: string;
}) {
  const isEdit = !!initial;
  // "Manual" preserves the existing flow; "ai-fill" pre-populates the
  // form via the calibrated-item endpoint so the teacher can review +
  // edit before saving. AI fill is hidden on edit (the existing
  // question is already populated; regenerate lives on the card).
  const [authorMode, setAuthorMode] = useState<"manual" | "ai-fill">("manual");
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
  // ── AI-fill picker state ─────────────────────────────────────
  const GRADES = ["K", "1st", "2nd", "3rd", "4th"] as const;
  const normalizedGrade = (() => {
    const g = (quizGradeLevel ?? "").trim().toLowerCase();
    if (g === "k" || g === "kindergarten") return "K";
    if (g === "1st" || g === "1" || g === "1st-grade" || g === "first") return "1st";
    if (g === "2nd" || g === "2" || g === "2nd-grade" || g === "second") return "2nd";
    if (g === "3rd" || g === "3" || g === "3rd-grade" || g === "third") return "3rd";
    if (g === "4th" || g === "4" || g === "4th-grade" || g === "fourth") return "4th";
    return "2nd";
  })();
  const [aiGrade, setAiGrade] = useState<string>(normalizedGrade);
  const aiStandardsForGrade = standards.filter((s) => s.grade === aiGrade);
  const aiDomains = Array.from(new Set(aiStandardsForGrade.map((s) => s.domain))).sort();
  const [aiDomain, setAiDomain] = useState<string>(aiDomains[0] ?? "");
  useEffect(() => {
    if (aiDomains.length === 0) {
      setAiDomain("");
      return;
    }
    if (!aiDomains.includes(aiDomain)) setAiDomain(aiDomains[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiDomains.join("|")]);
  const aiStandardsInDomain = aiStandardsForGrade.filter((s) => s.domain === aiDomain);
  const [aiStandardId, setAiStandardId] = useState<string>(
    () => aiStandardsInDomain[0]?.standardId ?? "",
  );
  useEffect(() => {
    if (aiStandardsInDomain.length === 0) {
      setAiStandardId("");
      return;
    }
    if (!aiStandardsInDomain.some((s) => s.standardId === aiStandardId)) {
      setAiStandardId(aiStandardsInDomain[0].standardId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiStandardsInDomain.map((s) => s.standardId).join("|")]);
  const aiSelectedStandard = aiStandardsInDomain.find((s) => s.standardId === aiStandardId);
  const [aiDifficulty, setAiDifficulty] = useState(3);
  const [aiPending, setAiPending] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);

  // Optional anchor passage — paste your own OR generate. Lets the teacher
  // ground the question in a passage the class is already reading. Mirrors
  // the standalone Calibrated Item form so the in-modal flow doesn't lose
  // the differentiator that justifies the tool.
  const [aiPassageContext, setAiPassageContext] = useState("");
  const [aiPassageMode, setAiPassageMode] = useState<"paste" | "generate">("paste");
  const [aiPassageTopic, setAiPassageTopic] = useState("");
  const [aiPassageLength, setAiPassageLength] = useState<"short" | "medium" | "long">("short");
  const [aiPassagePending, setAiPassagePending] = useState(false);
  const [aiPassageErr, setAiPassageErr] = useState<string | null>(null);

  // Last-result metadata — surfaced after AI fill so the teacher can see
  // *why* the AI picked these distractors (Bloom's level + the
  // skill microlabel the calibration engine used).
  const [aiResultMeta, setAiResultMeta] = useState<{
    bloomsLevel: string;
    skillMicrolabel: string;
    difficultyActual: number;
  } | null>(null);

  async function aiGeneratePassageNow() {
    setAiPassageErr(null);
    const topic =
      aiPassageTopic.trim() ||
      (aiSelectedStandard
        ? `A short reading passage suitable for practicing "${aiSelectedStandard.title}" at grade ${aiGrade}.`
        : "");
    if (!topic) {
      setAiPassageErr("Pick a standard or type a topic first.");
      return;
    }
    setAiPassagePending(true);
    try {
      const res = await aiGeneratePassage({
        topic,
        gradeLevel: aiGrade,
        lengthLevel: aiPassageLength,
      });
      if (!res.ok) {
        setAiPassageErr(res.error);
        return;
      }
      setAiPassageContext(res.passage.passage);
    } catch (e: any) {
      setAiPassageErr(e?.message ?? "Could not generate.");
    } finally {
      setAiPassagePending(false);
    }
  }

  async function aiFill() {
    if (!aiSelectedStandard) {
      setAiErr("Pick a standard first.");
      return;
    }
    setAiErr(null);
    setAiPending(true);
    try {
      const r = await fetch("/api/calibrated-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standardId: aiSelectedStandard.standardId,
          standardDescription: aiSelectedStandard.standardDescription,
          gradeLevel: aiGrade,
          targetDifficulty: aiDifficulty,
          passageContext: aiPassageContext.trim() || null,
        }),
      });
      const json = await r.json();
      if (!json.ok) {
        setAiErr(json.error ?? "Couldn't generate.");
        return;
      }
      const item = json.item as {
        prompt: string;
        choices: string[];
        correct: string;
        hint: string | null;
        bloomsLevel: string;
        skillMicrolabel: string;
        difficultyActual: number;
      };
      // Pipe the AI output into the existing manual form state so the
      // teacher can review + edit before saving. Force MCQ since the
      // calibrated-item endpoint only emits multiple choice.
      setKind("multiple_choice");
      setPrompt(item.prompt);
      const filled = [...item.choices];
      while (filled.length < 4) filled.push("");
      setChoices(filled.slice(0, Math.max(4, filled.length)));
      setCorrectMcq(item.correct);
      setHint(item.hint ?? "");
      setAiResultMeta({
        bloomsLevel: item.bloomsLevel,
        skillMicrolabel: item.skillMicrolabel,
        difficultyActual: item.difficultyActual,
      });
      setAuthorMode("manual");
    } catch (e: any) {
      setAiErr(e?.message ?? "Couldn't generate.");
    } finally {
      setAiPending(false);
    }
  }

  function gradeLengthRange(grade: string, tier: "short" | "medium" | "long"): string {
    const ranges: Record<string, Record<string, string>> = {
      K: { short: "20-35 words", medium: "35-50 words", long: "50-70 words" },
      "1st": { short: "40-70 words", medium: "70-100 words", long: "100-140 words" },
      "2nd": { short: "60-100 words", medium: "100-150 words", long: "150-220 words" },
      "3rd": { short: "100-160 words", medium: "160-240 words", long: "240-340 words" },
      "4th": { short: "150-220 words", medium: "220-320 words", long: "320-450 words" },
    };
    return ranges[grade]?.[tier] ?? "";
  }

  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [visualPrompt, setVisualPrompt] = useState("");
  const [imgPending, setImgPending] = useState(false);
  const [imgErr, setImgErr] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(initial?.audioUrl ?? null);
  const [ttsPending, setTtsPending] = useState(false);
  const [ttsErr, setTtsErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function generateImage(overridePrompt?: string) {
    const vp = (overridePrompt ?? visualPrompt).trim();
    if (!vp) {
      setImgErr("Describe what you'd like to see.");
      return;
    }
    setImgErr(null);
    setImgPending(true);
    try {
      const res = await aiGenerateImage({ prompt: vp });
      if (!res.ok) {
        setImgErr(res.error);
        return;
      }
      setImageUrl(res.imageUrl);
      // keep visualPrompt around so "Regenerate" works without retyping
    } finally {
      setImgPending(false);
    }
  }

  async function generateAudio() {
    const text = prompt.trim();
    if (!text) {
      setTtsErr("Add a prompt first — we read that aloud.");
      return;
    }
    setTtsErr(null);
    setTtsPending(true);
    try {
      const res = await aiGenerateAudio({ text });
      if (!res.ok) {
        setTtsErr(res.error);
        return;
      }
      setAudioUrl(res.audioUrl);
    } finally {
      setTtsPending(false);
    }
  }

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
    | { kind: "multiple_choice"; prompt: string; choices: string[]; correct: string; hint?: string | null; imageUrl?: string | null; audioUrl?: string | null }
    | { kind: "true_false"; prompt: string; correct: "True" | "False"; hint?: string | null; imageUrl?: string | null; audioUrl?: string | null }
    | { kind: "fill_in_blank"; prompt: string; correct: string[]; hint?: string | null; imageUrl?: string | null; audioUrl?: string | null }
    | { kind: "free_response"; prompt: string; hint?: string | null; imageUrl?: string | null; audioUrl?: string | null }
    | string {
    const p = prompt.trim();
    if (!p) return "Prompt is required.";
    const hintVal = hint.trim() || null;
    const imageVal = imageUrl || null;
    const audioVal = audioUrl || null;
    if (kind === "free_response") {
      return {
        kind: "free_response",
        prompt: p,
        hint: hintVal,
        imageUrl: imageVal,
        audioUrl: audioVal,
      };
    }
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
        imageUrl: imageVal,
        audioUrl: audioVal,
      };
    }
    if (kind === "true_false") {
      return {
        kind: "true_false",
        prompt: p,
        correct: correctTf,
        hint: hintVal,
        imageUrl: imageVal,
        audioUrl: audioVal,
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
      imageUrl: imageVal,
      audioUrl: audioVal,
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
          <div className="flex items-center gap-2">
            <AiBudgetBadge refreshKey={imageUrl ?? audioUrl ?? ""} />
            <TopUpCreditsButton pool="teacher" label="Top up" />
            <button
              onClick={onClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {!isEdit && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                Method
              </span>
              <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setAuthorMode("manual")}
                  className={`rounded-full px-3 py-1 transition ${
                    authorMode === "manual"
                      ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                      : "text-zinc-500"
                  }`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => setAuthorMode("ai-fill")}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition ${
                    authorMode === "ai-fill"
                      ? "bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300"
                      : "text-zinc-500"
                  }`}
                >
                  <Wand2 className="h-3 w-3" />
                  AI fill
                </button>
              </div>
            </div>
          )}

          {!isEdit && authorMode === "ai-fill" && (
            <div className="space-y-4 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 dark:border-violet-900/40 dark:from-violet-950/30 dark:to-indigo-950/30">
              <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-slate-400">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-600" />
                <span>
                  Pick a standard + difficulty. Readee writes one calibrated MCQ.
                  You&apos;ll review and edit it before saving.
                </span>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                  1. Grade
                </div>
                <div className="mt-1 inline-flex rounded-full border border-zinc-200 bg-white p-0.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setAiGrade(g)}
                      className={`rounded-full px-3 py-1 transition ${
                        aiGrade === g
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-zinc-500"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                  2. Domain
                </div>
                <select
                  value={aiDomain}
                  onChange={(e) => setAiDomain(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {aiDomains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                  3. Standard
                </div>
                <select
                  value={aiStandardId}
                  onChange={(e) => setAiStandardId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {aiStandardsInDomain.map((s) => (
                    <option key={s.standardId} value={s.standardId}>
                      {s.title}
                    </option>
                  ))}
                </select>
                {aiSelectedStandard && (
                  <div className="mt-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                    <span className="mr-2 inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                      {aiSelectedStandard.standardId}
                    </span>
                    {aiSelectedStandard.standardDescription}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                  4. Target difficulty
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(Number(e.target.value))}
                  className="mt-2 w-full accent-violet-600"
                />
                <div className="mt-1 flex justify-between text-[10px] font-semibold text-zinc-500 dark:text-slate-400">
                  <span>Below grade</span>
                  <span>On grade</span>
                  <span>Above grade</span>
                </div>
                <div className="mt-1 text-center text-xs font-bold text-violet-700 dark:text-violet-300">
                  {["", "Below grade", "Easy on-grade", "On grade (typical)", "Hard on-grade", "Above grade"][aiDifficulty]}
                </div>
              </div>

              <details className="group rounded-xl border border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-[11px] font-bold text-zinc-500 [&::-webkit-details-marker]:hidden">
                  <span>
                    5. Anchor to a passage{" "}
                    <span className="font-normal text-zinc-400">(optional)</span>
                  </span>
                  <span className="text-zinc-400 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="px-3 pb-3">
                  <div className="mb-2 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-[11px] font-bold dark:border-slate-700 dark:bg-slate-950">
                    <button
                      type="button"
                      onClick={() => setAiPassageMode("paste")}
                      className={`rounded-full px-2.5 py-0.5 transition ${
                        aiPassageMode === "paste"
                          ? "bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300"
                          : "text-zinc-500"
                      }`}
                    >
                      Paste
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiPassageMode("generate")}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 transition ${
                        aiPassageMode === "generate"
                          ? "bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300"
                          : "text-zinc-500"
                      }`}
                    >
                      <Wand2 className="h-3 w-3" />
                      Generate
                    </button>
                  </div>

                  {aiPassageMode === "generate" && (
                    <div className="mb-2 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-900/40 dark:bg-violet-950/30">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                        Theme
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {[
                          "animals",
                          "weather",
                          "space",
                          "sports",
                          "food",
                          "friendship",
                          "inventions",
                          "community helpers",
                        ].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setAiPassageTopic(t)}
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                              aiPassageTopic === t
                                ? "border-violet-500 bg-violet-600 text-white"
                                : "border-violet-200 bg-white text-violet-700 hover:bg-violet-100 dark:border-violet-900/40 dark:bg-slate-900 dark:text-violet-300"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={aiPassageTopic}
                        onChange={(e) => setAiPassageTopic(e.target.value)}
                        placeholder={
                          aiSelectedStandard
                            ? `Or type a topic (default: passage targeting "${aiSelectedStandard.title}")`
                            : "Or type a topic"
                        }
                        className="mt-2 w-full rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-xs focus:border-violet-500 focus:outline-none dark:border-violet-900/40 dark:bg-slate-900"
                      />
                      <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                        Length
                      </div>
                      <div className="mt-1 flex gap-1.5">
                        {(["short", "medium", "long"] as const).map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setAiPassageLength(tier)}
                            className={`flex-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                              aiPassageLength === tier
                                ? "border-violet-500 bg-violet-600 text-white"
                                : "border-violet-200 bg-white text-violet-700 hover:bg-violet-100 dark:border-violet-900/40 dark:bg-slate-900 dark:text-violet-300"
                            }`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                      <div className="mt-1 text-[10px] text-violet-700 dark:text-violet-300">
                        {gradeLengthRange(aiGrade, aiPassageLength)}
                      </div>
                      <button
                        type="button"
                        onClick={aiGeneratePassageNow}
                        disabled={aiPassagePending}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
                      >
                        {aiPassagePending ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Writing…
                          </>
                        ) : aiPassageContext ? (
                          <>
                            <Wand2 className="h-3 w-3" />
                            Try another
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-3 w-3" />
                            Generate passage
                          </>
                        )}
                      </button>
                      {aiPassageErr && (
                        <div className="mt-2 text-[11px] font-semibold text-red-600">
                          {aiPassageErr}
                        </div>
                      )}
                    </div>
                  )}

                  <textarea
                    value={aiPassageContext}
                    onChange={(e) => setAiPassageContext(e.target.value)}
                    rows={4}
                    placeholder={
                      aiPassageMode === "paste"
                        ? "Paste a passage the class is reading. The question will be grounded in this text."
                        : "Generated passage will appear here. You can edit it before generating the question."
                    }
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </details>

              {aiErr && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>{aiErr}</span>
                </div>
              )}

              <button
                type="button"
                onClick={aiFill}
                disabled={aiPending || !aiSelectedStandard}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Writing the question…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          )}

          {!isEdit && authorMode === "manual" && aiResultMeta && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] dark:border-violet-900/40 dark:bg-violet-950/30">
              <span className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                <Sparkles className="h-3 w-3" />
                AI calibration
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-violet-700 dark:bg-slate-900 dark:text-violet-300">
                Bloom: {aiResultMeta.bloomsLevel}
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-violet-700 dark:bg-slate-900 dark:text-violet-300">
                Skill: {aiResultMeta.skillMicrolabel}
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-violet-700 dark:bg-slate-900 dark:text-violet-300">
                Difficulty: {aiResultMeta.difficultyActual}/5
              </span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
              Type
            </label>
            <div className="mt-1 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
              {(["multiple_choice", "true_false", "fill_in_blank", "free_response"] as QuestionKind[]).map((k) => (
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

          {kind === "free_response" && (
            <div className="rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/40 px-3 py-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
              <div className="font-bold">AI-graded writing response</div>
              <div className="mt-0.5 text-rose-700 dark:text-rose-300">
                The student types an answer to the prompt above. Readee
                rubric-scores it on Ideas / Organization / Voice /
                Conventions and returns a strength + growth tip.
                You&apos;ll see the score in this quiz&apos;s submissions
                view; the parent dashboard surfaces a writing trend
                over time.
              </div>
            </div>
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

          <div>
            <div className="flex items-center gap-2">
              <ImagePlus className="h-3.5 w-3.5 text-zinc-500 dark:text-slate-400" />
              <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                Image (optional)
              </span>
            </div>
            {imageUrl ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-24 w-24 flex-shrink-0 rounded-lg border border-zinc-200 object-cover dark:border-slate-700"
                  />
                  <div className="flex-1 text-xs text-zinc-500 dark:text-slate-400">
                    Attached to this question.
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => generateImage()}
                        disabled={imgPending || !visualPrompt.trim()}
                        className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50 dark:border-violet-700 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-violet-950/30"
                        title={visualPrompt.trim() ? "Regenerate with the same prompt" : "Edit prompt to regenerate"}
                      >
                        {imgPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl(null)}
                        className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
                <input
                  value={visualPrompt}
                  onChange={(e) => setVisualPrompt(e.target.value)}
                  placeholder="Change the description and click Regenerate"
                  disabled={imgPending}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                {imgErr && (
                  <p className="text-xs font-semibold text-red-600">{imgErr}</p>
                )}
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <input
                  value={visualPrompt}
                  onChange={(e) => setVisualPrompt(e.target.value)}
                  placeholder="Describe the image — e.g. a red apple on a white plate"
                  disabled={imgPending}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => generateImage()}
                  disabled={imgPending || !visualPrompt.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {imgPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Generate with Readee.ai
                </button>
                {imgErr && (
                  <p className="text-xs font-semibold text-red-600">{imgErr}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-3.5 w-3.5 text-zinc-500 dark:text-slate-400" />
              <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
                Prompt audio (optional)
              </span>
            </div>
            {audioUrl ? (
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
                  <audio src={audioUrl} controls className="min-w-0 flex-1" />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={generateAudio}
                      disabled={ttsPending || !prompt.trim()}
                      className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50 dark:border-violet-700 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-violet-950/30"
                      title="Regenerate audio from the current prompt"
                    >
                      {ttsPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioUrl(null)}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
                {ttsErr && <p className="text-xs font-semibold text-red-600">{ttsErr}</p>}
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-zinc-500 dark:text-slate-400">
                  Generates a warm read-aloud of the prompt above. Regenerate
                  if you edit the prompt text.
                </p>
                <button
                  type="button"
                  onClick={generateAudio}
                  disabled={ttsPending || !prompt.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {ttsPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Read prompt aloud with Readee.ai
                </button>
                {ttsErr && (
                  <p className="text-xs font-semibold text-red-600">{ttsErr}</p>
                )}
              </div>
            )}
          </div>

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

function AiBudgetBadge({ refreshKey }: { refreshKey: string }) {
  const [data, setData] = useState<{
    monthly: { used: number; limit: number; remaining: number };
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/classroom/ai-budget")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (!data) return null;
  const { used, limit, remaining } = data.monthly;
  const pct = limit === 0 ? 0 : Math.round((used / limit) * 100);
  const warn = pct >= 80;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        warn
          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          : "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
      }`}
      title={`Readee.ai credits this month — ${used} of ${limit} used, ${remaining} remaining.`}
    >
      <Sparkles className="h-3 w-3" />
      {remaining} / {limit}
    </span>
  );
}
