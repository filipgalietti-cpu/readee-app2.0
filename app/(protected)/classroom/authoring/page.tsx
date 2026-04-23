import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardPen, Plus, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import CreateQuizButton from "./_components/CreateQuizButton";

export const dynamic = "force-dynamic";

export default async function AuthoringHomePage() {
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const supabase = await createClient();

  const { data: quizzes } = await supabase
    .from("custom_quizzes")
    .select("id, title, description, grade_level, updated_at")
    .eq("teacher_id", profile.id)
    .order("updated_at", { ascending: false });

  // Count questions per quiz
  const list = (quizzes ?? []) as {
    id: string;
    title: string;
    description: string | null;
    grade_level: string | null;
    updated_at: string;
  }[];
  const quizIds = list.map((q) => q.id);
  const { data: counts } = quizIds.length
    ? await supabase
        .from("custom_quiz_questions")
        .select("quiz_id")
        .in("quiz_id", quizIds)
    : { data: [] as any[] };
  const byQuiz = new Map<string, number>();
  (counts ?? []).forEach((r: any) => {
    byQuiz.set(r.quiz_id, (byQuiz.get(r.quiz_id) ?? 0) + 1);
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            <ClipboardPen className="h-4 w-4" />
            Authoring
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Your custom quizzes
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
            Write your own multiple-choice, true/false, and fill-in-blank
            questions. Assign any quiz to your classroom.
          </p>
        </div>
        <CreateQuizButton />
      </div>

      {list.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-zinc-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
            <ClipboardPen className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
            No quizzes yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-slate-400">
            Build a quick quiz from scratch. Readee&apos;s 900+ standards-aligned
            questions are always available separately via New Assignment.
          </p>
          <div className="mt-6">
            <CreateQuizButton />
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((q) => {
            const count = byQuiz.get(q.id) ?? 0;
            return (
              <li key={q.id}>
                <Link
                  href={`/classroom/authoring/quiz/${q.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                    <ClipboardPen className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-zinc-900 dark:text-white">
                      {q.title}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                      {count} question{count === 1 ? "" : "s"}
                      {q.grade_level ? ` · ${q.grade_level}` : ""}
                      {" · Updated "}
                      {new Date(q.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    {q.description && (
                      <div className="mt-1 line-clamp-1 text-xs text-zinc-500 dark:text-slate-400">
                        {q.description}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-400" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 text-xs text-zinc-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
        <strong>Tip:</strong> once a quiz has at least one question, you can
        assign it to any of your classrooms the same way you assign Readee
        lessons — from the classroom&apos;s Assignments tab.
      </div>
    </div>
  );
}
