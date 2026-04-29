import { ClipboardCheck, Info } from "lucide-react";
import { requireTeacherTier } from "@/lib/plan/teacher-gate";
import WritingRubricForm from "./_components/WritingRubricForm";

export const dynamic = "force-dynamic";

export default async function WritingRubricPage() {
  await requireTeacherTier({ min: "premium", reason: "writing_rubric" });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-rose-600">
        <ClipboardCheck className="h-4 w-4" />
        Writing rubric
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Score student writing
        </h1>
        <details className="group">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-500 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 [&::-webkit-details-marker]:hidden">
            <Info className="h-3 w-3" />
            How it works
          </summary>
          <p className="mt-2 max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-zinc-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-slate-300">
            Paste the prompt and the student&apos;s response. Readee scores
            on a CCSS-aligned 1-4 scale (ideas, organization, voice,
            conventions) with a kid-friendly strength and growth tip.
          </p>
        </details>
      </div>
      <div className="mt-6">
        <WritingRubricForm />
      </div>
    </div>
  );
}
