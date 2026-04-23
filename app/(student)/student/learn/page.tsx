import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getStudentSession } from "@/lib/auth/student-session";
import StudentPracticeRunner from "./_components/StudentPracticeRunner";
import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";

export const dynamic = "force-dynamic";

type QuestionChoice = string;

type StandardQuestion = {
  id: string;
  type: string;
  prompt: string;
  choices?: QuestionChoice[];
  correct?: string | string[];
  hint?: string;
  difficulty?: number;
  audio_url?: string;
};

type Standard = {
  standard_id: string;
  standard_description: string;
  domain: string;
  questions: StandardQuestion[];
};

function findStandard(standardId: string): Standard | null {
  for (const bank of [kJson, g1Json, g2Json, g3Json, g4Json] as any[]) {
    const match = bank.standards?.find((s: Standard) => s.standard_id === standardId);
    if (match) return match;
  }
  return null;
}

export default async function StudentLearnPage({
  searchParams,
}: {
  searchParams: Promise<{ standard?: string }>;
}) {
  const session = await getStudentSession();
  if (!session) redirect("/class");

  const sp = await searchParams;
  const standardId = sp.standard;
  if (!standardId) notFound();

  const standard = findStandard(standardId);
  if (!standard) notFound();

  // Use only multiple_choice questions for v1 student flow — the other
  // interactive types assume the full /learn runtime which this pared-
  // down viewer doesn't load.
  const mcqs = standard.questions.filter((q) => q.type === "multiple_choice" && Array.isArray(q.choices) && q.choices.length >= 2);

  return (
    <div>
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="mt-3">
        <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          {standard.domain} · {standardId}
        </div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {standard.standard_description}
        </h1>
      </div>

      {mcqs.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            No practice questions available for this standard yet. Ask your
            teacher.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <StudentPracticeRunner standardId={standardId} questions={mcqs} />
        </div>
      )}
    </div>
  );
}
