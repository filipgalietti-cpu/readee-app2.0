import Link from "next/link";
import { ArrowRight, Wand2, Sparkles } from "lucide-react";
import { requireTeacherTier } from "@/lib/plan/teacher-gate";

export const dynamic = "force-dynamic";

/**
 * Calibrated Item Builder was folded into Quiz builder's "+ Add question
 * → AI fill" modal. The standalone route is kept alive only as a
 * redirect surface so old deep-links and Reports drill-downs land
 * somewhere helpful instead of 404'ing.
 */
export default async function CalibratedItemPage() {
  await requireTeacherTier({ min: "teacher_solo", reason: "calibrated_items" });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-8 text-center shadow-sm dark:border-violet-900/40 dark:from-violet-950/30 dark:to-indigo-950/30">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md">
          <Wand2 className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Calibrated questions moved
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-slate-400">
          Generating one targeted question now lives inside Quiz builder.
          Open any custom quiz, click <span className="font-bold">+ Add question</span>,
          and switch the method to <span className="font-bold">AI fill</span>.
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-slate-500">
          You get the same Grade → Domain → Standard picker, the same
          difficulty slider, and the same optional anchor passage —
          plus the question lands in a real quiz instead of a one-off page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/classroom/authoring"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"
          >
            <Sparkles className="h-4 w-4" />
            Open Quiz builder
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/classroom/tools"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            All tools
          </Link>
        </div>
      </div>
    </div>
  );
}
