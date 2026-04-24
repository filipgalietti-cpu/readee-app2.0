import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Library, ClipboardPen } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";
import LibraryBrowser from "./_components/LibraryBrowser";

export const dynamic = "force-dynamic";

type Standard = {
  standard_id: string;
  standard_description: string;
  domain: string;
  questions: {
    id: string;
    type: string;
    prompt: string;
    choices?: string[];
    correct?: string | string[];
    difficulty?: number;
  }[];
};

type LibraryQuestion = {
  id: string;
  grade: string;
  standardId: string;
  standardTitle: string;
  domain: string;
  type: string;
  prompt: string;
  choices: string[] | null;
  correct: string | null;
  difficulty: number | null;
};

export default async function LibraryPage() {
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const banks: { grade: string; bank: any }[] = [
    { grade: "K", bank: kJson },
    { grade: "1st", bank: g1Json },
    { grade: "2nd", bank: g2Json },
    { grade: "3rd", bank: g3Json },
    { grade: "4th", bank: g4Json },
  ];

  const all: LibraryQuestion[] = [];
  let byTypeTotals: Record<string, number> = {};
  let perGrade: Record<string, number> = {};
  let perGradeStandards: Record<string, number> = {};

  for (const { grade, bank } of banks) {
    const standards = (bank.standards ?? []) as Standard[];
    perGradeStandards[grade] = standards.length;
    for (const s of standards) {
      for (const q of s.questions ?? []) {
        all.push({
          id: q.id,
          grade,
          standardId: s.standard_id,
          standardTitle: s.standard_description,
          domain: s.domain,
          type: q.type,
          prompt: q.prompt,
          choices: Array.isArray(q.choices) ? q.choices : null,
          correct: Array.isArray(q.correct)
            ? q.correct.join(" / ")
            : typeof q.correct === "string"
            ? q.correct
            : null,
          difficulty: typeof q.difficulty === "number" ? q.difficulty : null,
        });
        byTypeTotals[q.type] = (byTypeTotals[q.type] ?? 0) + 1;
        perGrade[grade] = (perGrade[grade] ?? 0) + 1;
      }
    }
  }

  // Also count the teacher's own custom questions for the summary.
  const supabase = await createClient();
  const { count: customCount } = await supabase
    .from("custom_questions")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", profile.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/classroom"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to classrooms
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            <Library className="h-4 w-4" />
            Question library
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {all.length.toLocaleString()} Readee questions
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-slate-400">
            Browse every CCSS-aligned question in Readee. Use filters to narrow
            by grade or type, search by prompt, then jump into Assignment to
            assign any standard to your class. Your {customCount ?? 0} custom
            question{customCount === 1 ? "" : "s"} live in{" "}
            <Link
              href="/classroom/authoring"
              className="font-semibold text-indigo-600 underline"
            >
              Authoring
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="mt-8 grid gap-3 sm:grid-cols-5">
        {banks.map(({ grade }) => (
          <div
            key={grade}
            className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              {grade === "K" ? "Kindergarten" : `${grade} grade`}
            </div>
            <div className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-white">
              {perGrade[grade] ?? 0}
            </div>
            <div className="text-[11px] text-zinc-400">
              across {perGradeStandards[grade] ?? 0} standards
            </div>
          </div>
        ))}
      </div>

      {/* Type breakdown */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
        {Object.entries(byTypeTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([t, n]) => (
            <span
              key={t}
              className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-semibold text-zinc-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400"
            >
              {t.replace(/_/g, " ")}:{" "}
              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                {n}
              </span>
            </span>
          ))}
      </div>

      <div className="mt-8">
        <LibraryBrowser questions={all} />
      </div>

      <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 text-xs text-zinc-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
        <strong>To assign:</strong> find the standard you want, then open any of your
        classrooms → Assignments tab → New assignment. The picker lets you
        select specific questions and set a pass threshold per class.
      </div>
    </div>
  );
}
