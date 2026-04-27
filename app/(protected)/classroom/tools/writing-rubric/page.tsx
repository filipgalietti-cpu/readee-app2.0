import { ClipboardCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import WritingRubricForm from "./_components/WritingRubricForm";

export const dynamic = "force-dynamic";

export default async function WritingRubricPage() {
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-rose-600">
        <ClipboardCheck className="h-4 w-4" />
        Writing rubric
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Score student writing
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Paste the prompt and the student&apos;s response. Readee scores
        on a CCSS-aligned 1-4 scale (ideas, organization, voice,
        conventions) with a kid-friendly strength + growth tip.
      </p>
      <div className="mt-6">
        <WritingRubricForm />
      </div>
    </div>
  );
}
