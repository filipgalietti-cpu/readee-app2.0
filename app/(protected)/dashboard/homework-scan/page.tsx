import { Camera } from "lucide-react";
import HomeworkScanner from "./_components/HomeworkScanner";

export const dynamic = "force-dynamic";

export default function HomeworkScanPage() {
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
