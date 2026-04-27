import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import BookWizard from "./_components/BookWizard";
import { Sparkles, BookOpenText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BookWizardPage() {
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/classroom/books"
        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <BookOpenText className="h-3.5 w-3.5" />
        All books
      </Link>
      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
          <Sparkles className="h-4 w-4" />
          Build with Readee.ai
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Build a decodable book
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Pick a phonics pattern your class is working on and we&apos;ll write
          a kid-friendly short book that practices it on every page.
        </p>
      </div>
      <div className="mt-6">
        <BookWizard />
      </div>
    </div>
  );
}
