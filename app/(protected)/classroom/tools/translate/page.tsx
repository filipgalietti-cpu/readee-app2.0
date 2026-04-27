import { Languages } from "lucide-react";
import { requireTeacherTier } from "@/lib/plan/teacher-gate";
import TranslatePlayground from "./_components/TranslatePlayground";

export const dynamic = "force-dynamic";

export default async function TranslateToolPage() {
  await requireTeacherTier({ min: "premium", reason: "translate" });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-fuchsia-600">
        <Languages className="h-4 w-4" />
        Translate
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Translate any passage
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Paste any text — Readee translates into any of 10 languages.
        Cached: the second teacher who asks for the same translation
        gets it instantly + free.
      </p>
      <div className="mt-6">
        <TranslatePlayground />
      </div>
    </div>
  );
}
