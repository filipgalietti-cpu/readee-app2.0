"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap, X, Loader2, Check, Search } from "lucide-react";
import { createLiveQuiz } from "../../live-actions";
import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";

type LessonRef = {
  standardId: string;
  title: string;
  grade: string;
  domain: string;
};

function buildLessonIndex(): LessonRef[] {
  const out: LessonRef[] = [];
  const banks: [string, any][] = [
    ["K", kJson],
    ["1st", g1Json],
    ["2nd", g2Json],
    ["3rd", g3Json],
    ["4th", g4Json],
  ];
  for (const [grade, bank] of banks) {
    for (const s of bank.standards ?? []) {
      const mcqCount = (s.questions ?? []).filter(
        (q: any) => q.type === "multiple_choice",
      ).length;
      if (mcqCount === 0) continue;
      out.push({
        standardId: s.standard_id,
        title: s.standard_description,
        grade,
        domain: s.domain,
      });
    }
  }
  return out;
}

function getMcqIdsForStandard(standardId: string): string[] {
  for (const bank of [kJson, g1Json, g2Json, g3Json, g4Json] as any[]) {
    const match = bank.standards?.find((s: any) => s.standard_id === standardId);
    if (!match) continue;
    return (match.questions ?? [])
      .filter((q: any) => q.type === "multiple_choice")
      .map((q: any) => q.id);
  }
  return [];
}

export default function StartLiveQuizButton({
  classroomId,
  customQuizzes,
}: {
  classroomId: string;
  customQuizzes?: { id: string; title: string; question_count: number }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<"readee" | "custom">("readee");
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [pickedStandard, setPickedStandard] = useState<LessonRef | null>(null);
  const [pickedQuizId, setPickedQuizId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const lessons = useMemo(() => buildLessonIndex(), []);
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

  function close() {
    setOpen(false);
    setTimeout(() => {
      setSource("readee");
      setQuery("");
      setGradeFilter("All");
      setPickedStandard(null);
      setPickedQuizId(null);
      setErr(null);
    }, 200);
  }

  function launch() {
    setErr(null);
    start(async () => {
      if (source === "readee") {
        if (!pickedStandard) return;
        const ids = getMcqIdsForStandard(pickedStandard.standardId);
        if (ids.length === 0) {
          setErr("No MCQs in that standard.");
          return;
        }
        const res = await createLiveQuiz({
          classroomId,
          sourceKind: "readee_lesson",
          sourceId: pickedStandard.standardId,
          title: pickedStandard.title,
          questionIds: ids,
        });
        if (!res.ok) {
          setErr(res.error);
          return;
        }
        router.push(`/classroom/live/${res.sessionId}`);
      } else {
        if (!pickedQuizId) return;
        const quiz = customQuizzes?.find((q) => q.id === pickedQuizId);
        if (!quiz) return;
        const res = await createLiveQuiz({
          classroomId,
          sourceKind: "custom_quiz",
          sourceId: pickedQuizId,
          title: quiz.title,
          // Empty array means "all quiz questions" — resolved server-side
          // at host load. The custom_quiz case on the host page reads the
          // junction in order, so we just need the quiz id.
          questionIds: [pickedQuizId], // placeholder — host resolves from junction
        });
        if (!res.ok) {
          setErr(res.error);
          return;
        }
        router.push(`/classroom/live/${res.sessionId}`);
      }
    });
  }

  const customDisabled = !customQuizzes || customQuizzes.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 text-sm font-bold text-amber-800 transition hover:border-amber-400 hover:shadow-sm dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/30 dark:text-amber-300"
      >
        <Zap className="h-4 w-4" />
        Live quiz
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Start a live quiz
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
              <button
                type="button"
                onClick={() => setSource("readee")}
                className={`border-b-2 px-3 py-2 transition ${
                  source === "readee"
                    ? "border-indigo-600 text-indigo-700 dark:text-indigo-300"
                    : "border-transparent text-zinc-500"
                }`}
              >
                Readee standard
              </button>
              <button
                type="button"
                disabled={customDisabled}
                onClick={() => !customDisabled && setSource("custom")}
                className={`border-b-2 px-3 py-2 transition ${
                  source === "custom"
                    ? "border-indigo-600 text-indigo-700 dark:text-indigo-300"
                    : "border-transparent text-zinc-500"
                } disabled:opacity-40`}
              >
                My custom quiz
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {source === "readee" ? (
                <>
                  <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-2 dark:border-slate-800">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search standard or title"
                        className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <select
                      value={gradeFilter}
                      onChange={(e) => setGradeFilter(e.target.value)}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      {grades.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ul>
                    {filtered.slice(0, 80).map((l) => {
                      const chosen = pickedStandard?.standardId === l.standardId;
                      return (
                        <li key={l.standardId}>
                          <button
                            type="button"
                            onClick={() => setPickedStandard(l)}
                            className={`flex w-full items-start gap-3 border-b border-zinc-100 px-5 py-2.5 text-left transition hover:bg-zinc-50 dark:border-slate-800 dark:hover:bg-slate-800/40 ${
                              chosen ? "bg-indigo-50 dark:bg-indigo-950/30" : ""
                            }`}
                          >
                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 dark:border-slate-600">
                              {chosen && <Check className="h-3 w-3 text-indigo-600" />}
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
                      <li className="px-5 py-10 text-center text-sm text-zinc-500">
                        No standards match.
                      </li>
                    )}
                  </ul>
                </>
              ) : (
                <ul>
                  {(customQuizzes ?? []).map((cq) => {
                    const chosen = pickedQuizId === cq.id;
                    const disabled = cq.question_count === 0;
                    return (
                      <li key={cq.id}>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => setPickedQuizId(cq.id)}
                          className={`flex w-full items-start gap-3 border-b border-zinc-100 px-5 py-2.5 text-left transition disabled:opacity-50 dark:border-slate-800 ${
                            chosen
                              ? "bg-indigo-50 dark:bg-indigo-950/30"
                              : "hover:bg-zinc-50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 dark:border-slate-600">
                            {chosen && <Check className="h-3 w-3 text-indigo-600" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-zinc-900 dark:text-white">
                              {cq.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-zinc-500 dark:text-slate-400">
                              {cq.question_count} question
                              {cq.question_count === 1 ? "" : "s"}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                MCQ-only in v1. Timer + leaderboard are basic — more polish coming.
              </div>
              <div className="flex items-center gap-2">
                {err && <span className="text-xs font-semibold text-red-600">{err}</span>}
                <button
                  type="button"
                  onClick={launch}
                  disabled={
                    pending ||
                    (source === "readee" ? !pickedStandard : !pickedQuizId)
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-5 py-1.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Open lobby
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
