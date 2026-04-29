import { Camera, Info } from "lucide-react";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { hasAnyPaidTier } from "@/lib/plan/teacher-gate";
import HomeworkScanner from "./_components/HomeworkScanner";

export const dynamic = "force-dynamic";

export default async function HomeworkScanPage() {
  // Parent-side Readee+ feature.
  const profile = await requireProfile();
  if (!hasAnyPaidTier((profile as any).plan)) {
    redirect("/upgrade?reason=homework_scan");
  }
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600">
        <Camera className="h-4 w-4" />
        Homework scanner
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Scan a worksheet
        </h1>
        <details className="group">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-500 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 [&::-webkit-details-marker]:hidden">
            <Info className="h-3 w-3" />
            How it works
          </summary>
          <p className="mt-2 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-zinc-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-slate-300">
            Take a photo of a school packet, library book, or homework
            sheet. Readee figures out what skill it&apos;s testing and pulls
            practice questions on the same skill.
          </p>
        </details>
      </div>

      <div className="mt-6">
        <HomeworkScanner />
      </div>
    </div>
  );
}
