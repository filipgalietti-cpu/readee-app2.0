import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import LeveledWizard from "./_components/LeveledWizard";
import { Sparkles, Layers } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeveledWizardPage() {
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/classroom/leveled"
        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <Layers className="h-3.5 w-3.5" />
        All leveled passages
      </Link>
      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
          <Sparkles className="h-4 w-4" />
          Build with Readee.ai
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Build a leveled passage
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Same topic, three reading levels — easy, on-level, advanced. One
          assignment for a mixed-ability class.
        </p>
      </div>
      <div className="mt-6">
        <LeveledWizard />
      </div>
    </div>
  );
}
