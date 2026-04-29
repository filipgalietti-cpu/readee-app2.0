import { Wand2, Info } from "lucide-react";
import { requireTeacherTier } from "@/lib/plan/teacher-gate";
import CalibratedItemForm from "./_components/CalibratedItemForm";

export const dynamic = "force-dynamic";

export default async function CalibratedItemPage() {
  await requireTeacherTier({ min: "teacher_solo", reason: "calibrated_items" });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600">
        <Wand2 className="h-4 w-4" />
        Calibrated item builder
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Build one calibrated question
        </h1>
        <details className="group">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-500 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 [&::-webkit-details-marker]:hidden">
            <Info className="h-3 w-3" />
            How it works
          </summary>
          <p className="mt-2 max-w-2xl rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-zinc-700 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-slate-300">
            Pick a standard, grade, and target difficulty. Readee writes
            one MCQ that hits the difficulty band precisely with plausible
            distractors.
          </p>
        </details>
      </div>
      <div className="mt-6">
        <CalibratedItemForm />
      </div>
    </div>
  );
}
