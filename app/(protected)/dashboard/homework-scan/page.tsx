import { Camera } from "lucide-react";
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
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Snap any worksheet — get instant practice
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Take a photo of a school packet, library book, or homework
        sheet. Readee figures out what skill it&apos;s testing and pulls
        practice questions on the same skill.
      </p>

      <div className="mt-6">
        <HomeworkScanner />
      </div>
    </div>
  );
}
