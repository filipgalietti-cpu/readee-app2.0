import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Library, ClipboardPen } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";
import LibraryBrowser from "./_components/LibraryBrowser";
import SemanticSearchBar from "../_components/SemanticSearchBar";

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
    audio_url?: string;
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
  imageUrl: string;
  audioUrl: string | null;
};

const SUPABASE_STORAGE =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

function gradeFolder(grade: string): string {
  if (grade === "K") return "kindergarten";
  if (grade === "1st") return "1st-grade";
  if (grade === "2nd") return "2nd-grade";
  if (grade === "3rd") return "3rd-grade";
  if (grade === "4th") return "4th-grade";
  return grade;
}

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
  for (const { grade, bank } of banks) {
    const standards = (bank.standards ?? []) as Standard[];
    const folder = gradeFolder(grade);
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
          imageUrl: `${SUPABASE_STORAGE}/images/${folder}/${s.standard_id}/${q.id}.png`,
          audioUrl: typeof q.audio_url === "string" ? q.audio_url : null,
        });
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/classroom"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to classrooms
      </Link>

      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          <Library className="h-4 w-4" />
          Question library
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {all.length.toLocaleString()} questions
          </h1>
          <Link
            href="/classroom/authoring"
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Your custom quizzes →
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <SemanticSearchBar isPremium={(profile as any).plan !== "free"} />
      </div>

      <div className="mt-6">
        <LibraryBrowser questions={all} />
      </div>
    </div>
  );
}
